from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# 👥 KULLANICILAR TABLOSU (J1 Öğrencileri)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String) # Şifreler düz metin olarak ASLA tutulmaz!
    
    # W&T Özel Alanları
    state_city = Column(String, default="Avalon, NJ") # Gideceği yer
    job_role = Column(String, default="Resort Worker") # Mesleği
    profile_pic = Column(String, nullable=True) # Profil resmi (Base64)
    start_city = Column(String, default="Istanbul, TR") # Başlangıç şehri
    
    
    # Kullanıcının attığı gönderilerle (Post) arasındaki bağ
    posts = relationship("Post", back_populates="author")

    # 🤝 Arkadaşlık ilişkileri
    sent_requests = relationship("Friendship", foreign_keys="Friendship.requester_id", back_populates="requester")
    received_requests = relationship("Friendship", foreign_keys="Friendship.receiver_id", back_populates="receiver")

# 🌍 FLOW (AKIŞ) TABLOSU (Parti, İlan ve Muhabbetler)
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 📸 Medya & Konum Alanları
    image_url = Column(String, nullable=True)       # Görselin Supabase public URL'i
    location_name = Column(String, nullable=True)   # Şehir / yer adı
    latitude = Column(Float, nullable=True)         # Enlem
    longitude = Column(Float, nullable=True)        # Boylam
    
    # Bu gönderiyi hangi kullanıcı attı? (Users tablosundaki ID'ye bağlanır)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Gönderinin sahibiyle olan bağ
    author = relationship("User", back_populates="posts")





# 💬 DM (MESAJLAŞMA) TABLOSU
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))   # Mesajı atan
    receiver_id = Column(Integer, ForeignKey("users.id")) # Mesajı alan
    content = Column(String)                              # Mesajın içeriği
    timestamp = Column(DateTime, default=datetime.utcnow) # Atılma zamanı
    image_url = Column(String, nullable=True)             # 📸 Gönderilen görsel URL'i




# 🤝 ARKADAŞLIK TABLOSU
class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # İsteği atan
    receiver_id  = Column(Integer, ForeignKey("users.id"), nullable=False)  # İsteği alan
    status       = Column(String, default="pending")                        # pending | accepted | rejected
    created_at   = Column(DateTime, server_default=func.now())

    # İlişkiler
    requester = relationship("User", foreign_keys=[requester_id], back_populates="sent_requests")
    receiver  = relationship("User", foreign_keys=[receiver_id],  back_populates="received_requests")