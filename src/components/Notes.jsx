import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import notesService from '../services/notesService'
import studentService from '../services/studentService'
import authService from '../services/authService'

function Notes() {
  const navigate = useNavigate()
  const previewRef = useRef(null)

  // Main states
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Selected student detail view
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [notes, setNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(false)

  // Modals
  const [showUpload, setShowUpload] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState('')
  const [editingTitle, setEditingTitle] = useState('')
  const [previewNoteId, setPreviewNoteId] = useState('')
  const [previewBlobUrl, setPreviewBlobUrl] = useState('')

  // Upload form
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)

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

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student)
    setNotes([])
    if (!student) return

    try {
      setNotesLoading(true)
      setError('')
      const data = await notesService.getNotes(student.id)
      setNotes(data || [])
    } catch (e) {
      setError('Failed to load notes for this student')
      setNotes([])
    } finally {
      setNotesLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const handleUpload = async () => {
    if (!uploadFile || !selectedStudent) return
    try {
      setUploadLoading(true)
      await notesService.uploadNote(selectedStudent.id, uploadTitle || uploadFile.name, uploadFile)
      setShowUpload(false)
      setUploadTitle('')
      setUploadFile(null)
      // Reload notes
      handleSelectStudent(selectedStudent)
      // Update student status if needed
      if (selectedStudent.notesStatus === 'updated soon') {
        await studentService.updateDetails(selectedStudent.id, { notesStatus: 'Available' })
        loadStudents()
      }
    } catch (e) {
      setError('Upload failed: ' + e.message)
    } finally {
      setUploadLoading(false)
    }
  }

  const handleEditTitle = (note) => {
    setEditingNoteId(note.id)
    setEditingTitle(note.title)
    setShowEdit(true)
  }

  const saveEdit = async () => {
    try {
      await notesService.updateNote(editingNoteId, editingTitle)
      setShowEdit(false)
      handleSelectStudent(selectedStudent)
    } catch (e) {
      setError('Update failed')
    }
  }

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note?')) return
    try {
      await notesService.deleteNote(noteId)
      handleSelectStudent(selectedStudent)
    } catch (e) {
      setError('Delete failed')
    }
  }

  const handlePreview = async (noteId) => {
    try {
      const blob = await notesService.previewNote(noteId)
      const url = URL.createObjectURL(blob)
      setPreviewBlobUrl(url)
      setPreviewNoteId(noteId)
      setShowPreview(true)
    } catch (e) {
      setError('Preview failed')
    }
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

  useEffect(() => {
    return () => {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl)
    }
  }, [previewBlobUrl])

  return (
    <div className="min-h-screen bg-[#f3f6fb] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Download Notes</h1>
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
              <h2 className="text-lg font-semibold text-gray-800">Student Notes</h2>
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

            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

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
                      <th className="py-3 px-4 font-semibold text-gray-600">Notes Status</th>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.notesStatus && s.notesStatus !== 'updated soon' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {s.notesStatus || 'updated soon'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleSelectStudent(s)}
                            className="px-3 py-1 text-xs rounded-lg bg-[#02b3ff] text-white hover:bg-[#0294d1] font-medium"
                          >
                            View Notes
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

      {/* View Notes Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Notes — {selectedStudent.name} ({selectedStudent.registrationNumber})
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-end mb-4">
              <button
                className="px-4 py-2 bg-[#02b3ff] text-white rounded-lg text-sm font-semibold hover:bg-[#0294d1] transition"
                onClick={() => setShowUpload(true)}
              >
                + Upload Note
              </button>
            </div>

            {notesLoading ? (
              <div className="py-10 text-center text-gray-500">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No notes uploaded for this student.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
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
                    {notes.map(note => (
                      <tr key={note.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-700 max-w-xs truncate">{note.title}</td>
                        <td className="py-3 px-4 text-gray-600">{note.filename}</td>
                        <td className="py-3 px-4 text-gray-600">{note.sizeFormatted}</td>
                        <td className="py-3 px-4 text-gray-600">{note.formattedUploadDate}</td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button onClick={() => handlePreview(note.id)} className="text-blue-500 hover:text-blue-700 p-1">👁️</button>
                          <button onClick={() => handleEditTitle(note)} className="text-green-500 hover:text-green-700 p-1">✏️</button>
                          <button onClick={() => handleDelete(note.id)} className="text-red-500 hover:text-red-700 p-1">🗑️</button>
                          <button onClick={() => handleDownload(note.id)} className="text-indigo-500 hover:text-indigo-700 p-1 ml-2">⬇️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Note for {selectedStudent?.name}</h3>
              <button onClick={() => setShowUpload(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02b3ff]"
                  placeholder="Note title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  onChange={e => setUploadFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                />
                {uploadFile && <p className="text-sm text-gray-500 mt-1">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</p>}
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button onClick={() => setShowUpload(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100">
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploadLoading}
                  className="px-4 py-2 text-sm rounded-lg bg-[#02b3ff] text-white font-semibold hover:bg-[#0294d1] disabled:opacity-50"
                >
                  {uploadLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Title Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Title</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <input
              type="text"
              value={editingTitle}
              onChange={e => setEditingTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02b3ff] mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={saveEdit} className="px-4 py-2 text-sm rounded-lg bg-[#02b3ff] text-white hover:bg-[#0294d1]">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Preview Note</h3>
              <div className="space-x-2">
                <button onClick={() => handleDownload(previewNoteId)} className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600">Download</button>
                <button onClick={() => {setShowPreview(false); URL.revokeObjectURL(previewBlobUrl)}} className="px-3 py-1 text-sm rounded border hover:bg-gray-100">Close</button>
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

export default Notes

