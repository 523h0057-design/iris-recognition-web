"""
Verification endpoints - 1:1 iris matching
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import time

from app.core.database import get_db
from app.models.user import User
from app.models.iris_template import IrisTemplate
from app.models.verification_log import VerificationLog
from app.schemas.recognition import VerificationResponse
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


@router.post("/", response_model=VerificationResponse)
async def verify_iris(
    user_id: int = Form(...),
    image: UploadFile = File(...),
    threshold: float = Form(None),
    db: Session = Depends(get_db)
):
    """
    Verify iris against a specific user's templates (1:1 matching)
    
    - **user_id**: ID of the user to verify against
    - **image**: Iris image file to verify
    - **threshold**: Optional custom matching threshold (default: 48.0)
    """
    
    start_time = time.time()
    
    # Use default threshold if not provided
    if threshold is None:
        threshold = settings.MATCHING_THRESHOLD
    
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user has templates
    if not user.iris_templates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no enrolled iris templates"
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
            return VerificationResponse(
                success=False,
                is_match=False,
                matching_score=0.0,
                threshold=threshold,
                confidence="no_match",
                processing_time_ms=int((time.time() - start_time) * 1000),
                message="Failed to extract iris template from image"
            )
        
        # Match against all user's templates
        best_score = 0.0
        is_match = False
        
        for template in user.iris_templates:
            score, match = iris_service.verify_templates(probe_template, template.template_data)
            if score > best_score:
                best_score = score
                is_match = match
        
        processing_time = int((time.time() - start_time) * 1000)
        confidence = get_confidence_level(best_score, threshold)
        
        # Log verification
        log = VerificationLog(
            user_id=user_id,
            is_match=is_match,
            matching_score=best_score,
            threshold_used=threshold,
            processing_time_ms=processing_time
        )
        db.add(log)
        db.commit()
        
        message = "Verification successful - Match found" if is_match else "Verification complete - No match"
        
        return VerificationResponse(
            success=True,
            is_match=is_match,
            matching_score=round(best_score, 2),
            threshold=threshold,
            confidence=confidence,
            processing_time_ms=processing_time,
            message=message
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing verification: {str(e)}"
        )
