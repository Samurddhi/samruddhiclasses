// Frontend/src/components/StudentAddDetails.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import StudentSidebar from './StudentSidebar'

const STUDENT_API_URL = 'http://localhost:8080/api/students'

function StudentAddDetails() {
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ name: '', registrationNumber: '', semester: '' })


  const authHeaders = () => {
    const token = authService.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true)
        setError('')

        const studentRes = await fetch(`${STUDENT_API_URL}/me`, {
          headers: authHeaders(),
        })
        if (!studentRes.ok) throw new Error('Failed to load student data')
        const studentData = await studentRes.json()
        setStudent(studentData)
        setForm({
          name: studentData.name || '',
          registrationNumber: studentData.registrationNumber || '',
          semester: studentData.semester || '',
        })
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      const payload = {
        name: form.name,
        registrationNumber: form.registrationNumber,
        semester: form.semester,
      }

      const token = authService.getToken()
      const res = await fetch(`${STUDENT_API_URL}/me/details`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.message || errBody.error || 'Failed to update details')
      }

      const updated = await res.json()
      setStudent(updated)
      setForm({
        name: updated.name || '',
        registrationNumber: updated.registrationNumber || '',
        semester: updated.semester || '',
      })
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to update details')
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <StudentSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading student details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-800">My Details</h1>
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

        <main className="flex-1 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
              {error}
            </div>
          )}

          {student && (
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-2xl">
              {/* Student Header */}
              <div className="mb-8 p-6 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                    <p className="text-gray-600">
                      {student.registrationNumber} - Semester {student.semester}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setIsEditing((v) => !v)
                        setError('')
                      }}
                      className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold"
                    >
                      {isEditing ? 'Close Edit' : 'Edit'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>

                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="text-gray-800 font-medium">{student.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-gray-800 font-medium">{student.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Registration Number</p>
                      <p className="text-gray-800 font-medium">{student.registrationNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Semester</p>
                      <p className="text-gray-800 font-medium">{student.semester || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <input
                        type="text"
                        value={student.email || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Registration Number</p>
                      <input
                        name="registrationNumber"
                        type="text"
                        value={form.registrationNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Semester</p>
                      <input
                        name="semester"
                        type="text"
                        value={form.semester}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02b3ff] focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="flex justify-end mt-6 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setError('')
                        setForm({
                          name: student.name || '',
                          registrationNumber: student.registrationNumber || '',
                          semester: student.semester || '',
                        })
                      }}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {/* Academic Status */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Internal Marks</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.internalMarks)}`}>
                      {student.internalMarks || 'updated soon'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Notes Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.notesStatus)}`}>
                      {student.notesStatus || 'updated soon'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dues Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.duesStatus)}`}>
                      {student.duesStatus || 'updated soon'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Time Table Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.timetableStatus)}`}>
                      {student.timetableStatus || 'updated soon'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Semester Marks Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.semesterMarksStatus)}`}>
                      {student.semesterMarksStatus || 'updated soon'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> For any discrepancies in your information, please contact the admin office.
                </p>
              </div>

              {/* Back Button */}
              <div className="flex justify-start mt-6">
                <button
                  onClick={() => navigate('/user/dashboard')}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default StudentAddDetails
