from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# --- 1. VERİTABANI VE MODELLER ---
from app.database import engine
from app.models import Base
from sqlalchemy import text

Base.metadata.create_all(bind=engine)

# Auto-migration: users tablosuna start_city sütununu ekle (yoksa)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN start_city VARCHAR DEFAULT 'Istanbul, TR'"))
        conn.commit()
except Exception as e:
    pass

# --- 2. RATE LIMITER ---
# Limiter artık routes.py üzerinden import ediliyor
from app.routes import limiter

# --- 3. UYGULAMA AYARLARI ---
app = FastAPI(title="Mali's Journey API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- 4. ROUTER DAHİL ET ---
from app.routes import router
app.include_router(router)

# ==========================================
# 🚀 KONTROL PANELİ (DASHBOARD - GÜNCELLENDİ!)
# ==========================================
@app.get("/", response_class=HTMLResponse)
async def admin_dashboard():
    html_content = """
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mali's Journey | Kontrol Merkezi</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-slate-900 text-slate-100 font-sans min-h-screen p-4 md:p-8">
        <div class="max-w-6xl mx-auto">
            <div class="flex justify-between items-center bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-700 mb-8">
                <div>
                    <h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        <i class="fa-solid fa-server mr-2 text-cyan-400"></i>PROJECT OASIS
                    </h1>
                    <p class="text-slate-400 mt-1">Süper Uygulama Backend Kontrol Paneli</p>
                </div>
                <div class="px-5 py-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-bold">
                    Sistem Aktif 🟢
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-6">
                    
                    <div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                        <h2 class="text-xl font-bold mb-4 text-purple-400"><i class="fa-solid fa-users mr-2"></i>1. Kullanıcı Sistemi</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <button onclick="testRegister()" class="bg-purple-600 hover:bg-purple-500 py-2 rounded-xl font-bold transition-colors text-sm">
                                Buğra'yı Kaydet
                            </button>
                            <button onclick="testLogin()" class="bg-purple-600 hover:bg-purple-500 py-2 rounded-xl font-bold transition-colors text-sm">
                                Giriş Yap (Mali)
                            </button>
                        </div>
                    </div>

                    <div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                        <h2 class="text-xl font-bold mb-4 text-cyan-400"><i class="fa-solid fa-stream mr-2"></i>2. Flow (Akış) Sistemi</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <button onclick="testPost()" class="bg-cyan-600 hover:bg-cyan-500 py-2 rounded-xl font-bold transition-colors text-sm">
                                Parti İlanı At
                            </button>
                            <button onclick="testFeed()" class="bg-cyan-600 hover:bg-cyan-500 py-2 rounded-xl font-bold transition-colors text-sm">
                                Akışı Yenile
                            </button>
                        </div>
                    </div>

                    <div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                        <h2 class="text-xl font-bold mb-4 text-emerald-400"><i class="fa-solid fa-comments mr-2"></i>3. DM / Mesajlaşma</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <button onclick="testSendDM()" class="bg-emerald-600 hover:bg-emerald-500 py-2 rounded-xl font-bold transition-colors text-sm">
                                Bilet Mesajı At
                            </button>
                            <button onclick="testGetChat()" class="bg-emerald-600 hover:bg-emerald-500 py-2 rounded-xl font-bold transition-colors text-sm">
                                Sohbet Geçmişi
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-950 p-6 rounded-3xl border border-slate-800 font-mono text-sm h-full flex flex-col">
                    <div class="flex justify-between mb-4 border-b border-slate-800 pb-2">
                        <span class="text-slate-500 uppercase tracking-widest text-xs">Terminal Çıktısı</span>
                        <button onclick="document.getElementById('resultContent').innerHTML = '> Bekleniyor...'" class="text-slate-500 hover:text-white text-xs">Temizle</button>
                    </div>
                    <div id="resultContent" class="text-green-400 leading-relaxed overflow-y-auto max-h-[500px] whitespace-pre-wrap">> Bekleniyor...</div>
                </div>
            </div>
        </div>

        <script>
            // Genel İstek Atma ve Ekrana Yazdırma Fonksiyonu
            async function executeTest(url, method, bodyData, title) {
                const content = document.getElementById('resultContent');
                content.innerHTML = `<span class="text-yellow-400">> [${title}] İşlem yapılıyor... ⏳</span>`;
                try {
                    const options = { method: method, headers: { 'Content-Type': 'application/json' } };
                    if (bodyData) options.body = JSON.stringify(bodyData);
                    
                    const res = await fetch(url, options);
                    const data = await res.json();
                    
                    // Gelen JSON verisini renkli ve düzenli formatta ekrana bas
                    let output = `<span class="text-blue-400 font-bold">=== ${title} SONUCU ===</span>\n`;
                    output += `<span class="${res.ok ? 'text-green-400' : 'text-red-400'}">${JSON.stringify(data, null, 2)}</span>`;
                    content.innerHTML = output;
                } catch (e) {
                    content.innerHTML = `<span class="text-red-500">> HATA: Sunucuya ulaşılamadı!</span>`;
                }
            }

            // 1. Kullanıcı Testleri
            function testRegister() {
                executeTest('/api/register', 'POST', { username: "bugra", email: "bugra@projectoasis.com", password: "123", state_city: "Avalon, NJ", job_role: "Houseperson" }, "BUĞRA KAYIT OLUYOR");
            }
            function testLogin() {
                executeTest('/api/login', 'POST', { email: "mali@projectoasis.com", password: "supergizlisifre123" }, "MALİ GİRİŞ YAPIYOR");
            }

            // 2. Flow Testleri
            function testPost() {
                executeTest('/api/posts', 'POST', { title: "Princeton Party!", content: "Bu akşam tayfayı topluyoruz, içecekler benden!", user_id: 1 }, "YENİ FLOW GÖNDERİSİ");
            }
            function testFeed() {
                executeTest('/api/posts', 'GET', null, "FLOW AKIŞINI ÇEK");
            }

            // 3. DM Testleri
            function testSendDM() {
                executeTest('/api/messages', 'POST', { sender_id: 1, receiver_id: 2, content: "Kanka şu New York aktarmasını naptın, çözdük mü?" }, "BUĞRA'YA DM AT");
            }
            function testGetChat() {
                executeTest('/api/messages/1/2', 'GET', null, "SOHBET GEÇMİŞİNİ ÇEK");
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


# ==========================================
# 📄 GİZLİLİK POLİTİKASI SAYFASI
# ==========================================
@app.get("/privacy", response_class=HTMLResponse)
async def privacy_policy():
    html = """<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gizlilik Politikası | Mali's Journey</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; line-height: 1.7; }
        .container { max-width: 800px; margin: 0 auto; padding: 48px 24px; }
        h1 { font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #38bdf8, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
        .updated { color: #64748b; font-size: 0.9rem; margin-bottom: 40px; }
        h2 { font-size: 1.2rem; font-weight: 700; color: #38bdf8; margin: 36px 0 12px; }
        p, li { color: #94a3b8; margin-bottom: 10px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 6px; }
        .badge { display: inline-block; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 4px 12px; font-size: 0.8rem; color: #64748b; margin-bottom: 40px; }
        .contact { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-top: 40px; }
        .contact a { color: #38bdf8; text-decoration: none; }
        hr { border: none; border-top: 1px solid #1e293b; margin: 32px 0; }
    </style>
</head>
<body>
<div class="container">
    <h1>🔐 Gizlilik Politikası</h1>
    <p class="updated">Son güncelleme: Mayıs 2025</p>
    <span class="badge">Mali's Journey — Work &amp; Travel Asistanı</span>

    <p>Bu gizlilik politikası, <strong>Mali's Journey</strong> uygulamasını kullanırken toplanan, işlenen ve saklanan kişisel verileriniz hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.</p>

    <h2>1. Toplanan Veriler</h2>
    <ul>
        <li><strong>Hesap bilgileri:</strong> Ad, kullanıcı adı, e-posta adresi ve şifreli (hash) parola</li>
        <li><strong>Profil bilgileri:</strong> Profil fotoğrafı, çalışma şehri, meslek, başlangıç şehri</li>
        <li><strong>İçerik verileri:</strong> Paylaştığınız gönderiler, resimler ve mesajlar</li>
        <li><strong>Konum bilgisi:</strong> Yalnızca gönderi paylaşımı sırasında ve izin vermeniz halinde</li>
    </ul>

    <h2>2. Verilerin Kullanımı</h2>
    <ul>
        <li>Hesabınızı oluşturmak ve yönetmek</li>
        <li>Uygulama özelliklerini (sosyal akış, mesajlaşma, AI rehber) sunmak</li>
        <li>Uygulama güvenliğini sağlamak</li>
        <li>Hizmet kalitesini iyileştirmek</li>
    </ul>

    <h2>3. Veri Saklama ve Güvenlik</h2>
    <p>Verileriniz <strong>Supabase</strong> altyapısı (AWS bölgesi) üzerinde güvenli şekilde saklanır. Şifreleriniz <strong>bcrypt</strong> ile hashlenir; özel mesajlarınız <strong>AES-256 (Fernet)</strong> şifrelemesiyle korunur. Verilerinize yetkisiz erişimi önlemek için HTTPS zorunlu tutulur.</p>

    <h2>4. Üçüncü Taraf Hizmetler</h2>
    <ul>
        <li><strong>Supabase:</strong> Veritabanı ve dosya depolama</li>
        <li><strong>Groq AI:</strong> Yapay zeka rehber özelliği (yalnızca şehir adı ve konu gönderilir)</li>
    </ul>
    <p>Bu hizmetlerin kendi gizlilik politikaları geçerlidir.</p>

    <h2>5. Haklarınız</h2>
    <ul>
        <li>Verilerinize erişme ve düzeltme hakkı</li>
        <li>Hesabınızı ve tüm verilerinizi silme hakkı (uygulama içi Ayarlar → Hesabı Sil)</li>
        <li>Kişisel veri işleme faaliyetleri hakkında bilgi talep etme hakkı</li>
    </ul>

    <h2>6. Çerezler</h2>
    <p>Uygulama, çerez kullanmamaktadır. Oturum yönetimi yalnızca cihazınızda yerel olarak depolanan kullanıcı kimliği aracılığıyla sağlanır.</p>

    <h2>7. Veri Saklama Süresi</h2>
    <p>Verileriniz hesabınız aktif olduğu sürece saklanır. Hesabınızı sildiğinizde tüm kişisel verileriniz 30 gün içinde kalıcı olarak silinir.</p>

    <hr>
    <div class="contact">
        <strong>📬 İletişim</strong><br><br>
        <p>Gizlilik politikamıza ilişkin sorularınız için: <a href="mailto:privacy@malisjourney.app">privacy@malisjourney.app</a></p>
    </div>
</div>
</body>
</html>"""
    return HTMLResponse(content=html)