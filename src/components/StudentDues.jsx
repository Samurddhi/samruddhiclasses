// Frontend/src/components/StudentDues.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import studentService from '../services/studentService'
import StudentSidebar from './StudentSidebar'

const STUDENT_API_URL = 'http://localhost:8080/api/students'

function StudentDues() {
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [duesStatus, setDuesStatus] = useState('')
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
        setDuesStatus(studentData.duesStatus || 'updated soon')
      } catch (err) {
        setError(err.message || 'Failed to load dues information')
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

  const getStatusColor = (status) => {
    if (!status || status === 'updated soon') {
      return 'bg-gray-100 text-gray-600'
    }
    if (status.toLowerCase().includes('paid') || status.toLowerCase().includes('cleared')) {
      return 'bg-green-100 text-green-800'
    }
    if (status.toLowerCase().includes('pending') || status.toLowerCase().includes('due')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Dues Management</h1>
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
              <h2 className="text-lg font-semibold text-gray-800">My Dues Status</h2>
              {student && (
                <span className="text-sm text-gray-500">
                  Reg No: {student.registrationNumber || '-'}
                </span>
              )}
            </div>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-base font-semibold mb-4 text-gray-700">Current Dues Status</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`px-4 py-2 rounded-full text-lg font-semibold ${getStatusColor(duesStatus)}`}>
                      {duesStatus || 'updated soon'}
                    </span>
                  </div>
                  <div className="bg-white p-4 border rounded-lg">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {duesStatus || 'No dues information available. Please check back later.'}
                    </p>
                  </div>
                </div>

                {/* Student Info */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-base font-semibold mb-4 text-gray-700">My Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-gray-800 font-medium">{student?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="text-gray-800 font-medium">{student?.registrationNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800 font-medium">{student?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Semester</p>
                      <p className="text-gray-800 font-medium">{student?.semester || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> For any queries regarding your dues, please contact the admin office.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentDues
