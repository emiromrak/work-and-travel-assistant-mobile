from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# .env dosyasindaki sifreleri ve adresleri yukle
load_dotenv(override=True)

# Buluttaki Supabase linkini al, bulamazsa lokaldeki app.db'ye don
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# SQLAlchemy 'postgres://' sevmez, onu otomatik 'postgresql://' yapariz
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite ise ozel ayar kullan, Supabase (PostgreSQL) ise bos birak
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

# Supabase baglantisini dene, basarisiz olursa SQLite'a dus
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
    # Baglantiyi test et (PostgreSQL ise)
    if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK] Supabase PostgreSQL baglantisi basarili!")
except Exception as e:
    print(f"[!] Supabase baglantisi basarisiz: {e}")
    print("[*] Lokal SQLite veritabanina geciliyor...")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()