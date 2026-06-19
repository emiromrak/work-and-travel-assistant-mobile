import datetime
import requests
import geocoder
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from groq import Groq 
import json
import re
import os
from dotenv import load_dotenv

# 🌟 GÜVENLİK DUVARI: .env dosyasındaki şifreleri sisteme yükler
load_dotenv()

# --- 🔑 API AYARLARI (GİZLENDİ) ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY") 
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

try:
    client = Groq(api_key=GROQ_API_KEY)
except:
    client = None

# --- 📂 VERİTABANI (CACHE) SİSTEMİ ---
# İsmi daha profesyonel bir formata çevrildi
DB_DOSYASI = "app_data_cache.json"

def db_oku(anahtar):
    if os.path.exists(DB_DOSYASI):
        try:
            with open(DB_DOSYASI, "r", encoding="utf-8") as f:
                return json.load(f).get(anahtar.lower())
        except: pass
    return None

def db_yaz(anahtar, veri):
    db = {}
    if os.path.exists(DB_DOSYASI):
        try:
            with open(DB_DOSYASI, "r", encoding="utf-8") as f: db = json.load(f)
        except: pass
    db[anahtar.lower()] = veri
    with open(DB_DOSYASI, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=4)

# --- 🧠 YAPAY ZEKA VE YARDIMCI FONKSİYONLAR ---
def groq_sor(prompt):
    if not client: raise Exception("API Key bulunamadı veya Groq başlatılamadı!")
    cevap = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        temperature=0.85
    )
    return cevap.choices[0].message.content

def temiz_json_al(metin):
    try:
        eslesme = re.search(r'\{.*\}', metin, re.DOTALL)
        if eslesme: return json.loads(eslesme.group(0))
        return json.loads(metin.replace('```json', '').replace('```', '').strip())
    except: raise ValueError("JSON Format Error")

def kalan_zamani_hesapla(tarih):
    try:
        fark = datetime.datetime.strptime(tarih, "%Y-%m-%d %H:%M:%S") - datetime.datetime.now()
        if fark.total_seconds() <= 0: return "Uçuş Vakti! ✈️"
        return f"{fark.days} Gün, {fark.seconds//3600} Saat, {(fark.seconds%3600)//60} Dakika"
    except: return "Hesaplama Hatası"

def dolar_kuru_cek():
    try: return f"{requests.get('https://api.exchangerate-api.com/v4/latest/USD', timeout=5).json()['rates']['TRY']:.2f}"
    except: return "Hata"

def para_cevir(miktar, kur, yon="USD_TO_TRY"):
    try: return f"{float(miktar) * float(kur):.2f} TL" if yon == "USD_TO_TRY" else f"{float(miktar) / float(kur):.2f} USD"
    except: return "Geçersiz İşlem"

def iata_kodu_bul(sehir):
    cache_key = f"iata_{sehir}"
    hafiza = db_oku(cache_key)
    if hafiza: return hafiza 
    try:
        prompt = f"'{sehir}' için en yakın en büyük havalimanı IATA kodunu bul. Sadece 3 büyük harf yaz."
        kod_metni = groq_sor(prompt)
        kod = "".join(filter(str.isalpha, kod_metni.strip().upper()))[:3]
        sonuc = kod if len(kod) == 3 else "JFK"
        db_yaz(cache_key, sonuc)
        return sonuc
    except: return "JFK"

def gercek_bilet_bul(kalkis, varis):
    try:
        k_iata = iata_kodu_bul(kalkis)
        v_iata = iata_kodu_bul(varis)
        params = {
            "engine": "google_flights", "departure_id": k_iata, "arrival_id": v_iata,
            "currency": "TRY", "hl": "tr", "outbound_date": (datetime.datetime.now() + datetime.timedelta(days=30)).strftime("%Y-%m-%d"),
            "api_key": SERPAPI_KEY
        }
        r = requests.get("https://serpapi.com/search.json", params=params).json()
        ucuslar = r.get("best_flights", []) or r.get("other_flights", [])
        return [{"firma": u["flights"][0]["airline"], "fiyat": f"{u['price']} ₺", 
                 "sure": f"{u['total_duration']//60}s {u['total_duration']%60}d", 
                 "link": u.get("flights_shopping_url") or r["search_metadata"]["google_flights_url"]} for u in ucuslar[:3]]
    except: return []

def gezilecek_yerleri_bul(sehir):
    cache_key = f"rehber_{sehir}"
    hafiza = db_oku(cache_key)
    if hafiza: return hafiza 
    try:
        prompt = f"Sen fırlama bir seyahat rehberisin! {sehir} için samimi, bol emojili bir özet ve 3 yer öner. SADECE JSON DÖNDÜR: {{\"ozet\": \"...\", \"yerler\": [\"📸 Yer1\", \"🔥 Yer2\", \"🎉 Yer3\"]}}"
        sonuc = temiz_json_al(groq_sor(prompt))
        db_yaz(cache_key, sonuc)
        return sonuc
    except: return {"ozet": "✨ Efsane yer! (Bağlantınızı kontrol edin).", "yerler": ["Merkez", "Parklar", "Sahil"]}

