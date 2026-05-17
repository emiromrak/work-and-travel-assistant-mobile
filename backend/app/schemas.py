from pydantic import BaseModel

# ==========================================
# 📦 VERİ MODELLERİ (ŞABLONLAR)
# ==========================================
class GuideRequest(BaseModel): city_name: str; topic: str = "general"
class UserCreate(BaseModel): username: str; email: str; password: str; state_city: str = "Avalon, NJ"; job_role: str = "Resort Worker"
class UserLogin(BaseModel): email: str; password: str
class PostCreate(BaseModel): title: str; content: str; user_id: int
class MessageCreate(BaseModel): sender_id: int; receiver_id: int; content: str
