import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import AdminSidebar from './AdminSidebar';
import studentService from '../services/studentService';
import { useLocation } from 'react-router-dom';

function AddDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const role = authService.getRole();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});

  const isSelfUpdate = !id && role === 'STUDENT'; // For student self

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await studentService.getById(id);
          setStudent(data);
          setFormData({
            internalMarks: data.internalMarks || '',
            notesStatus: data.notesStatus || '',
            duesStatus: data.duesStatus || '',
            timetableStatus: data.timetableStatus || '',
            semesterMarksStatus: data.semesterMarksStatus || ''
          });
        } else if (isSelfUpdate) {
          // For student self, need to find by email - assume /api/students/me endpoint or first
          // For now, redirect or placeholder
          setError('Student self-update not fully implemented. Use admin view.');
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStudent();
  }, [id, isSelfUpdate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return setError('No student ID');
    try {
      setSaving(true);
      setError('');
      const details = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined) details[key] = formData[key] || 'updated soon';
      });
      const updated = await studentService.updateDetails(id, details);
      setStudent(updated);
      alert('Details updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 flex items-center justify-center">
        <p>Loading student details...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-800">{student?.name || 'Add Student Details'}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-gray-800">A</div>
              <span className="text-sm text-gray-800">admin</span>
            </div>
            <button onClick={handleLogout} className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm font-medium">
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-8">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}
          {student && (
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-2xl">
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                <p className="text-gray-600">{student.registrationNumber} - {student.semester}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Marks</label>
                  <textarea name="internalMarks" value={formData.internalMarks || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter internal marks details..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Download Notes Status</label>
                  <textarea name="notesStatus" value={formData.notesStatus || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Notes status..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dues Status</label>
                  <textarea name="duesStatus" value={formData.duesStatus || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Dues information..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timetable Status</label>
                  <textarea name="timetableStatus" value={formData.timetableStatus || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Timetable details..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester Marks Status</label>
                  <textarea name="semesterMarksStatus" value={formData.semesterMarksStatus || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Semester marks..." />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Details'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AddDetails;

