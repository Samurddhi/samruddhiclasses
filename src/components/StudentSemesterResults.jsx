// Frontend/src/components/StudentSemesterResults.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import authService from '../services/authService'
import StudentSidebar from './StudentSidebar'

const API_URL = 'http://localhost:8080/api/admin/semester-results'
const STUDENT_API_URL = 'http://localhost:8080/api/students'

function StudentSemesterResults() {
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [semesterResults, setSemesterResults] = useState([])
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

        // Get semester results for this student
        try {
          const resultsRes = await axios.get(`${API_URL}/student/${studentData.id}`, {
            headers: authHeaders(),
          })
          setSemesterResults(resultsRes.data || [])
        } catch (err) {
          // No results yet is okay
          setSemesterResults([])
        }
      } catch (err) {
        setError(err.message || 'Failed to load semester results')
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

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-600'
    const g = grade.toUpperCase()
    if (g === 'S' || g === 'A') return 'bg-green-100 text-green-800'
    if (g === 'B') return 'bg-blue-100 text-blue-800'
    if (g === 'C') return 'bg-yellow-100 text-yellow-800'
    if (g === 'D') return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Semester Results</h1>
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
              <h2 className="text-lg font-semibold text-gray-800">My Semester Results</h2>
              {student && (
                <span className="text-sm text-gray-500">
                  Semester: {student.semester || '-'}
                </span>
              )}
            </div>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : semesterResults.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No semester results found for your profile. Please check back later.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-3 px-4 font-semibold text-gray-600">Semester</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Exam Month</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Total Marks</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semesterResults.map((result, idx) => (
                      <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{result.semester || '-'}</td>
                        <td className="py-3 px-4">{result.examMonth || '-'}</td>
                        <td className="py-3 px-4">{result.total || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(result.grade)}`}>
                            {result.grade || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Student Info Card */}
            {student && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-base font-semibold mb-4 text-gray-700">My Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-gray-800 font-medium">{student.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="text-gray-800 font-medium">{student.registrationNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800 font-medium">{student.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Semester</p>
                    <p className="text-gray-800 font-medium">{student.semester || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>Total Records: {semesterResults.length}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentSemesterResults
