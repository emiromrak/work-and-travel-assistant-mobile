const getBaseUrl = () => {
  // Canlı (Production) Render sunucusu:
  return 'https://oasis-backend-pro.onrender.com/api';
};

export const API_BASE_URL = getBaseUrl();

// Örnek bir veri çekme fonksiyonu
export const fetchAIAdvice = async (city: string, topic: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-guide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        city_name: city,
        topic: topic,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AI verisi çekilirken hata oluştu:', error);
    throw error;
  }
};

// Login (Giriş) API fonksiyonu
export const fetchLogin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Sunucu Hatası: ${responseText.substring(0, 50)}...`);
    }

    if (!response.ok) {
      throw new Error(data?.detail || 'Giriş yapılamadı.');
    }

    return data;
  } catch (error) {
    console.error('Login sırasında hata oluştu:', error);
    throw error;
  }
};

// Register (Kayıt) API fonksiyonu
export const fetchRegister = async (username: string, email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Sunucu Hatası: ${responseText.substring(0, 50)}...`);
    }

    if (!response.ok) {
      throw new Error(data?.detail || 'Kayıt işlemi başarısız.');
    }

    return data;
  } catch (error) {
    console.error('Kayıt sırasında hata oluştu:', error);
    throw error;
  }
};

// Profil Fotoğrafı Güncelleme API fonksiyonu (FormData ile)
export const updateProfilePicAPI = async (userId: number, imageUri: string) => {
  try {
    // FormData ile dosyayı multipart olarak gönder
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as any);

    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-pic`, {
      method: 'PUT',
      body: formData, // headers kısmını tamamen uçurduk!
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Sunucu Hatası: ${responseText.substring(0, 50)}...`);
    }

    if (!response.ok) {
      throw new Error(data?.detail || 'Profil fotoğrafı güncellenemedi.');
    }

    return data;
  } catch (error) {
    console.error('Profil fotoğrafı güncellenirken hata oluştu:', error);
    throw error;
  }
};

// Döviz kuru çekme API'si
export const fetchExchangeRate = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/currency`);
    if (!response.ok) throw new Error("Kur çekilemedi");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Döviz kuru alınamadı:", error);
    throw error;
  }
};

// Mesafe ve koordinat bulma API'si
export const fetchDistance = async (targetCity: string, myCity?: string) => {
  try {
    let url = `${API_BASE_URL}/distance?target_city=${encodeURIComponent(targetCity)}`;
    if (myCity) {
      url += `&my_city=${encodeURIComponent(myCity)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Mesafe hesaplanamadı");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Mesafe bilgisi alınamadı:", error);
    throw error;
  }
};

// Tüm kullanıcıları çekme API'si (DM için)
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error("Kullanıcılar alınamadı");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Kullanıcı listesi alınamadı:", error);
    throw error;
  }
};

// Profil Güncelleme API'si (Eyalet & Rol & Başlangıç Şehri)
export const updateUserProfileAPI = async (userId: number, profileData: { state_city?: string, job_role?: string, start_city?: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error("Profil güncellenemedi");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Profil güncellenirken hata oluştu:", error);
    throw error;
  }
};

// Sosyal Akış: Tüm postları çekme API'si
export const fetchPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error("Gönderiler alınamadı");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Gönderiler alınırken hata oluştu:", error);
    throw error;
  }
};

// Sosyal Akış: Yeni post paylaşma API'si
export const createPostAPI = async (postData: { title: string; content: string; user_id: number }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error("Gönderi paylaşılamadı");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Gönderi paylaşılırken hata oluştu:", error);
    throw error;
  }
};

// Sohbet: İki kullanıcı arasındaki konuşmayı çekme API'si
export const fetchConversation = async (user1Id: number, user2Id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${user1Id}/${user2Id}`);
    if (!response.ok) throw new Error("Mesaj geçmişi alınamadı");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Konuşma çekilirken hata oluştu:", error);
    throw error;
  }
};

// Sohbet: Yeni mesaj gönderme API'si
export const sendMessageAPI = async (messageData: { sender_id: number; receiver_id: number; content: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) throw new Error("Mesaj gönderilemedi");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Mesaj gönderilirken hata oluştu:", error);
    throw error;
  }
};
