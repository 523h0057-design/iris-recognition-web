"""Iris recognition service - OpenCV test implementation"""
import time
from typing import Optional, Tuple, List
import io

import cv2
import numpy as np
from PIL import Image

from app.core.config import settings


class IrisRecognitionService:
    """Service for iris recognition operations using OpenCV (testing only)."""
    
    def __init__(self):
        """Initialize service"""
        self.initialized = True
    
    def extract_template(self, image_bytes: bytes) -> Tuple[Optional[bytes], Optional[int], Optional[dict]]:
        """
        Extract iris template from image
        
        Args:
            image_bytes: Image data in bytes
            
        Returns:
            Tuple of (template_data, quality_score, metadata)
        """
        start_time = time.time()
        
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes))
            img_array = np.array(image)
            
            template_data = self._opencv_extract_template(img_array)
            quality_score = self._opencv_quality_score(img_array)
            
            processing_time = int((time.time() - start_time) * 1000)
            
            metadata = {
                "image_width": image.width,
                "image_height": image.height,
                "processing_time_ms": processing_time
            }
            
            return template_data, quality_score, metadata
            
        except Exception as e:
            print(f"Error extracting template: {e}")
            return None, None, None
    
    def verify_templates(self, template1: bytes, template2: bytes) -> Tuple[float, bool]:
        """
        Verify two iris templates (1:1 matching)
        
        Args:
            template1: First template
            template2: Second template
            
        Returns:
            Tuple of (matching_score, is_match)
        """
        try:
            score = self._opencv_match_templates(template1, template2)
            is_match = score >= settings.MATCHING_THRESHOLD
            
            return score, is_match
            
        except Exception as e:
            print(f"Error verifying templates: {e}")
            return 0.0, False
    
    def identify_template(
        self, 
        probe_template: bytes, 
        gallery_templates: List[Tuple[int, bytes]],
        threshold: Optional[float] = None
    ) -> List[Tuple[int, float]]:
        """
        Identify iris template against gallery (1:N matching)
        
        Args:
            probe_template: Template to identify
            gallery_templates: List of (template_id, template_data) tuples
            threshold: Matching threshold (optional)
            
        Returns:
            List of (template_id, score) tuples sorted by score descending
        """
        if threshold is None:
            threshold = settings.MATCHING_THRESHOLD
        
        matches = []
        
        try:
            for template_id, gallery_template in gallery_templates:
                score = self._opencv_match_templates(probe_template, gallery_template)
                
                if score >= threshold:
                    matches.append((template_id, score))
            
            # Sort by score descending
            matches.sort(key=lambda x: x[1], reverse=True)
            
            return matches
            
        except Exception as e:
            print(f"Error identifying template: {e}")
            return []
    
    # OpenCV test methods (deterministic)

    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Normalize image to a grayscale matrix."""
        if image.ndim == 3:
            if image.shape[2] == 4:
                gray = cv2.cvtColor(image, cv2.COLOR_RGBA2GRAY)
            else:
                gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image

        gray = cv2.resize(gray, (64, 64), interpolation=cv2.INTER_AREA)
        gray = cv2.equalizeHist(gray)
        return gray

    def _opencv_extract_template(self, image: np.ndarray) -> bytes:
        """Create a deterministic perceptual hash template using DCT."""
        gray = self._preprocess_image(image)
        small = cv2.resize(gray, (32, 32), interpolation=cv2.INTER_AREA)
        dct = cv2.dct(np.float32(small))
        dct_low = dct[:16, :16]
        median = np.median(dct_low[1:, 1:])
        bits = (dct_low > median).astype(np.uint8).flatten()
        packed = np.packbits(bits)
        return packed.tobytes()

    def _opencv_quality_score(self, image: np.ndarray) -> int:
        """Estimate image quality from sharpness and contrast."""
        gray = self._preprocess_image(image)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        contrast = float(gray.std())

        sharpness_norm = min(sharpness, 1000.0) / 1000.0
        contrast_norm = min(contrast, 128.0) / 128.0

        score = int(50 + 50 * (0.6 * sharpness_norm + 0.4 * contrast_norm))
        return max(0, min(100, score))

    def _opencv_match_templates(self, template1: bytes, template2: bytes) -> float:
        """Compare two templates using Hamming distance."""
        length = min(len(template1), len(template2))
        if length == 0:
            return 0.0

        diff_bits = 0
        for b1, b2 in zip(template1[:length], template2[:length]):
            diff_bits += (b1 ^ b2).bit_count()

        total_bits = length * 8
        score = 100.0 * (1.0 - (diff_bits / total_bits))
        return max(0.0, min(100.0, score))


# Singleton instance
iris_service = IrisRecognitionService()
