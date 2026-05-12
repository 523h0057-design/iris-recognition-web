"""
Recognition (Verification & Identification) schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class VerificationRequest(BaseModel):
    """Schema for verification request (1:1)"""
    user_id: int
    # Image will be sent as multipart/form-data


class VerificationResponse(BaseModel):
    """Schema for verification response"""
    success: bool
    is_match: bool
    matching_score: float
    threshold: float
    confidence: str  # "high", "medium", "low"
    processing_time_ms: int
    message: str


class IdentificationRequest(BaseModel):
    """Schema for identification request (1:N)"""
    threshold: Optional[float] = Field(None, description="Custom matching threshold")
    max_results: Optional[int] = Field(5, ge=1, le=20, description="Maximum number of results")
    # Image will be sent as multipart/form-data


class IdentificationMatch(BaseModel):
    """Single identification match result"""
    user_id: int
    full_name: str
    matching_score: float
    confidence: str
    rank: int


class IdentificationResponse(BaseModel):
    """Schema for identification response"""
    success: bool
    is_identified: bool
    matches: List[IdentificationMatch] = []
    total_searched: int
    processing_time_ms: int
    threshold: float
    message: str


class RecognitionStats(BaseModel):
    """Recognition statistics"""
    total_verifications: int
    total_identifications: int
    successful_verifications: int
    successful_identifications: int
    average_processing_time_ms: float
    last_24h_verifications: int
    last_24h_identifications: int
