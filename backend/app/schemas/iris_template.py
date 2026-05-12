"""
Iris template Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.iris_template import EyePosition


class IrisTemplateBase(BaseModel):
    """Base iris template schema"""
    eye_position: EyePosition
    quality_score: Optional[int] = Field(None, ge=0, le=100)


class IrisTemplateCreate(IrisTemplateBase):
    """Schema for creating iris template"""
    user_id: int
    template_data: bytes
    template_size: int
    image_width: Optional[int] = None
    image_height: Optional[int] = None


class IrisTemplateResponse(IrisTemplateBase):
    """Schema for iris template response"""
    id: int
    user_id: int
    template_size: int
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class EnrollmentRequest(BaseModel):
    """Schema for enrollment request"""
    user_id: int
    eye_position: EyePosition
    # Image will be sent as multipart/form-data


class EnrollmentResponse(BaseModel):
    """Schema for enrollment response"""
    success: bool
    message: str
    template_id: Optional[int] = None
    quality_score: Optional[int] = None
    template_size: Optional[int] = None
