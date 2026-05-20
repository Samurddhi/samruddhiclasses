// src/components/AdminSidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom'

const menuItems = [
  { label: 'Overview', route: '/admin/dashboard' },
{ label: 'Students', route: '/admin/students' },
  { label: 'Internal Marks', route: '/admin/test-marks' },   // your Test Marks page
{ label: 'Semester Results', route: '/admin/semester-results' },
{ label: 'Download Notes', route: '/admin/notes' },
{ label: 'Dues Management', route: '/admin/payments' },

{ label: 'Add Details', route: '/admin/add-details' },
  { label: 'Time Table', route: '/admin/time-table' },
]

function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-6 border-b">
        <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded mr-3 font-bold">
          M
        </div>
        <span className="text-xl font-semibold tracking-wide">MET</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.route)

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={
                'w-full text-left px-6 py-3 text-sm font-medium flex items-center ' +
                (isActive
                  ? 'bg-sky-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100')
              }
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default AdminSidebar