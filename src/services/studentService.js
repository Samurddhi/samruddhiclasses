import authService from './authService.js';

const API_URL = 'http://localhost:8080/api/students';

export const studentService = {
  getAll: async () => {
    const token = authService.getToken();
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  updateDetails: async (id, details) => {
    const token = authService.getToken();
    const res = await fetch(`${API_URL}/${id}/details`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(details)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update details');
    }
    return res.json();
  },

  getById: async (id) => {
    const token = authService.getToken();
    const res = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Student not found');
    return res.json();
  }
};

export default studentService;

