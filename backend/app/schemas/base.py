"""
Base schemas
"""
from pydantic import BaseModel


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
    error_code: str = "ERROR"
