import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import authService from './services/authService'
import AddDetails from './components/AddDetails'
import StudentList from './components/StudentList'
import SemesterResults from './components/SemesterResults'  
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import TestMarks from './components/TestMarks'
import TimeTable from './components/TimeTable'
import Notes from './components/Notes'
import Dues from './components/Dues'
// Student components
import StudentDashboard from './components/StudentDashboard'
import StudentSidebar from './components/StudentSidebar'
import StudentTestMarks from './components/StudentTestMarks'
import StudentNotes from './components/StudentNotes'
import StudentTimeTable from './components/StudentTimeTable'
import StudentDues from './components/StudentDues'
import StudentSemesterResults from './components/StudentSemesterResults'
import StudentAddDetails from './components/StudentAddDetails'


function RequireAuth({ children, allowedRoles }) {
  const token = authService.getToken()
  const role = authService.getRole()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/user/dashboard" replace />
  }

  return children
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!authService.getToken())

  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(!!authService.getToken())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/register"
          element={<Register setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/test-marks"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <TestMarks />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/time-table"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <TimeTable />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/notes"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <Notes />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/students"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <StudentList />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/semester-results"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <SemesterResults />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <Dues />
            </RequireAuth>
          }
        /> 
        <Route
          path="/admin/add-details/:id"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <AddDetails />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/add-details"
          element={
            <RequireAuth allowedRoles={['ADMIN']}>
              <AddDetails />
            </RequireAuth>
          }
        />
{/* User routes (students) - using dedicated student components */}

        <Route
          path="/user/dashboard"
          element={
            <RequireAuth allowedRoles={['STUDENT', 'USER', 'TEACHER']}>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/user/test-marks"
          element={
            <RequireAuth allowedRoles={['STUDENT', 'USER', 'TEACHER']}>
              <StudentTestMarks />
            </RequireAuth>
          }
        />
        <Route
          path="/user/semester-results"
          element={
            <RequireAuth allowedRoles={['STUDENT', 'USER', 'TEACHER']}>
              <StudentSemesterResults />
            </RequireAuth>
          }
        />
        <Route
          path="/user/notes"
          element={
            <RequireAuth allowedRoles={['STUDENT', 'USER', 'TEACHER']}>
              <StudentNotes />
            </RequireAuth>
          }
        />
        <Route
          path="/user/payments"
          element={
            <RequireAuth allowedRoles={['STUDENT', 'USER', 'TEACHER']}>
              <StudentDues />
            </RequireAuth>
          }
        />
        <Route
          path="/user/time-table"
          element={
            <RequireAuth allowedRoles={['STUDENT', 'USER', 'TEACHER']}>
              <StudentTimeTable />
            </RequireAuth>
          }
        />
        <Route
          path="/user/add-details"
          element={
            <RequireAuth allowedRoles={['STUDENT', 'USER', 'TEACHER']}>
              <StudentAddDetails />
            </RequireAuth>
          }
        />

        {/* Root & fallback */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? authService.getRole() === 'ADMIN'
                ? <Navigate to="/admin/dashboard" replace />
                : <Navigate to="/user/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App