// Frontend/src/components/StudentDashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import StudentSidebar from './StudentSidebar'

const STUDENT_API_URL = 'http://localhost:8080/api/students'

function StudentDashboard() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true)
        setError('')
        const token = authService.getToken()

        const res = await fetch(`${STUDENT_API_URL}/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.message || 'Failed to load student data')
        }

        const data = await res.json()
        setStudent(data)
      } catch (err) {
        setError(err.message || 'Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const getStatusColor = (status) => {
    if (!status || status === 'updated soon') {
      return 'bg-gray-100 text-gray-600'
    }
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Student sidebar */}
      <StudentSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-800">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-sm font-bold text-white">
                {student?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <span className="text-sm text-gray-800">{student?.name || 'Student'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : student ? (
            <div className="space-y-6">
              {/* Welcome message */}
              <p className="text-xl text-gray-700">
                Welcome, <span className="font-semibold">{student.name}</span>
              </p>

              {/* Student Info Card */}
              <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-800">My Information</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-lg font-medium text-gray-800">{student.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="text-lg font-medium text-gray-800">{student.registrationNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-medium text-gray-800">{student.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Semester</p>
                    <p className="text-lg font-medium text-gray-800">{student.semester || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Status Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white shadow-md rounded-xl p-4 border border-sky-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-sky-400 flex items-center justify-center text-sky-500">
                      📝
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Internal Marks</p>
                      <p className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.internalMarks)}`}>
                        {student.internalMarks || 'updated soon'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-xl p-4 border border-sky-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-sky-400 flex items-center justify-center text-sky-500">
                      📚
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Notes</p>
                      <p className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.notesStatus)}`}>
                        {student.notesStatus || 'updated soon'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-xl p-4 border border-sky-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-sky-400 flex items-center justify-center text-sky-500">
                      💰
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Dues Status</p>
                      <p className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.duesStatus)}`}>
                        {student.duesStatus || 'updated soon'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-xl p-4 border border-sky-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-sky-400 flex items-center justify-center text-sky-500">
                      📅
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Time Table</p>
                      <p className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.timetableStatus)}`}>
                        {student.timetableStatus || 'updated soon'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-xl p-4 border border-sky-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-sky-400 flex items-center justify-center text-sky-500">
                      🎓
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Semester Marks</p>
                      <p className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.semesterMarksStatus)}`}>
                        {student.semesterMarksStatus || 'updated soon'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-800">Quick Links</h2>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <button
                    onClick={() => navigate('/user/test-marks')}
                    className="p-4 text-center border-2 border-gray-200 rounded-xl hover:border-sky-400 hover:bg-sky-50 transition"
                  >
                    <div className="text-2xl mb-2">📝</div>
                    <div className="text-sm font-medium text-gray-700">Internal Marks</div>
                  </button>
                  <button
                    onClick={() => navigate('/user/semester-results')}
                    className="p-4 text-center border-2 border-gray-200 rounded-xl hover:border-sky-400 hover:bg-sky-50 transition"
                  >
                    <div className="text-2xl mb-2">🎓</div>
                    <div className="text-sm font-medium text-gray-700">Semester Results</div>
                  </button>
                  <button
                    onClick={() => navigate('/user/notes')}
                    className="p-4 text-center border-2 border-gray-200 rounded-xl hover:border-sky-400 hover:bg-sky-50 transition"
                  >
                    <div className="text-2xl mb-2">📚</div>
                    <div className="text-sm font-medium text-gray-700">Download Notes</div>
                  </button>
                  <button
                    onClick={() => navigate('/user/payments')}
                    className="p-4 text-center border-2 border-gray-200 rounded-xl hover:border-sky-400 hover:bg-sky-50 transition"
                  >
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-sm font-medium text-gray-700">Dues</div>
                  </button>
                  <button
                    onClick={() => navigate('/user/time-table')}
                    className="p-4 text-center border-2 border-gray-200 rounded-xl hover:border-sky-400 hover:bg-sky-50 transition"
                  >
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-sm font-medium text-gray-700">Time Table</div>
                  </button>
                  <button
                    onClick={() => navigate('/user/add-details')}
                    className="p-4 text-center border-2 border-gray-200 rounded-xl hover:border-sky-400 hover:bg-sky-50 transition"
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="text-sm font-medium text-gray-700">My Details</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No student data found.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default StudentDashboard
