"""
User database model
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), nullable=True)
    national_id = Column(String(50), unique=True, index=True, nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    iris_templates = relationship("IrisTemplate", back_populates="user", cascade="all, delete-orphan")
    verification_logs = relationship("VerificationLog", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, name={self.full_name})>"
