// utils/faceIdApiClient.ts - специальный клиент для Face ID
export const faceIdApiClient = {
  async post(endpoint: string, data: any) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Face-ID-Operation': 'true', // ✅ Специальный заголовок
        'User-Agent': navigator.userAgent + ' FaceID'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
};
