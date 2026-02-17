// Path: src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import { ConfigProvider } from 'antd'

const antTheme = {
  token: {
    colorPrimary: '#000000',
    colorSuccess: '#000000',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#000000',
    borderRadius: 0,
    fontFamily: '"DM Sans", sans-serif',
    colorBgContainer: '#ffffff',
    colorBorder: '#000000',
    colorText: '#000000',
    colorTextSecondary: '#6b6b6b',
  },
  components: {
    Button: { borderRadius: 0, primaryColor: '#000000' },
    Input: { borderRadius: 0 },
    Select: { borderRadius: 0 },
    Modal: { borderRadius: 0 },
    Table: { headerBg: '#000000', headerColor: '#ffffff' },
    Rate: { starColor: '#000000' },
    Pagination: { borderRadius: 0 },
  },
}

const App = () => {
  return (
    <ConfigProvider theme={antTheme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected - with layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout><Products /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout><Orders /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App