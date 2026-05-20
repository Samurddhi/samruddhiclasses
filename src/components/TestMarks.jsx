import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import studentService from '../services/studentService'
import AdminSidebar from './AdminSidebar'

const API_URL = 'http://localhost:8080/api/test-marks'

function TestMarks() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [testMarks, setTestMarks] = useState([])
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('All')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // add-form state
  const [showAdd, setShowAdd] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    year: 'III',
    semester: '06',
    batch: '2020-2024',
    marks: '',
    details: '',
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

  const fetchTestMarks = async () => {
    try {
      const res = await axios.get(API_URL, { headers: authHeaders() })
      setTestMarks(res.data || [])
    } catch (e) {
      // silently fail for test marks background load
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchTestMarks()
  }, [])

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      !search.trim() ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.registrationNumber?.toLowerCase().includes(search.toLowerCase())
    const matchesYear = yearFilter === 'All' ? true : true // year filter not available on student model; kept for UI parity
    return matchesSearch && matchesYear
  })

  const getMarksForStudent = (student) => {
    const reg = student.registrationNumber || ''
    return testMarks.filter(
      (tm) =>
        tm.rollNumber?.toLowerCase() === reg.toLowerCase() ||
        tm.name?.toLowerCase() === (student.name || '').toLowerCase()
    )
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() })
      setTestMarks((prev) => prev.filter((x) => x.id !== id))
    } catch (e) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        authService.logout()
        navigate('/login')
        return
      }
      alert('Delete failed')
    }
  }

  const handleOpenAdd = (student) => {
    setFormData({
      name: student?.name || '',
      rollNumber: student?.registrationNumber || '',
      year: 'III',
      semester: '06',
      batch: '2020-2024',
      marks: '',
      details: '',
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

    if (!formData.name.trim() || !formData.rollNumber.trim()) {
      setAddError('Name and Roll Number are required')
      return
    }

    try {
      setAddLoading(true)
      const res = await axios.post(API_URL, formData, { headers: authHeaders() })
      setTestMarks((prev) => [...prev, res.data])
      setShowAdd(false)
      // also update student status if empty/default
      const matched = students.find(s => s.registrationNumber === formData.rollNumber)
      if (matched && matched.internalMarks === 'updated soon') {
        await studentService.updateDetails(matched.id, { internalMarks: 'Available' })
        fetchStudents()
      }
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        authService.logout()
        navigate('/login')
        return
      }
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add test mark'
      setAddError(msg)
    } finally {
      setAddLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const handleOpenView = (student) => {
    setSelectedStudent(student)
  }

  const handleCloseView = () => {
    setSelectedStudent(null)
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      {/* Shared sidebar */}
      <AdminSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Internal Marks</h1>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Students</h2>

              <div className="flex items-center space-x-3">
                {/* Year dropdown */}
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                >
                  <option value="All">All Year</option>
                  <option value="I">I Year</option>
                  <option value="II">II Year</option>
                  <option value="III">III Year</option>
                  <option value="IV">IV Year</option>
                </select>

                {/* Search box */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                  />
                  <span className="absolute left-2 top-2.5 text-gray-400">
                    🔍
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-3 text-sm text-red-600">{error}</div>
            )}

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 font-semibold text-gray-600">
                          Name
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600">
                          Registration No
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600">
                          Semester
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600">
                          Internal Marks Status
                        </th>
                        <th className="py-3 px-4 font-semibold text-gray-600 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, idx) => (
                        <tr
                          key={student.id || idx}
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">{student.name || '-'}</td>
                          <td className="py-3 px-4">{student.registrationNumber || '-'}</td>
                          <td className="py-3 px-4">{student.semester || '-'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                student.internalMarks && student.internalMarks !== 'updated soon'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {student.internalMarks || 'updated soon'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-3 text-gray-500">
                              <button
                                title="View Marks"
                                onClick={() => handleOpenView(student)}
                              >
                                👁️
                              </button>
                              <button
                                title="Add Marks"
                                onClick={() => handleOpenAdd(student)}
                              >
                                ➕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-6 text-center text-gray-500"
                          >
                            No students found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button className="px-2 py-1 border border-gray-300 rounded-lg">
                      {'<'}
                    </button>
                    <span>Page 1 of 1</span>
                    <button className="px-2 py-1 border border-gray-300 rounded-lg">
                      {'>'}
                    </button>
                  </div>
                  <div>Total Students: {filteredStudents.length}</div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add Marks Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Add Test Marks
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => !addLoading && setShowAdd(false)}
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="mb-3 text-sm text-red-600">{addError}</div>
            )}

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    name="rollNumber"
                    type="text"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                  >
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <input
                    name="semester"
                    type="text"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <input
                    name="batch"
                    type="text"
                    value={formData.batch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks
                  </label>
                  <input
                    name="marks"
                    type="text"
                    value={formData.marks}
                    onChange={handleChange}
                    placeholder="e.g. 85/100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Details
                  </label>
                  <input
                    name="details"
                    type="text"
                    value={formData.details}
                    onChange={handleChange}
                    placeholder="e.g. Unit Test 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => !addLoading && setShowAdd(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 text-sm rounded-lg bg-[#02b3ff] text-white font-semibold hover:bg-[#0294d1] disabled:opacity-50"
                >
                  {addLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Marks Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">
                Test Marks — {selectedStudent.name}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseView}
              >
                ✕
              </button>
            </div>

            {(() => {
              const marks = getMarksForStudent(selectedStudent)
              if (marks.length === 0) {
                return (
                  <div className="text-center text-gray-500 py-8">
                    No test marks found for this student.
                  </div>
                )
              }
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 font-semibold text-gray-600">Year</th>
                        <th className="py-2 px-3 font-semibold text-gray-600">Semester</th>
                        <th className="py-2 px-3 font-semibold text-gray-600">Batch</th>
                        <th className="py-2 px-3 font-semibold text-gray-600">Marks</th>
                        <th className="py-2 px-3 font-semibold text-gray-600">Details</th>
                        <th className="py-2 px-3 font-semibold text-gray-600 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((m) => (
                        <tr key={m.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3">{m.year}</td>
                          <td className="py-2 px-3">{m.semester}</td>
                          <td className="py-2 px-3">{m.batch}</td>
                          <td className="py-2 px-3 font-medium">{m.marks}</td>
                          <td className="py-2 px-3">{m.details}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              title="Delete"
                              onClick={() => handleDelete(m.id)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleCloseView}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestMarks

