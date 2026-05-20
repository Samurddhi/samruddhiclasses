// Frontend/src/components/StudentNotes.jsx
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import notesService from '../services/notesService'
import StudentSidebar from './StudentSidebar'

const STUDENT_API_URL = 'http://localhost:8080/api/students'

function StudentNotes() {
  const navigate = useNavigate()

  // States
  const [student, setStudent] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)

  // Preview states
  const [showPreview, setShowPreview] = useState(false)
  const [previewBlobUrl, setPreviewBlobUrl] = useState('')
  const [previewNoteId, setPreviewNoteId] = useState('')

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

        // Load notes for this student
        const notesData = await notesService.getNotes(studentData.id)
        // Ensure backend note list fields match the table expectations
        // (id, title, filename, sizeFormatted, formattedUploadDate)
        setNotes(Array.isArray(notesData) ? notesData : [])
      } catch (err) {
        setError(err.message || 'Failed to load data')
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

  const handleDownload = async (noteId) => {
    try {
      const blob = await notesService.downloadNote(noteId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = notes.find(n => n.id === noteId)?.filename || 'note'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      setError('Download failed')
    }
  }

  const handlePreview = async (noteId) => {
    try {
      setNotesLoading(true)
      const blob = await notesService.previewNote(noteId)
      const url = URL.createObjectURL(blob)
      setPreviewBlobUrl(url)
      setPreviewNoteId(noteId)
      setShowPreview(true)
    } catch (e) {
      setError('Preview failed')
    } finally {
      setNotesLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl)
    }
  }, [previewBlobUrl])

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Download Notes</h1>
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
              <h2 className="text-lg font-semibold text-gray-800">My Notes</h2>
            </div>

            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : notes.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No notes uploaded for your profile yet. Please check back later.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 font-semibold text-gray-600 text-left">Title</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Filename</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Size</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">Upload Date</th>
                      <th className="py-3 px-4 font-semibold text-gray-600 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map((note) => (
                      <tr key={note.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-700 max-w-xs truncate">
                          {note.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{note.filename}</td>
                        <td className="py-3 px-4 text-gray-600">{note.sizeFormatted}</td>
                        <td className="py-3 px-4 text-gray-600">{note.formattedUploadDate}</td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button
                            onClick={() => handlePreview(note.id)}
                            disabled={notesLoading}
                            className="text-blue-500 hover:text-blue-700 p-1 disabled:opacity-50"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDownload(note.id)}
                            className="text-indigo-500 hover:text-indigo-700 p-1 ml-2"
                          >
                            ⬇️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>Total Notes: {notes.length}</div>
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Preview Note</h3>
              <div className="space-x-2">
                <button
                  onClick={() => handleDownload(previewNoteId)}
                  className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Download
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false)
                    URL.revokeObjectURL(previewBlobUrl)
                  }}
                  className="px-3 py-1 text-sm rounded border hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              src={previewBlobUrl}
              className="w-full flex-1 border-0"
              title="Note preview"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentNotes
