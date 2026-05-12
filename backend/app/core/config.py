"""
Application configuration
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Iris Recognition API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://iris_user:iris_password@localhost:5432/iris_recognition_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    
    # VeriEye SDK
    VERIEYE_SDK_PATH: str = ""
    VERIEYE_LICENSE_PATH: str = ""
    
    # Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "./uploads"
    
    # Iris Recognition Settings
    MATCHING_THRESHOLD: float = 55.0  # Adjusted threshold
    MAX_TEMPLATE_SIZE: int = 2048  # bytes
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
