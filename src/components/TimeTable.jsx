import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import studentService from '../services/studentService'
import AdminSidebar from './AdminSidebar'
import timetableService from '../services/timetableService'

function TimeTable() {
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [timetable, setTimetable] = useState(null)
  const [timetableLoading, setTimetableLoading] = useState(false)

  // edit modal state
  const [showEdit, setShowEdit] = useState(false)
  const [editDay, setEditDay] = useState('Monday')
  const [editPeriod, setEditPeriod] = useState('P1')
  const [editCode, setEditCode] = useState('')
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
    setTimetable(null)
    if (!student) return

    try {
      setTimetableLoading(true)
      setError('')
      const data = await timetableService.getTimetable(student.id)
      setTimetable(data)
    } catch (e) {
      setError('Failed to load timetable for this student')
      setTimetable(null)
    } finally {
      setTimetableLoading(false)
    }
  }

  const openEditModalFor = (day, periodKey) => {
    if (!timetable) return
    const daySchedule = timetable.days.find(
      (d) => d.day.toLowerCase() === day.toLowerCase()
    )

    let currentCode = ''
    if (daySchedule) {
      switch (periodKey) {
        case 'P1': currentCode = daySchedule.p1; break
        case 'P2': currentCode = daySchedule.p2; break
        case 'P3': currentCode = daySchedule.p3; break
        case 'P4': currentCode = daySchedule.p4; break
        case 'P5': currentCode = daySchedule.p5; break
        case 'P6': currentCode = daySchedule.p6; break
        default: currentCode = ''
      }
    }

    setEditDay(day)
    setEditPeriod(periodKey)
    setEditCode(currentCode || '')
    setEditError('')
    setShowEdit(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!selectedStudent) {
      setEditError('Please select a student first')
      return
    }
    if (!editCode.trim()) {
      setEditError('Subject code is required')
      return
    }

    try {
      setEditError('')
      const updated = await timetableService.updateCell(selectedStudent.id, {
        day: editDay,
        period: editPeriod,
        subjectCode: editCode.trim(),
      })
      setTimetable(updated)
      setShowEdit(false)
      // Update student status if needed
      if (selectedStudent.timetableStatus === 'updated soon') {
        await studentService.updateDetails(selectedStudent.id, { timetableStatus: 'Available' })
        loadStudents()
      }
    } catch (err) {
      setEditError('Failed to save change')
    }
  }

  const days = timetable?.days || []

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Time table</h1>
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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Time Table</h2>
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
                      <th className="py-3 px-4 font-semibold text-gray-600">Timetable Status</th>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.timetableStatus && s.timetableStatus !== 'updated soon' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {s.timetableStatus || 'updated soon'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleSelectStudent(s)}
                            className="px-3 py-1 text-xs rounded-lg bg-[#02b3ff] text-white hover:bg-[#0294d1] font-medium"
                          >
                            View Timetable
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

      {/* View Timetable Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Timetable — {selectedStudent.name} ({selectedStudent.registrationNumber})
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {timetableLoading ? (
              <div className="py-10 text-center text-gray-500">Loading timetable...</div>
            ) : !timetable ? (
              <div className="py-10 text-center text-gray-500">
                No timetable found for this student.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 font-semibold text-gray-600">Day</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">I</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">II</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">III</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">IV</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">V</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">VI</th>
                        <th className="py-3 px-4 font-semibold text-gray-600 text-center">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((row) => (
                        <tr key={row.day} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-700">{row.day}</td>
                          <td className="py-3 px-4">{row.p1}</td>
                          <td className="py-3 px-4">{row.p2}</td>
                          <td className="py-3 px-4">{row.p3}</td>
                          <td className="py-3 px-4">{row.p4}</td>
                          <td className="py-3 px-4">{row.p5}</td>
                          <td className="py-3 px-4">{row.p6}</td>
                          <td className="py-3 px-4 text-center space-x-3 text-gray-500">
                            <button
                              title="Edit day"
                              onClick={() => openEditModalFor(row.day, 'P1')}
                            >
                              ✏️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Time Table for {selectedStudent?.name}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEdit(false)}
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mb-3 text-sm text-red-600">{editError}</div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day
                </label>
                <select
                  value={editDay}
                  onChange={(e) => {
                    const val = e.target.value
                    setEditDay(val)
                    openEditModalFor(val, editPeriod)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                >
                  {days.map((d) => (
                    <option key={d.day} value={d.day}>
                      {d.day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  value={editPeriod}
                  onChange={(e) => openEditModalFor(editDay, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                >
                  <option value="P1">I</option>
                  <option value="P2">II</option>
                  <option value="P3">III</option>
                  <option value="P4">IV</option>
                  <option value="P5">V</option>
                  <option value="P6">VI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  placeholder="e.g. CS3452"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-lg bg-[#02b3ff] text-white font-semibold hover:bg-[#0294d1]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeTable

