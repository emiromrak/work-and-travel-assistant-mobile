from pydantic import BaseModel
from typing import Optional

# ==========================================
# 📦 VERİ MODELLERİ (ŞABLONLAR)
# ==========================================
class GuideRequest(BaseModel): city_name: str; topic: str = "general"
class UserCreate(BaseModel): username: str; email: str; password: str; state_city: str = "Avalon, NJ"; job_role: str = "Resort Worker"
class UserLogin(BaseModel): email: str; password: str
class UserProfileUpdate(BaseModel):
    profile_pic: Optional[str] = None
    state_city: Optional[str] = None
    job_role: Optional[str] = None
class PostCreate(BaseModel): title: str; content: str; user_id: int
class MessageCreate(BaseModel): sender_id: int; receiver_id: int; content: str
