"""
Iris template database model
"""
from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class EyePosition(str, enum.Enum):
    """Eye position enum"""
    LEFT = "left"
    RIGHT = "right"
    BOTH = "both"


class IrisTemplate(Base):
    """Iris template model - stores binary template data"""
    __tablename__ = "iris_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Template data (binary)
    template_data = Column(LargeBinary, nullable=False)
    template_size = Column(Integer, nullable=False)
    
    # Metadata
    eye_position = Column(SQLEnum(EyePosition), nullable=False)
    quality_score = Column(Integer, nullable=True)  # 0-100
    
    # Image metadata (optional - for reference)
    image_width = Column(Integer, nullable=True)
    image_height = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="iris_templates")
    
    def __repr__(self):
        return f"<IrisTemplate(id={self.id}, user_id={self.user_id}, eye={self.eye_position})>"
