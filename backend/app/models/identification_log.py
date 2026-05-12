"""
Identification log model
"""
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class IdentificationLog(Base):
    """Identification log model - 1:N matching"""
    __tablename__ = "identification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identification result
    matched_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_identified = Column(Boolean, nullable=False)
    matching_score = Column(Float, nullable=True)
    threshold_used = Column(Float, nullable=False)
    
    # Search metadata
    total_templates_searched = Column(Integer, nullable=False)
    processing_time_ms = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    matched_user = relationship("User", foreign_keys=[matched_user_id])
    
    def __repr__(self):
        return f"<IdentificationLog(id={self.id}, identified={self.is_identified})>"
