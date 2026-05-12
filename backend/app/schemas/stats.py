"""
Statistics schemas
"""
from pydantic import BaseModel
from typing import Dict, Any


class DashboardStats(BaseModel):
    """Dashboard statistics schema"""
    users: Dict[str, Any]
    templates: Dict[str, Any]
    verifications: Dict[str, Any]
    identifications: Dict[str, Any]


class RecentActivity(BaseModel):
    """Recent activity schema"""
    verifications: list
    identifications: list
