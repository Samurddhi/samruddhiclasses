// src/components/StudentSidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom'

const menuItems = [
  { label: 'Dashboard', route: '/user/dashboard' },
  { label: 'Internal Marks', route: '/user/test-marks' },
  { label: 'Semester Results', route: '/user/semester-results' },
  { label: 'Download Notes', route: '/user/notes' },
  { label: 'Dues Management', route: '/user/payments' },
  { label: 'Time Table', route: '/user/time-table' },
  { label: 'My Details', route: '/user/add-details' },
]

function StudentSidebar() {
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

export default StudentSidebar
