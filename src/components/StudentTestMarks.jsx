// Frontend/src/components/StudentTestMarks.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import authService from '../services/authService'
import StudentSidebar from './StudentSidebar'

const API_URL = 'http://localhost:8080/api/test-marks'
const STUDENT_API_URL = 'http://localhost:8080/api/students'

function StudentTestMarks() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [testMarks, setTestMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const authHeaders = () => {
    const token = authService.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        // Get current student info
        const studentRes = await fetch(`${STUDENT_API_URL}/me`, {
          headers: authHeaders(),
        })
        if (!studentRes.ok) throw new Error('Failed to load student data')
        const studentData = await studentRes.json()
        setStudent(studentData)

        // Get only this student's test marks
        const marksRes = await axios.get(`${API_URL}/me`, { headers: authHeaders() })
        setTestMarks(marksRes.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load test marks')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Internal Marks</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">
                {student?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <span className="text-gray-700 font-medium">{student?.name || 'Student'}</span>
            </div>
            <button
              className="px-4 py-1.5 rounded-full border border-[#02b3ff] text-[#02b3ff] text-sm font-semibold hover:bg-[#02b3ff] hover:text-white transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">My Internal Marks</h2>
            </div>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : testMarks.length === 0 ? (
              (() => {
                const rawInternal = student?.internalMarks;
                const internalMarks = (rawInternal || '')
                  .split(/\r?\n|,/)
                  .map((s) => s.trim())
                  .filter(Boolean);

                const hasMeaningfulInternal =
                  internalMarks.length > 0 &&
                  !(internalMarks.length === 1 && internalMarks[0] === 'updated soon');

                if (!hasMeaningfulInternal) {
                  return (
                    <div className="py-10 text-center text-gray-500">
                      No test marks found for your profile.
                    </div>
                  )
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 font-semibold text-gray-600">Year</th>
                          <th className="py-3 px-4 font-semibold text-gray-600">Semester</th>
                          <th className="py-3 px-4 font-semibold text-gray-600">Batch</th>
                          <th className="py-3 px-4 font-semibold text-gray-600">Marks</th>
                          <th className="py-3 px-4 font-semibold text-gray-600">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {internalMarks.map((m, idx) => (
                          <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="py-3 px-4">-</td>
                            <td className="py-3 px-4">-</td>
                            <td className="py-3 px-4">-</td>
                            <td className="py-3 px-4 font-medium">{m}</td>
                            <td className="py-3 px-4">Internal Marks</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })()
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 font-semibold text-gray-600">Year</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Semester</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Batch</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Marks</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testMarks.map((mark, idx) => (
                      <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4">{mark.year || '-'}</td>
                        <td className="py-3 px-4">{mark.semester || '-'}</td>
                        <td className="py-3 px-4">{mark.batch || '-'}</td>
                        <td className="py-3 px-4 font-medium">{mark.marks || '-'}</td>
                        <td className="py-3 px-4">{mark.details || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>Total Records: {testMarks.length}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentTestMarks
