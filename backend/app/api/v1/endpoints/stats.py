"""
Statistics endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User
from app.models.iris_template import IrisTemplate
from app.models.verification_log import VerificationLog
from app.models.identification_log import IdentificationLog

router = APIRouter()


@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    
    # User stats
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Template stats
    total_templates = db.query(IrisTemplate).count()
    
    # Verification stats
    total_verifications = db.query(VerificationLog).count()
    successful_verifications = db.query(VerificationLog).filter(
        VerificationLog.is_match == True
    ).count()
    
    # Identification stats
    total_identifications = db.query(IdentificationLog).count()
    successful_identifications = db.query(IdentificationLog).filter(
        IdentificationLog.is_identified == True
    ).count()
    
    # Last 24 hours
    last_24h = datetime.utcnow() - timedelta(hours=24)
    
    verifications_24h = db.query(VerificationLog).filter(
        VerificationLog.created_at >= last_24h
    ).count()
    
    identifications_24h = db.query(IdentificationLog).filter(
        IdentificationLog.created_at >= last_24h
    ).count()
    
    # Average processing times
    avg_verification_time = db.query(
        func.avg(VerificationLog.processing_time_ms)
    ).scalar() or 0
    
    avg_identification_time = db.query(
        func.avg(IdentificationLog.processing_time_ms)
    ).scalar() or 0
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users
        },
        "templates": {
            "total": total_templates,
            "average_per_user": round(total_templates / total_users, 2) if total_users > 0 else 0
        },
        "verifications": {
            "total": total_verifications,
            "successful": successful_verifications,
            "success_rate": round(successful_verifications / total_verifications * 100, 2) if total_verifications > 0 else 0,
            "last_24h": verifications_24h,
            "avg_processing_time_ms": round(avg_verification_time, 2)
        },
        "identifications": {
            "total": total_identifications,
            "successful": successful_identifications,
            "success_rate": round(successful_identifications / total_identifications * 100, 2) if total_identifications > 0 else 0,
            "last_24h": identifications_24h,
            "avg_processing_time_ms": round(avg_identification_time, 2)
        }
    }


@router.get("/recent-activity")
def get_recent_activity(limit: int = 10, db: Session = Depends(get_db)):
    """Get recent verification and identification activity"""
    
    # Recent verifications
    recent_verifications = db.query(VerificationLog).order_by(
        VerificationLog.created_at.desc()
    ).limit(limit).all()
    
    # Recent identifications
    recent_identifications = db.query(IdentificationLog).order_by(
        IdentificationLog.created_at.desc()
    ).limit(limit).all()
    
    return {
        "verifications": [
            {
                "id": v.id,
                "user_id": v.user_id,
                "is_match": v.is_match,
                "score": v.matching_score,
                "timestamp": v.created_at
            }
            for v in recent_verifications
        ],
        "identifications": [
            {
                "id": i.id,
                "matched_user_id": i.matched_user_id,
                "is_identified": i.is_identified,
                "score": i.matching_score,
                "templates_searched": i.total_templates_searched,
                "timestamp": i.created_at
            }
            for i in recent_identifications
        ]
    }
