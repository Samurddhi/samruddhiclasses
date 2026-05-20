// Frontend/src/components/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import AdminSidebar from './AdminSidebar'

const ADMIN_API_URL = 'http://localhost:8080/api/admin'

function Dashboard() {
  const navigate = useNavigate()
  const role = authService.getRole()
  const [overview, setOverview] = useState({ totalStudents: 0, students: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (role !== 'ADMIN') {
      navigate('/login')
    }
  }, [role, navigate])

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true)
        setError('')
        const token = authService.getToken()

        const res = await fetch(`${ADMIN_API_URL}/overview`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.message || 'Failed to load overview')
        }

        const data = await res.json()
        setOverview({
          totalStudents: data.totalStudents || 0,
          students: data.students || [],
        })
      } catch (err) {
        setError(err.message || 'Failed to load overview')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Shared sidebar */}
      <AdminSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-800">Overview</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-gray-800">
                A
              </div>
              <span className="text-sm text-gray-800">admin</span>
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

          <p className="mb-6 text-gray-700">
            Welcome Admin <span className="font-semibold">(admin@met.com)</span>
          </p>

          {loading ? (
            <p className="text-gray-500">Loading overview...</p>
          ) : (
            <div className="space-y-6">
              <div className="inline-flex">
                <div className="bg-white shadow-md rounded-xl px-10 py-6 flex items-center space-x-4 border border-sky-200">
                  <div className="w-10 h-10 rounded-full border-2 border-sky-400 flex items-center justify-center text-sky-500">
                    🎓
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {overview.totalStudents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-800">Student Information</h2>
                </div>
                {overview.students.length === 0 ? (
                  <p className="px-6 py-6 text-gray-500">No students found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left bg-gray-50 border-b">
                          <th className="px-6 py-3 font-semibold text-gray-700">Name</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Registration No</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Semester</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.students.map((student) => (
                          <tr key={student.id || student.email} className="border-b last:border-b-0">
                            <td className="px-6 py-3 text-gray-800">{student.name || '-'}</td>
                            <td className="px-6 py-3 text-gray-700">{student.registrationNumber || '-'}</td>
                            <td className="px-6 py-3 text-gray-700">{student.email || '-'}</td>
                            <td className="px-6 py-3 text-gray-700">{student.semester || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard