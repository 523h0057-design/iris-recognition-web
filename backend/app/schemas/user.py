"""
User Pydantic schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.iris_template import IrisTemplateResponse


class UserBase(BaseModel):
    """Base user schema"""
    full_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    national_id: Optional[str] = Field(None, max_length=50)


class UserCreate(UserBase):
    """Schema for creating user"""
    pass


class UserUpdate(BaseModel):
    """Schema for updating user"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    national_id: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    template_count: int = 0
    
    class Config:
        from_attributes = True


class UserWithTemplates(UserResponse):
    """User with iris templates"""
    iris_templates: List[IrisTemplateResponse] = Field(default_factory=list)
    
    class Config:
        from_attributes = True
