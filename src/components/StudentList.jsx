import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../services/authService'
import studentService from '../services/studentService'
import AdminSidebar from './AdminSidebar'

function StudentList() {
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const normalizeStudents = (payload) => {
    const list = Array.isArray(payload) ? payload : payload?.students || []
    return list.map((s) => ({
      id: s.id || s.studentId || s._id || '',
      name: s.name || s.studentName || '-',
      registrationNumber: s.registrationNumber || s.studentId || '-',
      email: s.email || '-',
      semester: s.semester || '-',
    }))
  }

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await studentService.getAll()
        const normalized = normalizeStudents(data)
        setStudents(normalized)
        setFilteredStudents(normalized)
      } catch (e) {
        const message = e?.message || 'Failed to load students'
        setError(message)
        if (message.toLowerCase().includes('401') || message.toLowerCase().includes('unauthorized')) {
          authService.logout()
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    loadStudents()
  }, [])

  // Filter students by name
  useEffect(() => {
    const term = searchTerm.toLowerCase()
    const filtered = students.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.registrationNumber?.toLowerCase().includes(term)
    )
    setFilteredStudents(filtered)
  }, [searchTerm, students])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Students List</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-gray-700 font-medium">admin</span>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">All Students ({filteredStudents.length})</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or reg no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>

            {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

            {loading ? (
              <div className="py-12 text-center text-gray-500">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {searchTerm ? 'No students found.' : 'No students registered yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Registration No</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Semester</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{student.name || '-'}</td>
                        <td className="px-6 py-4 text-gray-700">{student.registrationNumber || '-'}</td>
                        <td className="px-6 py-4 text-gray-700">{student.email || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {student.semester || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Link to={`/admin/add-details/${student.id}`} className="text-blue-600 hover:text-blue-900 text-sm">View Details</Link>
                            <Link to={`/admin/add-details/${student.id}`} className="text-green-600 hover:text-green-900 text-sm">Edit</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentList

