import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import studentService from '../services/studentService'
import AdminSidebar from './AdminSidebar'

const API_URL = 'http://localhost:8080/api/admin/semester-results'

function SemesterResults() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentResults, setStudentResults] = useState([])
  const [resultsLoading, setResultsLoading] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [formData, setFormData] = useState({
    studentId: '',
    semester: 'I Sem',
    examMonth: 'Dec 2024',
    total: '',
    grade: '',
  })

  const authHeaders = () => {
    const token = authService.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchStudents = async () => {
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

  useEffect(() => {
    fetchStudents()
  }, [])

  const filteredStudents = students.filter((s) =>
    !search.trim() ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.registrationNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenView = async (student) => {
    setSelectedStudent(student)
    setStudentResults([])
    try {
      setResultsLoading(true)
      const res = await axios.get(`${API_URL}/student/${student.id}`, {
        headers: authHeaders(),
      })
      setStudentResults(res.data || [])
    } catch (e) {
      setStudentResults([])
    } finally {
      setResultsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this semester result?')) return
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() })
      setStudentResults((prev) => prev.filter((x) => x.id !== id))
    } catch {
      alert('Delete failed')
    }
  }

  const handleOpenAdd = (student) => {
    setFormData({
      studentId: student?.registrationNumber || '',
      semester: 'I Sem',
      examMonth: 'Dec 2024',
      total: '',
      grade: '',
    })
    setAddError('')
    setShowAdd(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitAdd = async (e) => {
    e.preventDefault()
    setAddError('')

    if (!formData.studentId.trim() || !formData.semester.trim()) {
      setAddError('Student ID and Semester are required')
      return
    }

    try {
      setAddLoading(true)
      const res = await axios.post(API_URL, formData, { headers: authHeaders() })
      // If viewing the same student, append to list
      if (selectedStudent && selectedStudent.registrationNumber === formData.studentId) {
        setStudentResults((prev) => [...prev, res.data])
      }
      setShowAdd(false)
      // Update status on matching student
      const matched = students.find(s => s.registrationNumber === formData.studentId)
      if (matched && matched.semesterMarksStatus === 'updated soon') {
        await studentService.updateDetails(matched.id, { semesterMarksStatus: 'Available' })
        fetchStudents()
      }
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        authService.logout()
        navigate('/login')
        return
      }
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to add result'
      setAddError(msg)
    } finally {
      setAddLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Semester Results</h1>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Semester Results</h2>

              <div className="flex items-center space-x-3">
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

                <button
                  className="px-4 py-2 bg-[#02b3ff] text-white rounded-lg text-sm font-semibold hover:bg-[#0294d1] transition"
                  onClick={() => handleOpenAdd(null)}
                >
                  Add
                </button>
              </div>
            </div>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 font-semibold text-gray-600">Name</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">Registration No</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">Semester</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">Semester Marks Status</th>
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
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.semesterMarksStatus && s.semesterMarksStatus !== 'updated soon' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              {s.semesterMarksStatus || 'updated soon'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-3 text-gray-500">
                              <button title="View Results" onClick={() => handleOpenView(s)}>👁️</button>
                              <button title="Add Result" onClick={() => handleOpenAdd(s)}>➕</button>
                            </div>
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

                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button className="px-2 py-1 border border-gray-300 rounded-lg">{'<'}</button>
                    <span>Page 1 of 1</span>
                    <button className="px-2 py-1 border border-gray-300 rounded-lg">{'>'}</button>
                  </div>
                  <div>Total Students: {filteredStudents.length}</div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* View Results Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">
                Semester Results — {selectedStudent.name} ({selectedStudent.registrationNumber})
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            {resultsLoading ? (
              <div className="py-10 text-center text-gray-500">Loading results...</div>
            ) : studentResults.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No semester results found for this student.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 font-semibold text-gray-600">Semester</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Exam Month</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Total</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Grade</th>
                      <th className="py-3 px-4 font-semibold text-gray-600 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentResults.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.semester}</td>
                        <td className="py-3 px-4">{item.examMonth}</td>
                        <td className="py-3 px-4">{item.total}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            {item.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button title="Delete" onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-600">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Result Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Semester Result</h3>
              <button onClick={() => !addLoading && setShowAdd(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {addError && <div className="mb-3 text-sm text-red-600">{addError}</div>}

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input name="studentId" type="text" value={formData.studentId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input name="semester" type="text" value={formData.semester} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Month</label>
                <input name="examMonth" type="text" value={formData.examMonth} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input name="total" type="number" value={formData.total} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input name="grade" type="text" value={formData.grade} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => !addLoading && setShowAdd(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100" disabled={addLoading}>
                  Cancel
                </button>
                <button type="submit" disabled={addLoading} className="px-4 py-2 text-sm rounded-lg bg-[#02b3ff] text-white font-semibold hover:bg-[#0294d1] disabled:opacity-50">
                  {addLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SemesterResults

