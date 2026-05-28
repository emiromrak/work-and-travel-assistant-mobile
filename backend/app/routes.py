from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
import base64
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from groq import Groq
import bcrypt
from supabase import create_client, Client
import time
import io
from cryptography.fernet import Fernet, InvalidToken

from app.database import get_db
from app.models import User, Post, Message, Friendship
from app.schemas import GuideRequest, UserCreate, UserLogin, PostCreate, MessageCreate, UserProfileUpdate

# Supabase Storage Ayarları
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# 🔐 Mesaj Şifreleme Ayarları (Fernet / AES-128-CBC)
# ENCRYPTION_KEY: Fernet.generate_key() ile üretilmiş base64 key (32 byte)
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")
cipher_suite: Fernet | None = Fernet(ENCRYPTION_KEY.encode()) if ENCRYPTION_KEY else None

def encrypt_text(text: str) -> str:
    """Metni Fernet ile şifreler. cipher_suite yoksa düz metin döner."""
    if not cipher_suite:
        return text
    return cipher_suite.encrypt(text.encode("utf-8")).decode("utf-8")

def decrypt_text(token: str) -> str:
    """Fernet token'ını çözer. Hata olursa düz metni döner (eski kayıtlar)."""
    if not cipher_suite:
        return token
    try:
        return cipher_suite.decrypt(token.encode("utf-8")).decode("utf-8")
    except (InvalidToken, Exception):
        # Şifrelenmemiş eski kayıtlar için güvenli geri dönüş
        return token


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

from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate limiter tanımı
limiter = Limiter(key_func=get_remote_address)


# ==========================================
# 🛠️ DELTA ARAÇLARI API (AI, Döviz, Harita)
# ==========================================
@router.post("/ai-guide")
async def get_city_guide(request: GuideRequest):
    if not groq_client: return {"status": "mock", "ai_advice": "🚨 API Key Yok!"}
    completion = groq_client.chat.completions.create(messages=[{"role": "system", "content": "Sen W&T rehberisin."}, {"role": "user", "content": f"{request.city_name} hakkında {request.topic} tavsiyesi ver."}], model="llama-3.1-8b-instant")
    return {"status": "success", "ai_advice": completion.choices[0].message.content}

@router.get("/currency")
async def get_currency(miktar: float = 1, yon: str = "USD_TO_TRY"):
    return {"status": "success", "calculated_amount": para_cevir(miktar, dolar_kuru_cek(), yon)}

@router.get("/distance")
async def get_distance(target_city: str, my_city: str = None):
    return mesafe_ve_koordinat_bul(target_city, my_city)

@router.get("/city-suggestions")
async def get_city_suggestions(q: str):
    """Kullanıcının yazdığı metne göre dünya genelinden şehir önerileri döndürür."""
    from app.delta_tools import onerileri_getir
    if len(q) < 2:
        return {"suggestions": []}
    suggestions = onerileri_getir(q)
    return {"suggestions": suggestions[:8]}


# ==========================================
# 👥 SOSYAL AĞ API: KULLANICI İŞLEMLERİ
# ==========================================
@router.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı!")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış!")
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), salt).decode('utf-8')
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_pw, state_city=user.state_city, job_role=user.job_role, start_city=user.start_city)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "message": f"Hoş geldin {new_user.username}!", "user_id": new_user.id}

