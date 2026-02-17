// Path: src/components/Sidebar.jsx
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { message } from 'antd'
import Avatar from './Avatar'

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    path: '/products',
    label: 'Products',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user, userData, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    message.success('Logged out successfully')
    navigate('/login')
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="mobile-overlay lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r-2 border-black z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:flex
        `}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b-2 border-black bg-black">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-white text-lg font-bold tracking-[4px] uppercase">
                BLACK
              </h1>
              <h1 className="font-display text-gray-400 text-lg font-bold tracking-[4px] uppercase -mt-1">
                STORE
              </h1>
            </div>
            {/* Mobile close */}
            <button
              className="lg:hidden text-white hover:text-gray-300 transition-colors"
              onClick={onClose}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-sm text-black truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="font-body text-xs text-gray-500 truncate">
                {userData?.totalOrders || 0} orders
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-display font-bold uppercase tracking-[3px] text-gray-400 px-1 mb-2">
              Navigation
            </p>
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 font-body font-medium text-sm border-l-2 transition-all duration-150 cursor-pointer
                    ${isActive
                      ? 'border-white bg-black text-white'
                      : 'border-transparent text-gray-600 hover:border-black hover:text-black hover:bg-gray-50'
                    }`
                  }
                >
                  {item.icon}
                  <span className="tracking-wide">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t-2 border-black">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 font-body font-semibold text-sm text-red-600 hover:bg-red-50 border-2 border-red-200 hover:border-red-600 transition-all duration-150"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar