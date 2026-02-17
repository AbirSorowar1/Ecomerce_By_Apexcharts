// Path: src/components/Avatar.jsx
// Handles Google profile pictures correctly with referrerPolicy fix
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Avatar = ({ size = 'md', className = '', showBorder = true }) => {
    const { user } = useAuth()
    const [imgError, setImgError] = useState(false)

    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-24 h-24 text-3xl',
        xl: 'w-28 h-28 text-4xl',
    }

    const borderClass = showBorder ? 'border-2 border-black' : ''
    const sizeClass = sizes[size] || sizes.md

    // Google photo URL - upgrade to higher resolution
    const photoURL = user?.photoURL
        ? user.photoURL
            .replace('=s96-c', '=s400-c')
            .replace('=s96', '=s400')
            .replace(/=s\d+-c/, '=s400-c')
        : null

    const initials = user?.displayName
        ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U'

    if (photoURL && !imgError) {
        return (
            <img
                src={photoURL}
                alt={user?.displayName || 'User'}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className={`${sizeClass} ${borderClass} object-cover flex-shrink-0 ${className}`}
                onError={() => setImgError(true)}
            />
        )
    }

    return (
        <div className={`${sizeClass} ${borderClass} bg-black flex items-center justify-center flex-shrink-0 ${className}`}>
            <span className={`font-display font-bold text-white`}>
                {initials}
            </span>
        </div>
    )
}

export default Avatar