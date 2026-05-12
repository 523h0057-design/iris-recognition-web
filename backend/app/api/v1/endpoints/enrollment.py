"""
Enrollment endpoints - Register new iris templates
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import time

from app.core.database import get_db
from app.models.user import User
from app.models.iris_template import IrisTemplate, EyePosition
from app.schemas.iris_template import EnrollmentResponse
from app.services.iris_service import iris_service

router = APIRouter()


@router.post("/", response_model=EnrollmentResponse)
async def enroll_iris(
    user_id: int = Form(...),
    eye_position: EyePosition = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Enroll a new iris template for a user
    
    - **user_id**: ID of the user
    - **eye_position**: left, right, or both
    - **image**: Iris image file (JPEG, PNG)
    """
    
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not active"
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
        
        # Extract iris template using VeriEye SDK
        start_time = time.time()
        template_data, quality_score, metadata = iris_service.extract_template(image_bytes)
        processing_time = int((time.time() - start_time) * 1000)
        
        if template_data is None:
            return EnrollmentResponse(
                success=False,
                message="Failed to extract iris template from image. Please ensure the image contains a clear iris."
            )
        
        # Check quality score
        if quality_score and quality_score < 50:
            return EnrollmentResponse(
                success=False,
                message=f"Iris quality too low (score: {quality_score}/100). Please capture a better image.",
                quality_score=quality_score
            )
        
        # Save template to database
        iris_template = IrisTemplate(
            user_id=user_id,
            template_data=template_data,
            template_size=len(template_data),
            eye_position=eye_position,
            quality_score=quality_score,
            image_width=metadata.get("image_width") if metadata else None,
            image_height=metadata.get("image_height") if metadata else None
        )
        
        db.add(iris_template)
        db.commit()
        db.refresh(iris_template)
        
        return EnrollmentResponse(
            success=True,
            message="Iris template enrolled successfully",
            template_id=iris_template.id,
            quality_score=quality_score,
            template_size=len(template_data)
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing enrollment: {str(e)}"
        )


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    """Delete an iris template"""
    template = db.query(IrisTemplate).filter(IrisTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    db.delete(template)
    db.commit()
    
    return None
