from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
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
    
    # Kullanıcının attığı gönderilerle (Post) arasındaki bağ
    posts = relationship("Post", back_populates="author")

# 🌍 FLOW (AKIŞ) TABLOSU (Parti, İlan ve Muhabbetler)
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
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