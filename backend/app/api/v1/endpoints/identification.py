"""
Identification endpoints - 1:N iris matching
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import time
from typing import Optional

from app.core.database import get_db
from app.models.iris_template import IrisTemplate
from app.models.identification_log import IdentificationLog
from app.schemas.recognition import IdentificationResponse, IdentificationMatch
from app.services.iris_service import iris_service
from app.core.config import settings

router = APIRouter()


def get_confidence_level(score: float, threshold: float) -> str:
    """Determine confidence level based on score"""
    if score >= threshold + 20:
        return "high"
    elif score >= threshold + 10:
        return "medium"
    elif score >= threshold:
        return "low"
    else:
        return "no_match"


@router.post("/", response_model=IdentificationResponse)
async def identify_iris(
    image: UploadFile = File(...),
    threshold: Optional[float] = Form(None),
    max_results: int = Form(5),
    db: Session = Depends(get_db)
):
    """
    Identify iris against all enrolled templates (1:N matching)
    
    - **image**: Iris image file to identify
    - **threshold**: Optional custom matching threshold (default: 48.0)
    - **max_results**: Maximum number of matches to return (default: 5, max: 20)
    """
    
    start_time = time.time()
    
    # Use default threshold if not provided
    if threshold is None:
        threshold = settings.MATCHING_THRESHOLD
    
    # Validate max_results
    if max_results < 1 or max_results > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="max_results must be between 1 and 20"
        )
    
    # Validate image file
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    try:
        # Read image data
        image_bytes = await image.read()
        
        # Extract template from probe image
        probe_template, quality_score, _ = iris_service.extract_template(image_bytes)
        
        if probe_template is None:
            return IdentificationResponse(
                success=False,
                is_identified=False,
                matches=[],
                total_searched=0,
                processing_time_ms=int((time.time() - start_time) * 1000),
                threshold=threshold,
                message="Failed to extract iris template from image"
            )
        
        # Get all templates from database
        all_templates = db.query(IrisTemplate).all()
        
        if not all_templates:
            return IdentificationResponse(
                success=True,
                is_identified=False,
                matches=[],
                total_searched=0,
                processing_time_ms=int((time.time() - start_time) * 1000),
                threshold=threshold,
                message="No templates in database"
            )
        
        # Prepare gallery templates
        gallery = [(t.id, t.template_data) for t in all_templates]
        
        # Perform identification
        matches = iris_service.identify_template(probe_template, gallery, threshold)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Build response matches
        response_matches = []
        template_id_to_user = {t.id: t.user for t in all_templates}
        
        for rank, (template_id, score) in enumerate(matches[:max_results], 1):
            user = template_id_to_user.get(template_id)
            if user:
                response_matches.append(
                    IdentificationMatch(
                        user_id=user.id,
                        full_name=user.full_name,
                        matching_score=round(score, 2),
                        confidence=get_confidence_level(score, threshold),
                        rank=rank
                    )
                )
        
        is_identified = len(matches) > 0
        
        # Log identification
        log = IdentificationLog(
            matched_user_id=response_matches[0].user_id if response_matches else None,
            is_identified=is_identified,
            matching_score=response_matches[0].matching_score if response_matches else None,
            threshold_used=threshold,
            total_templates_searched=len(all_templates),
            processing_time_ms=processing_time
        )
        db.add(log)
        db.commit()
        
        message = f"Found {len(response_matches)} match(es)" if is_identified else "No matches found"
        
        return IdentificationResponse(
            success=True,
            is_identified=is_identified,
            matches=response_matches,
            total_searched=len(all_templates),
            processing_time_ms=processing_time,
            threshold=threshold,
            message=message
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing identification: {str(e)}"
        )
