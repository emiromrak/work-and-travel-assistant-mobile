🌴 Project Oasis - Backend API
Project Oasis süper uygulamasının kalbine hoş geldin! Bu depo, uygulamanın arka planında çalışan kullanıcı sistemi, akış (Flow), mesajlaşma (DM) ve yapay zeka servislerini barındırır.

Frontend (React Native) geliştirmelerine başlamak ve bu motoru kendi bilgisayarında çalıştırmak için aşağıdaki adımları sırayla uygulaman yeterli. Veritabanı kurulumuyla uğraşmana gerek yok, sunucu ilk çalıştığında her şeyi kendi halledecek.

🚀 Kurulum Adımları
1. Projeyi Bilgisayarına İndir
Terminali aç ve projeyi klonla:
```bash
git clone https://github.com/Maelor1/Project-Oasis.git
cd Project-Oasis
```
2. Kütüphaneleri Yükle
Sistemin çalışması için gereken paketleri tek tuşla kur:

```bash
pip install -r requirements.txt
```

3. Güvenlik Dosyasını Oluştur
Projenin ana dizinine (bu dosyanın olduğu yere) .env adında yeni bir dosya aç. İçine sadece şu satırı yapıştır (API anahtarını benden isteyebilirsin):

```bash
GROQ_API_KEY=api_anahtari_buraya_gelecek
```

4. Sunucuyu Çalıştır:
```bash
python -m uvicorn app.main:app --reload
```
🌐 API Test ve Kullanım
Sunucu çalıştıktan sonra tarayıcında şu adreslere gidebilirsin:

Kontrol Paneli (Test Merkezi): http://127.0.0.1:8000/

API Dokümantasyonu (Swagger): http://127.0.0.1:8000/docs

Frontend tarafından yapacağın tüm fetch veya axios isteklerini http://127.0.0.1:8000 adresine atmalısın. Kolay gelsin! 🚀

