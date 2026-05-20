import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import studentService from '../services/studentService'
import AdminSidebar from './AdminSidebar'
import authService from '../services/authService'

function Dues() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [duesStatus, setDuesStatus] = useState('')
  const [detailsLoading, setDetailsLoading] = useState(false)

  const [showEdit, setShowEdit] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await studentService.getAll()
      setStudents(Array.isArray(data) ? data : [])
    } catch (e) {
      if (e?.message?.includes('401') || e?.message?.includes('403')) {
        authService.logout()
        navigate('/login')
        return
      }
      setError('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((s) =>
    !search.trim() ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.registrationNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student)
    if (!student) {
      setDuesStatus('')
      return
    }
    try {
      setDetailsLoading(true)
      const data = await studentService.getById(student.id)
      setDuesStatus(data.duesStatus || 'updated soon')
    } catch (e) {
      setError('Failed to load student info')
      setDuesStatus('')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!selectedStudent) {
      setEditError('Select student first')
      return
    }
    try {
      const updated = await studentService.updateDetails(selectedStudent.id, {
        duesStatus: duesStatus
      })
      setSelectedStudent({ ...selectedStudent, duesStatus: updated.duesStatus })
      setShowEdit(false)
      loadStudents()
    } catch (err) {
      setEditError('Update failed')
    }
  }

  const handleChangeDues = (e) => {
    setDuesStatus(e.target.value)
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Dues Management</h1>
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

        <main className="p-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Dues Details</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                  />
                  <span className="absolute left-2 top-2.5 text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-3 text-sm text-red-600">{error}</div>
            )}

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading students...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 font-semibold text-gray-600">Name</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Registration No</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Semester</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Dues Status</th>
                      <th className="py-3 px-4 font-semibold text-gray-600 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, idx) => (
                      <tr key={s.id || idx} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4">{s.name || '-'}</td>
                        <td className="py-3 px-4">{s.registrationNumber || '-'}</td>
                        <td className="py-3 px-4">{s.semester || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.duesStatus && s.duesStatus !== 'updated soon' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {s.duesStatus || 'updated soon'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleSelectStudent(s)}
                            className="px-3 py-1 text-xs rounded-lg bg-[#02b3ff] text-white hover:bg-[#0294d1] font-medium"
                          >
                            View Dues
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">No students found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Dues Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Dues — {selectedStudent.name} ({selectedStudent.registrationNumber})
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-10 text-center text-gray-500">Loading dues...</div>
            ) : (
              <>
                <div className="bg-gray-50 p-6 rounded-xl mb-6">
                  <h3 className="text-lg font-semibold mb-4">Current Dues Status</h3>
                  <div className="bg-white p-4 border rounded-lg max-h-40 overflow-auto whitespace-pre-wrap">
                    {duesStatus || 'No dues info'}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-[#02b3ff] text-white rounded-lg text-sm font-semibold hover:bg-[#0294d1]"
                    onClick={() => setShowEdit(true)}
                  >
                    Edit Dues Details
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Dues Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Update Dues for {selectedStudent?.name}
              </h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ✕
              </button>
            </div>

            {editError && <div className="mb-3 text-sm text-red-600">{editError}</div>}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dues Status/Details</label>
                <textarea
                  value={duesStatus}
                  onChange={handleChangeDues}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  placeholder="Enter manual dues information, amounts, status, etc..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm rounded-lg border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-[#02b3ff] text-white font-semibold hover:bg-[#0294d1]">
                  Save Dues
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dues

