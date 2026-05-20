// Frontend/src/components/StudentTimeTable.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import timetableService from '../services/timetableService'
import StudentSidebar from './StudentSidebar'

function StudentTimeTable() {
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [timetable, setTimetable] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const token = authService.getToken()
        if (!token) {
          setError('Session expired. Please login again.')
          navigate('/login')
          return
        }

        // If your Student model endpoint exists, keep semester display.
        // If it fails, still show timetable.
        try {
          const studentRes = await fetch('http://localhost:8080/api/students/me', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          if (studentRes.ok) setStudent(await studentRes.json())
        } catch (e) {
          // ignore student fetch errors
        }

        const tt = await timetableService.getMyTimetable()
        setTimetable(tt)
      } catch (err) {
        const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message
        if (msg) setError(msg)
        else setError('Failed to load timetable')

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          authService.logout()
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const days = timetable?.days || []


  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Time Table</h1>
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
              <h2 className="text-lg font-semibold text-gray-800">My Time Table</h2>
              {student && (
                <span className="text-sm text-gray-500">
                  Semester: {student.semester || '-'}
                </span>
              )}
            </div>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : !timetable ? (
              <div className="py-10 text-center text-gray-500">
                No timetable found for your profile. Please check back later.
              </div>
            ) : days.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No timetable available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-3 px-4 font-semibold text-gray-600">Day</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">I</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">II</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">III</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">IV</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">V</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">VI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((row) => (
                      <tr key={row.day} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-700">{row.day}</td>
                        <td className="py-3 px-4">{row.p1 || '-'}</td>
                        <td className="py-3 px-4">{row.p2 || '-'}</td>
                        <td className="py-3 px-4">{row.p3 || '-'}</td>
                        <td className="py-3 px-4">{row.p4 || '-'}</td>
                        <td className="py-3 px-4">{row.p5 || '-'}</td>
                        <td className="py-3 px-4">{row.p6 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>Total Days: {days.length}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentTimeTable
