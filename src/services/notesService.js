import axios from 'axios'
import authService from './authService'

const API_URL = 'http://localhost:8080/api/notes'

function authHeaders() {
  const token = authService.getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const notesService = {
  async getStudents() {
    const res = await axios.get(`${API_URL}/students`, { headers: authHeaders() })
    return res.data
  },

  async getNotes(studentId) {
    // student-safe endpoint (ignores studentId in caller, but keeps signature to avoid refactor)
    const res = await axios.get(`${API_URL}/me`, { headers: authHeaders() })
    return res.data
  },

  async uploadNote(studentId, title, file) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('file', file)

    const res = await axios.post(`${API_URL}/upload/${studentId}`, formData, {
      headers: {
        ...authHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },

  async updateNote(noteId, title) {
    const res = await axios.put(`${API_URL}/${noteId}`, title, { headers: authHeaders() })
    return res.data
  },

  async deleteNote(noteId) {
    const res = await axios.delete(`${API_URL}/${noteId}`, { headers: authHeaders() })
    return res.data
  },

  async downloadNote(noteId) {
    const res = await axios.get(`${API_URL}/download/${noteId}`, {
      headers: authHeaders(),
      responseType: 'blob',  // for file download
    })
    return res.data
  },

  async previewNote(noteId) {
    const res = await axios.get(`${API_URL}/preview/${noteId}`, {
      headers: authHeaders(),
      responseType: 'blob',
    })
    return res.data
  },
}

export default notesService
