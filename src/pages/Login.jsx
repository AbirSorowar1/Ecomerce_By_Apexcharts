// Path: src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { message } from 'antd'

const Login = () => {
  const { signInWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleGoogleLogin = async () => {
    setLoading(true)
    const result = await signInWithGoogle()
    if (result.success) {
      message.success('Welcome to BlackStore!')
      navigate('/dashboard')
    } else {
      message.error('Login failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden flex-col justify-between p-16">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Diagonal stripe accent */}
        <div
          className="absolute top-0 right-0 w-40 h-full opacity-5"
          style={{
            background: 'repeating-linear-gradient(45deg, #fff, #fff 2px, transparent 2px, transparent 20px)',
          }}
        />

        {/* Top - Brand */}
        <div className="relative z-10">
          <div className="inline-block border-2 border-white px-4 py-2 mb-8">
            <span className="font-display text-white text-xs tracking-[6px] uppercase font-bold">
              Est. 2024
            </span>
          </div>
          <h1 className="font-display text-white text-5xl font-bold leading-none tracking-tight">
            BLACK
            <br />
            <span className="text-gray-400">STORE</span>
          </h1>
          <p className="font-body text-gray-400 text-lg mt-6 leading-relaxed max-w-xs">
            The world's most refined product management dashboard. Crafted with obsession.
          </p>
        </div>

        {/* Middle - Feature list */}
        <div className="relative z-10 space-y-4">
          {[
            'Real-time order tracking',
            'Advanced analytics dashboard',
            'Smart inventory management',
            'Instant Gmail authentication',
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-white flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-body text-gray-300 text-sm tracking-wide">{feat}</span>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="font-display text-gray-600 text-xs tracking-[3px] uppercase">
            © 2024 BlackStore. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-16 bg-white">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile brand */}
          <div className="lg:hidden mb-10 text-center">
            <h1 className="font-display text-black text-4xl font-bold leading-none tracking-tight">
              BLACK<span className="text-gray-400">STORE</span>
            </h1>
          </div>

          {/* Title */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-black"></div>
              <span className="font-display text-xs text-gray-500 tracking-[3px] uppercase font-bold">
                Access Portal
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-black uppercase tracking-tight leading-none">
              Sign In
              <br />
              <span className="text-gray-300">to continue</span>
            </h2>
            <p className="font-body text-gray-500 text-sm mt-4 leading-relaxed">
              Securely sign in with your Google account to access the BlackStore dashboard.
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`
              w-full flex items-center justify-center gap-4 px-6 py-5
              border-2 border-black bg-white text-black
              font-body font-bold text-sm tracking-widest uppercase
              hover:bg-black hover:text-white
              transition-all duration-200
              shadow-[4px_4px_0px_0px_#000]
              hover:shadow-[2px_2px_0px_0px_#000]
              hover:translate-x-[2px] hover:translate-y-[2px]
              disabled:opacity-50 disabled:cursor-not-allowed
              group
            `}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="group-hover:tracking-[4px] transition-all duration-200">
              {loading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="font-display text-xs text-gray-400 tracking-[3px] uppercase">Secure</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Security notes */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '🔒', label: 'Encrypted' },
              { icon: '⚡', label: 'Instant' },
              { icon: '🛡️', label: 'Protected' },
            ].map((item, i) => (
              <div key={i} className="text-center p-3 border border-gray-100 bg-gray-50">
                <div className="text-lg mb-1">{item.icon}</div>
                <p className="font-display text-xs text-gray-500 tracking-wider uppercase font-bold">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center font-body text-xs text-gray-400 mt-8 leading-relaxed">
            By signing in, you agree to our{' '}
            <span className="text-black underline cursor-pointer hover:no-underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-black underline cursor-pointer hover:no-underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
