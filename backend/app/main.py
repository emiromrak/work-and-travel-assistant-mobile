from fastapi import FastAPI
from fastapi.responses import HTMLResponse

# --- 1. VERİTABANI VE MODELLER ---
from app.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

# --- 2. UYGULAMA AYARLARI ---
app = FastAPI(title="Mali's Journey API", version="1.0.0")

# --- 3. ROUTER DAHİL ET ---
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