def wat_rehberi_getir(sehir):
    cache_key = f"wat_{sehir}"
    hafiza = db_oku(cache_key)
    if hafiza: return hafiza 
    try:
        prompt = f"Sen W&T kankasısın! {sehir} için öğrencilere özel aşırı samimi, esprili bir rehber yap. SADECE JSON DÖNDÜR: {{\"yemek\": \"🍔 ...\", \"butce\": \"💸 ...\", \"ipucu\": \"🎒 ...\", \"mekanlar\": [\"Yer1\", \"Yer2\"]}}"
        sonuc = temiz_json_al(groq_sor(prompt))
        db_yaz(cache_key, sonuc)
        return sonuc
    except: return {"yemek": "🍕 Ucuz pizzacılar.", "butce": "💸 Günlük 50$.", "ipucu": "🎒 Bisiklet al!", "mekanlar": ["Downtown"]}

def foto_url_getir(sehir):
    cache_key = f"foto_{sehir}"
    hafiza = db_oku(cache_key)
    if hafiza: return hafiza 
    try:
        s = sehir.split(",")[0].strip()
        r = requests.get(f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles={s}&pithumbsize=1000&format=json").json()
        for p in r["query"]["pages"].values():
            if "thumbnail" in p: 
                db_yaz(cache_key, p["thumbnail"]["source"])
                return p["thumbnail"]["source"]
    except: pass
    return None

def onerileri_getir(metin, sadece_usa=False):
    if len(metin) < 3: return []
    try:
        if sadece_usa:
            # Sadece ABD şehirleri
            sonuclar = Nominatim(user_agent="travel_assistant_v1").geocode(
                metin, exactly_one=False, limit=8, country_codes="us",
                featuretype="city", addressdetails=True, language="en"
            ) or []
        else:
            # Tüm dünya: Türkiye dahil
            sonuclar = Nominatim(user_agent="travel_assistant_v1").geocode(
                metin, exactly_one=False, limit=10,
                featuretype="city", addressdetails=True, language="tr"
            ) or []

        temiz_oneriler = []
        for y in sonuclar:
            adres = y.raw.get('address', {})
            sehir = (
                adres.get('city') or adres.get('town') or
                adres.get('village') or adres.get('county') or
                adres.get('hamlet') or adres.get('municipality')
            )
            eyalet = adres.get('state') or adres.get('province')
            ulke = adres.get('country', '')
            ulke_kodu = adres.get('country_code', '').upper()

            if not sehir:
                sehir = y.address.split(',')[0].strip()

            if sadece_usa:
                # ABD: "Orlando, Florida" formatı
                isim = f"{sehir}, {eyalet or 'USA'}"
            elif ulke_kodu == 'TR':
                # Türkiye: "İstanbul, İstanbul" formatı
                bolge = eyalet or ulke
                isim = f"{sehir}, {bolge}"
            elif ulke_kodu == 'US':
                isim = f"{sehir}, {eyalet or 'USA'}"
            else:
                bolge = eyalet or ulke
                isim = f"{sehir}, {bolge}" if bolge else sehir

            if isim and isim not in temiz_oneriler:
                temiz_oneriler.append(isim)

        return temiz_oneriler[:8]
    except: return []

def mesafe_ve_koordinat_bul(hedef, benim_sehir_adi=None):
    try:
        if benim_sehir_adi:
            b = Nominatim(user_agent="travel_assistant_v1").geocode(benim_sehir_adi)
            if b:
                b_koor = (b.latitude, b.longitude)
                b_sehir = b.address.split(",")[0]
            else:
                g = geocoder.ip('me')
                b_koor = tuple(g.latlng) if g.latlng else (37.84, 27.84)
                b_sehir = g.city or "Istanbul"
        else:
            g = geocoder.ip('me')
            b_koor = tuple(g.latlng) if g.latlng else (37.84, 27.84)
            b_sehir = g.city or "Istanbul"

        h = Nominatim(user_agent="travel_assistant_v1").geocode(hedef)
        if h: return {"durum": True, "mesafe": f"{geodesic(b_koor, (h.latitude, h.longitude)).kilometers:.0f}", "benim_koor": b_koor, "hedef_koor": (h.latitude, h.longitude), "benim_sehir": b_sehir, "hedef_sehir": h.address.split(",")[0]}
        return {"durum": False}
    except: return {"durum": False}

def aranan_sehre_profil_ekle(sehir):
    gecmis = db_oku("aranan_sehirler") or {}
    if sehir not in gecmis:
        gecmis[sehir] = {"durum": "Gitmeyi Planlıyorum", "puan": ""}
        db_yaz("aranan_sehirler", gecmis)