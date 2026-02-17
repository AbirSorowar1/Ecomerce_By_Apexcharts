// Path: src/components/Navbar.jsx
import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview & Analytics' },
  '/products': { title: 'Products', sub: 'Browse & Manage Products' },
  '/orders': { title: 'Orders', sub: 'Track Your Orders' },
  '/profile': { title: 'Profile', sub: 'Your Account Settings' },
}

const Navbar = ({ onMenuClick }) => {
  const location = useLocation()
  const { user, userData } = useAuth()
  const page = pageTitles[location.pathname] || { title: 'BlackStore', sub: '' }

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-30 animate-fade-in">
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-4">
          {/* Hamburger - only on mobile */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 hover:bg-gray-100 transition-colors border border-transparent hover:border-black"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <span className="w-5 h-0.5 bg-black block"></span>
            <span className="w-5 h-0.5 bg-black block"></span>
            <span className="w-3 h-0.5 bg-black block"></span>
          </button>

          <div>
            <h2 className="font-display font-bold text-sm md:text-base uppercase tracking-[3px] text-black">
              {page.title}
            </h2>
            <p className="font-body text-xs text-gray-500 hidden sm:block">
              {page.sub}
            </p>
          </div>
        </div>

        {/* Right: Stats + User */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Stats chips */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black text-white px-3 py-1.5 text-xs font-display font-bold tracking-wider uppercase">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              </svg>
              {userData?.totalOrders || 0} Orders
            </div>
            <div className="flex items-center gap-2 bg-gray-100 text-black px-3 py-1.5 text-xs font-display font-bold tracking-wider uppercase border border-black">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              ${(userData?.totalSpent || 0).toFixed(2)}
            </div>
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="font-body font-semibold text-xs text-black leading-tight">
                {user?.displayName?.split(' ')[0] || 'User'}
              </p>
              <p className="font-body text-xs text-gray-500 leading-tight">Admin</p>
            </div>
            <Avatar size="sm" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar