const getBaseUrl = () => {
  // Eğer backend'i Render üzerinde host ediyorsanız, direkt olarak Render URL'inizi buraya yazmalısınız.
  // Örneğin: return 'https://sizin-proje-adiniz.onrender.com/api';
  return 'https://project-oasis-api-x9tf.onrender.com/api';
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
