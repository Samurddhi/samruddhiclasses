// Frontend/src/services/timetableService.js

import axios from 'axios'
import authService from './authService'

const API_URL = 'http://localhost:8080/api/timetables'

function authHeaders() {
  const token = authService.getToken()



  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {}
}

const timetableService = {

  async getStudents() {
    const res = await axios.get(`${API_URL}/students`, {
      headers: authHeaders(),
    })

    return res.data
  },

  async getTimetable(studentId) {
    const res = await axios.get(`${API_URL}/${studentId}`, {
      headers: authHeaders(),
    })

    return res.data
  },

  async getMyTimetable() {

    const res = await axios.get(`${API_URL}/me`, {
      headers: authHeaders(),
    })

    return res.data
  },

  async updateCell(studentId, { day, period, subjectCode }) {
    const res = await axios.put(
      `${API_URL}/${studentId}/cell`,
      { day, period, subjectCode },
      {
        headers: authHeaders(),
      }
    )

    return res.data
  },
}


export default timetableService