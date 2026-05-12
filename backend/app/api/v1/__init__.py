"""
API v1 router
"""
from fastapi import APIRouter

from app.api.v1.endpoints import users, enrollment, verification, identification, stats

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(enrollment.router, prefix="/enrollment", tags=["Enrollment"])
api_router.include_router(verification.router, prefix="/verification", tags=["Verification"])
api_router.include_router(identification.router, prefix="/identification", tags=["Identification"])
api_router.include_router(stats.router, prefix="/stats", tags=["Statistics"])
