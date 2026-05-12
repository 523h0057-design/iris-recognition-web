"""Verification log model"""
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class VerificationLog(Base):
    """Verification log model - 1:1 matching"""
    __tablename__ = "verification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Verification result
    is_match = Column(Boolean, nullable=False)
    matching_score = Column(Float, nullable=False)
    threshold_used = Column(Float, nullable=False)
    
    # Metadata
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="verification_logs")
    
    def __repr__(self):
        return f"<VerificationLog(id={self.id}, match={self.is_match}, score={self.matching_score})>"
