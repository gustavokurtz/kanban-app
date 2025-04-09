// utils/api.ts

export const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
  
    const response = await fetch(url, {
      ...options,
      headers
    });
  
    if (!response.ok) {
      // Se receber 401 (Unauthorized), fazer logout automaticamente
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      
      throw new Error(`Erro: ${response.status}`);
    }
  
    return response;
  };