@router.post("/login")
@limiter.limit("5/minute")
async def login_user(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    # 🛡️ Rate limiting: aynı IP'den 1 dakikada max 5 giriş denemesi decorator ile sağlandı.
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not bcrypt.checkpw(credentials.password.encode('utf-8'), user.hashed_password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Email veya şifre yanlış!")
    return {
        "status": "success", 
        "message": f"Tekrar hoş geldin {user.username}!", 
        "user_id": user.id,
        "profile_pic": user.profile_pic,
        "state_city": user.state_city,
        "job_role": user.job_role,
        "start_city": user.start_city
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

@router.get("/users")
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {
        "status": "success",
        "data": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "state_city": u.state_city,
                "job_role": u.job_role,
                "profile_pic": u.profile_pic
            } for u in users
        ]
    }

@router.put("/users/{user_id}")
async def update_user_profile(user_id: int, profile: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")
    
    if profile.state_city is not None:
        user.state_city = profile.state_city
    if profile.job_role is not None:
        user.job_role = profile.job_role
    if profile.profile_pic is not None:
        user.profile_pic = profile.profile_pic
    if profile.start_city is not None:
        user.start_city = profile.start_city
        
    db.commit()
    db.refresh(user)
    return {
        "status": "success",
        "message": "Profil bilgileri güncellendi!",
        "data": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "state_city": user.state_city,
            "job_role": user.job_role,
            "profile_pic": user.profile_pic,
            "start_city": user.start_city
        }
    }

@router.put("/users/{user_id}/profile-pic")
async def update_profile_pic(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase Storage ayarları eksik!")

    try:
        contents = await file.read()
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"user_{user_id}_{int(time.time())}.{file_extension}"

        # Supabase'e fırlat
        supabase.storage.from_("avatars").upload(
            path=unique_filename,
            file=contents,
            file_options={"content-type": file.content_type}
        )
        
        # URL'yi al ve DB'ye kaydet
        public_url = supabase.storage.from_("avatars").get_public_url(unique_filename)
        user.profile_pic = public_url
        db.commit()
        
        return {"status": "success", "message": "Profil fotoğrafı yüklendi!", "profile_pic": user.profile_pic}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fotoğraf yüklenirken hata oluştu: {str(e)}")

# ==========================================
# 🌍 SOSYAL AĞ API: FLOW (AKIŞ)
# ==========================================
@router.post("/posts")
async def create_post(
    user_id: int = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    location_name: str = Form(None),
    lat: float = Form(None),
    lng: float = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    if not db.query(User).filter(User.id == user_id).first():
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")

    image_url = None
    if file and file.filename:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase Storage ayarları eksik!")
        try:
            contents = await file.read()
            file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            unique_filename = f"post_{user_id}_{int(time.time())}.{file_extension}"
            supabase.storage.from_("flow_images").upload(
                path=unique_filename,
                file=contents,
                file_options={"content-type": file.content_type or "image/jpeg"}
            )
            image_url = supabase.storage.from_("flow_images").get_public_url(unique_filename)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Fotoğraf yüklenirken hata: {str(e)}")

    new_post = Post(
        title=title,
        content=content,
        user_id=user_id,
        image_url=image_url,
        location_name=location_name,
        latitude=lat,
        longitude=lng,
    )
    db.add(new_post)
    db.commit()
    return {"status": "success", "message": "Gönderi paylaşıldı!"}

@router.get("/posts")
async def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.id.desc()).all()
    return {
        "status": "success", 
        "data": [
            {
                "id": p.id, 
                "title": p.title, 
                "content": p.content, 
                "user_id": p.user_id,
                "username": p.author.username if p.author else "Bilinmeyen Kullanıcı",
                "profile_pic": p.author.profile_pic if p.author else None,
                "image_url": p.image_url,
                "location_name": p.location_name,
                "latitude": p.latitude,
                "longitude": p.longitude,
            } for p in posts
        ]
    }


# ==========================================
# 💬 SOSYAL AĞ API: DM / MESAJLAŞMA
# ==========================================
@router.post("/messages")
async def send_message(
    sender_id: int = Form(...),
    receiver_id: int = Form(...),
    content: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    if not db.query(User).filter(User.id == sender_id).first() or not db.query(User).filter(User.id == receiver_id).first():
        raise HTTPException(status_code=404, detail="Kullanıcılar sistemde bulunamadı!")

    # 🔐 Mesaj içeriğini şifrele
    encrypted_content = encrypt_text(content)

    # 📸 Gizli kovaya yükle; sadece dosya yolunu sakla
    image_path = None
    if file and file.filename:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase Storage ayarları eksik!")
        try:
            contents = await file.read()
            file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            unique_filename = f"chat_{sender_id}_{int(time.time())}.{file_extension}"
            supabase.storage.from_("chat_images").upload(
                path=unique_filename,
                file=contents,
                file_options={"content-type": file.content_type or "image/jpeg"}
            )
            # ✅ Public URL YOK: sadece dosya yolunu kaydet
            image_path = unique_filename
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Fotoğraf yüklenirken hata: {str(e)}")

    new_message = Message(sender_id=sender_id, receiver_id=receiver_id, content=encrypted_content, image_url=image_path)
    db.add(new_message)
    db.commit()
    return {"status": "success", "message": "Mesaj iletildi! 🚀"}

@router.get("/messages/{user1_id}/{user2_id}")
async def get_conversation(user1_id: int, user2_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        ((Message.sender_id == user1_id) & (Message.receiver_id == user2_id)) | ((Message.sender_id == user2_id) & (Message.receiver_id == user1_id))
    ).order_by(Message.id.asc()).all()
    result = []
    for m in messages:
        # 🔓 Şifreli içeriği çöz
        decrypted_content = decrypt_text(m.content)

        # 🔗 Gizli kovadaki fotoğraf için 60 saniyelik geçici signed URL üret
        signed_image_url = None
        if m.image_url and supabase:
            try:
                signed = supabase.storage.from_("chat_images").create_signed_url(m.image_url, 60)
                signed_image_url = signed.get("signedURL") or signed.get("signedUrl")
            except Exception:
                signed_image_url = None

        result.append({
            "id": m.id,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "content": decrypted_content,
            "image_url": signed_image_url,
        })
    return {"status": "success", "data": result}


# ==========================================
# 🤝 SOSYAL AĞ API: ARKADAŞLIK SİSTEMİ
# ==========================================

@router.post("/users/{user_id}/friends/request")
async def send_friend_request(user_id: int, receiver_id: int, db: Session = Depends(get_db)):
    """
    📨 Arkadaşlık isteği gönder.
    - user_id: isteği atan kullanıcı
    - receiver_id: isteği alan kullanıcı (query param)
    """
    if user_id == receiver_id:
        raise HTTPException(status_code=400, detail="Kendinize arkadaşlık isteği atamassınız!")

    if not db.query(User).filter(User.id == receiver_id).first():
        raise HTTPException(status_code=404, detail="Hedef kullanıcı bulunamadı!")

    # Daha önce istek atılmış veya zaten arkadaş mı?
    existing = db.query(Friendship).filter(
        (
            (Friendship.requester_id == user_id) & (Friendship.receiver_id == receiver_id)
        ) | (
            (Friendship.requester_id == receiver_id) & (Friendship.receiver_id == user_id)
        )
    ).first()

    if existing:
        if existing.status == "accepted":
            raise HTTPException(status_code=400, detail="Zaten arkadaşsınız!")
        elif existing.status == "pending":
            raise HTTPException(status_code=400, detail="Zaten bekleyen bir arkadaşlık isteği mevcut!")
        elif existing.status == "rejected":
            # Reddedilmiş eskiyi yenile
            existing.status = "pending"
            existing.requester_id = user_id
            existing.receiver_id = receiver_id
            db.commit()
            return {"status": "success", "message": "Arkadaşlık isteği yeniden gönderildi!"}

    friendship = Friendship(requester_id=user_id, receiver_id=receiver_id, status="pending")
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    return {"status": "success", "message": "Arkadaşlık isteği gönderildi!", "friendship_id": friendship.id}


@router.get("/users/{user_id}/friends/requests")
async def get_friend_requests(user_id: int, db: Session = Depends(get_db)):
    """
    📥 Bekleyen (pending) arkadaşlık isteklerini getir.
    Sadece bu kullanıcıyı hedef alan (receiver) istekler döner.
    """
    requests = db.query(Friendship).filter(
        Friendship.receiver_id == user_id,
        Friendship.status == "pending"
    ).all()

    data = []
    for req in requests:
        r = req.requester
        data.append({
            "friendship_id": req.id,
            "created_at": req.created_at,
            "requester": {
                "id": r.id,
                "username": r.username,
                "profile_pic": r.profile_pic,
                "state_city": r.state_city,
                "job_role": r.job_role,
            }
        })

    return {"status": "success", "data": data}


@router.put("/users/{user_id}/friends/{friendship_id}")
async def respond_friend_request(user_id: int, friendship_id: int, action: str, db: Session = Depends(get_db)):
    """
    ✅ Arkadaşlık isteğine yanıt ver.
    - action: "accepted" veya "rejected"
    Sadece isteğin alıcısı (receiver) bu işlemi yapabilir.
    """
    if action not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Geçersiz işlem! 'accepted' veya 'rejected' gönder.")

    friendship = db.query(Friendship).filter(Friendship.id == friendship_id).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Arkadaşlık isteği bulunamadı!")
    if friendship.receiver_id != user_id:
        raise HTTPException(status_code=403, detail="Bu isteği yanıtlama yetkiniz yok!")
    if friendship.status != "pending":
        raise HTTPException(status_code=400, detail="Bu istek zaten yanıtlanmış!")

    friendship.status = action
    db.commit()

    msg = "🎉 Arkadaşlık kabul edildi!" if action == "accepted" else "🚫 İstek reddedildi."
    return {"status": "success", "message": msg, "new_status": action}


@router.get("/users/{user_id}/friends")
async def get_friends_list(user_id: int, db: Session = Depends(get_db)):
    """
    👥 Kabul edilmiş (accepted) arkadaş listesini getir.
    Kullanıcının hem requester hem receiver olduğu tüm accepted kayıtlar döner.
    """
    friendships = db.query(Friendship).filter(
        (
            (Friendship.requester_id == user_id) | (Friendship.receiver_id == user_id)
        ),
        Friendship.status == "accepted"
    ).all()

    friends = []
    for f in friendships:
        # Karşı tarafı bul
        friend = f.receiver if f.requester_id == user_id else f.requester
        friends.append({
            "friendship_id": f.id,
            "friend": {
                "id": friend.id,
                "username": friend.username,
                "profile_pic": friend.profile_pic,
                "state_city": friend.state_city,
                "job_role": friend.job_role,
                "start_city": friend.start_city,
            }
        })

    return {"status": "success", "count": len(friends), "data": friends}


# ==========================================
# 🗑️ HESAP SİLME (Apple & Google Zorunluluğu)
# ==========================================
@router.delete("/users/{user_id}")
async def delete_account(user_id: int, db: Session = Depends(get_db)):
    """
    Kullanıcının hesabını ve tüm ilişkili verilerini siler.
    Apple App Store 2023+ ve Google Play politikası gereği zorunludur.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")

    # 1️⃣ Kullanıcının gönderdiği / aldığı tüm mesajları sil
    db.query(Message).filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).delete(synchronize_session=False)

    # 2️⃣ Kullanıcının arkadaşlık kayıtlarını sil
    db.query(Friendship).filter(
        (Friendship.requester_id == user_id) | (Friendship.receiver_id == user_id)
    ).delete(synchronize_session=False)

    # 2️⃣ Kullanıcının gönderilerini sil
    db.query(Post).filter(Post.user_id == user_id).delete(synchronize_session=False)

    # 3️⃣ Supabase'deki profil fotoğrafını sil (varsa)
    if supabase and user.profile_pic:
        try:
            # URL'den dosya adını çıkar
            filename = user.profile_pic.split("/")[-1]
            supabase.storage.from_("avatars").remove([filename])
        except Exception:
            pass  # Silme başarısız olsa bile devam et

    # 4️⃣ Kullanıcıyı sil
    db.delete(user)
    db.commit()

    return {
        "status": "success",
        "message": "Hesabın ve tüm verilerin kalıcı olarak silindi. Görüşmek üzere! 👋"
    }
