from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from groq import Groq
import bcrypt

from app.database import get_db
from app.models import User, Post, Message
from app.schemas import GuideRequest, UserCreate, UserLogin, PostCreate, MessageCreate, UserProfileUpdate

# --- DELTA ARAÇLARI ---
try:
    from app.delta_tools import (
        dolar_kuru_cek, para_cevir, mesafe_ve_koordinat_bul, wat_rehberi_getir
    )
except ImportError:
    def dolar_kuru_cek(): return "32.50"
    def para_cevir(m, k, y): return f"{m * float(k)} TL"
    def mesafe_ve_koordinat_bul(h): return {"durum": True, "mesafe": "8500", "benim_sehir": "Lüleburgaz"}
    def wat_rehberi_getir(s): return {"ozet": "Harika bir yer!"}

# --- GROQ AYARLARI ---
load_dotenv()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# --- ROUTER ---
router = APIRouter(prefix="/api")


# ==========================================
# 🛠️ DELTA ARAÇLARI API (AI, Döviz, Harita)
# ==========================================
@router.post("/ai-guide")
async def get_city_guide(request: GuideRequest):
    if not groq_client: return {"status": "mock", "ai_advice": "🚨 API Key Yok!"}
    completion = groq_client.chat.completions.create(messages=[{"role": "system", "content": "Sen W&T rehberisin."}, {"role": "user", "content": f"{request.city_name} hakkında {request.topic} tavsiyesi ver."}], model="llama3-8b-8192")
    return {"status": "success", "ai_advice": completion.choices[0].message.content}

@router.get("/currency")
async def get_currency(miktar: float = 1, yon: str = "USD_TO_TRY"):
    return {"status": "success", "calculated_amount": para_cevir(miktar, dolar_kuru_cek(), yon)}

@router.get("/distance")
async def get_distance(target_city: str):
    return mesafe_ve_koordinat_bul(target_city)


# ==========================================
# 👥 SOSYAL AĞ API: KULLANICI İŞLEMLERİ
# ==========================================
@router.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı!")
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), salt).decode('utf-8')
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_pw, state_city=user.state_city, job_role=user.job_role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "message": f"Hoş geldin {new_user.username}!", "user_id": new_user.id}

@router.post("/login")
async def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not bcrypt.checkpw(credentials.password.encode('utf-8'), user.hashed_password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Email veya şifre yanlış!")
    return {
        "status": "success", 
        "message": f"Tekrar hoş geldin {user.username}!", 
        "user_id": user.id,
        "profile_pic": user.profile_pic
    }

@router.get("/users/{user_id}")
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")
    return {
        "status": "success",
        "data": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "state_city": user.state_city,
            "job_role": user.job_role,
            "profile_pic": user.profile_pic
        }
    }

@router.put("/users/{user_id}/profile-pic")
async def update_profile_pic(user_id: int, update_data: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")
    
    user.profile_pic = update_data.profile_pic
    db.commit()
    return {"status": "success", "message": "Profil fotoğrafı başarıyla güncellendi!"}


# ==========================================
# 🌍 SOSYAL AĞ API: FLOW (AKIŞ)
# ==========================================
@router.post("/posts")
async def create_post(post: PostCreate, db: Session = Depends(get_db)):
    if not db.query(User).filter(User.id == post.user_id).first(): raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")
    new_post = Post(title=post.title, content=post.content, user_id=post.user_id)
    db.add(new_post)
    db.commit()
    return {"status": "success", "message": "Gönderi paylaşıldı!"}

@router.get("/posts")
async def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.id.desc()).all()
    return {"status": "success", "data": [{"id": p.id, "title": p.title, "content": p.content, "user_id": p.user_id} for p in posts]}


# ==========================================
# 💬 SOSYAL AĞ API: DM / MESAJLAŞMA
# ==========================================
@router.post("/messages")
async def send_message(msg: MessageCreate, db: Session = Depends(get_db)):
    if not db.query(User).filter(User.id == msg.sender_id).first() or not db.query(User).filter(User.id == msg.receiver_id).first():
        raise HTTPException(status_code=404, detail="Kullanıcılar sistemde bulunamadı!")
    new_message = Message(sender_id=msg.sender_id, receiver_id=msg.receiver_id, content=msg.content)
    db.add(new_message)
    db.commit()
    return {"status": "success", "message": "Mesaj iletildi! 🚀"}

@router.get("/messages/{user1_id}/{user2_id}")
async def get_conversation(user1_id: int, user2_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        ((Message.sender_id == user1_id) & (Message.receiver_id == user2_id)) | ((Message.sender_id == user2_id) & (Message.receiver_id == user1_id))
    ).order_by(Message.id.asc()).all()
    return {"status": "success", "data": [{"id": m.id, "sender_id": m.sender_id, "receiver_id": m.receiver_id, "content": m.content} for m in messages]}
