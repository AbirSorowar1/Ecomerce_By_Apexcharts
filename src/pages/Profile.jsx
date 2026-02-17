// Path: src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ref, onValue, update } from 'firebase/database'
import { db } from '../firebase/config'
import { message, Modal } from 'antd'
import ReactApexChart from 'react-apexcharts'
import Avatar from '../components/Avatar'

const Profile = () => {
  const { user, userData, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(false)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    setDisplayName(user?.displayName || '')
  }, [user])

  useEffect(() => {
    if (!user) return
    const ordersRef = ref(db, `orders/${user.uid}`)
    const unsubscribe = onValue(ordersRef, (snap) => {
      if (snap.exists()) {
        const data = Object.values(snap.val()).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        setOrders(data)
      } else {
        setOrders([])
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const avgOrder = orders.length ? totalSpent / orders.length : 0

  // Category spending breakdown
  const catSpending = {}
  orders.forEach(o => {
    const cat = o.category || 'Other'
    catSpending[cat] = (catSpending[cat] || 0) + (o.total || 0)
  })
  const catLabels = Object.keys(catSpending)
  const catValues = catLabels.map(c => parseFloat(catSpending[c].toFixed(2)))

  // Monthly order history (last 6 months)
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  const monthlyOrders = months.map((_, i) =>
    orders.filter(o => {
      const d = new Date(o.createdAt)
      const now = new Date()
      return ((now.getMonth() - d.getMonth() + 12) % 12) === (5 - i)
    }).length
  )

  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    colors: ['#000'],
    plotOptions: { bar: { borderRadius: 0, columnWidth: '55%' } },
    xaxis: {
      categories: months,
      labels: { style: { fontFamily: 'Space Mono', fontSize: '10px', colors: '#999' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontFamily: 'Space Mono', fontSize: '10px', colors: '#999' }, formatter: v => Math.round(v) } },
    grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { style: { fontFamily: 'DM Sans' } },
  }

  const donutOptions = {
    chart: { type: 'donut', background: 'transparent' },
    colors: ['#000', '#222', '#444', '#666', '#888', '#aaa'],
    labels: catLabels,
    legend: {
      position: 'bottom',
      fontFamily: 'DM Sans',
      fontSize: '11px',
      labels: { colors: '#000' },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            value: { fontFamily: 'Space Mono', color: '#000', fontSize: '16px', fontWeight: 'bold', formatter: v => `$${parseFloat(v).toFixed(0)}` },
            total: { show: true, label: 'Total Spent', fontFamily: 'Space Mono', color: '#666', fontSize: '10px', formatter: () => `$${totalSpent.toFixed(0)}` },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { y: { formatter: v => `$${v.toFixed(2)}` } },
  }

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) { message.error('Name cannot be empty'); return }
    try {
      await update(ref(db, `users/${user.uid}`), { displayName })
      message.success('Profile updated')
      setEditModal(false)
    } catch {
      message.error('Failed to update profile')
    }
  }

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Profile Hero */}
      <div className="bg-black text-white border-2 border-black shadow-[6px_6px_0px_0px_#e5e5e5] overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff, #fff 1px, transparent 1px, transparent 20px)',
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-8">
          <div className="relative flex-shrink-0">
            <Avatar size="xl" className="border-4 border-white" showBorder={false} />
            <div className="absolute -bottom-1 -right-1 bg-green-400 w-4 h-4 border-2 border-black rounded-full" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {userData?.displayName || user?.displayName || 'User'}
              </h1>
              <span className="inline-block bg-white text-black font-display text-[10px] font-bold tracking-[3px] uppercase px-3 py-1 mx-auto sm:mx-0">
                Member
              </span>
            </div>
            <p className="font-body text-gray-400 text-sm">{user?.email}</p>
            <p className="font-body text-gray-600 text-xs mt-1">
              Joined {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-5">
              {[
                { label: 'Orders', value: orders.length },
                { label: 'Total Spent', value: `$${totalSpent.toFixed(0)}` },
                { label: 'Avg Order', value: `$${avgOrder.toFixed(0)}` },
              ].map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <p className="font-display font-bold text-xl text-white">{stat.value}</p>
                  <p className="font-display text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Edit button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setEditModal(true)}
              className="border-2 border-white text-white px-5 py-2 font-display font-bold text-xs tracking-[3px] uppercase hover:bg-white hover:text-black transition-all duration-150"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: '📦' },
          { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, icon: '💳' },
          { label: 'Avg per Order', value: `$${avgOrder.toFixed(2)}`, icon: '📊' },
          { label: 'Categories', value: catLabels.length, icon: '🏷️' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-5 border-2 border-black shadow-[3px_3px_0px_0px_#e5e5e5] ${i === 0 ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className={`font-display text-xl font-bold ${i === 0 ? 'text-white' : 'text-black'}`}>{stat.value}</p>
            <p className={`font-display text-[10px] uppercase tracking-wider mt-0.5 ${i === 0 ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly bar chart */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#e5e5e5]">
          <h3 className="font-display text-sm font-bold uppercase tracking-[2px] text-black mb-1">Order Activity</h3>
          <p className="font-body text-xs text-gray-400 mb-5">Last 6 months</p>
          <ReactApexChart
            options={barOptions}
            series={[{ name: 'Orders', data: monthlyOrders }]}
            type="bar"
            height={200}
          />
        </div>

        {/* Category spending donut */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#e5e5e5]">
          <h3 className="font-display text-sm font-bold uppercase tracking-[2px] text-black mb-1">Spending by Category</h3>
          <p className="font-body text-xs text-gray-400 mb-5">All-time breakdown</p>
          {catLabels.length > 0 ? (
            <ReactApexChart
              options={donutOptions}
              series={catValues}
              type="donut"
              height={200}
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="font-display text-xs text-gray-300 uppercase tracking-wider font-bold">No spending data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#e5e5e5] overflow-hidden">
        <div className="bg-black px-6 py-4">
          <h3 className="font-display text-xs font-bold uppercase tracking-[3px] text-white">Account Information</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { label: 'Full Name', value: userData?.displayName || user?.displayName },
            { label: 'Email Address', value: user?.email },
            { label: 'Auth Provider', value: 'Google' },
            { label: 'User ID', value: user?.uid?.slice(0, 20) + '...' },
            { label: 'Member Since', value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 px-6 py-4 hover:bg-gray-50 transition-colors">
              <span className="font-display text-[11px] font-bold uppercase tracking-[2px] text-gray-400 sm:w-40 flex-shrink-0">{item.label}</span>
              <span className="font-body text-sm text-black break-all">{item.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders on Profile */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#e5e5e5] overflow-hidden">
        <div className="bg-black px-6 py-4 flex items-center justify-between">
          <h3 className="font-display text-xs font-bold uppercase tracking-[3px] text-white">Recent Order History</h3>
          <span className="font-display text-xs text-gray-400 tracking-wider">Last {recentOrders.length}</span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[3px] text-gray-300">No orders yet</p>
            <p className="font-body text-sm text-gray-300 mt-2">Head over to Products to shop!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order, i) => (
              <div key={order.id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-gray-50 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {order.image ? (
                    <img src={order.image} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="font-display font-bold text-sm text-gray-400">?</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-black truncate">{order.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-body text-xs text-gray-400">×{order.quantity || 1}</span>
                    <span className="text-gray-300">·</span>
                    <span className="font-body text-xs text-gray-400 capitalize">{order.category}</span>
                    <span className="text-gray-300">·</span>
                    <span className="font-body text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-sm text-black">${order.total?.toFixed(2)}</p>
                  <span className={`font-display text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                    }`}>
                    {order.status || 'ordered'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white border-2 border-red-300 p-6">
        <h3 className="font-display text-sm font-bold uppercase tracking-[2px] text-red-600 mb-3">Danger Zone</h3>
        <p className="font-body text-sm text-gray-500 mb-4">Actions here are irreversible. Proceed with caution.</p>
        <button
          onClick={async () => {
            await logout()
            message.info('Signed out successfully')
          }}
          className="border-2 border-red-500 text-red-600 px-5 py-2 font-display font-bold text-xs tracking-[2px] uppercase hover:bg-red-500 hover:text-white transition-all duration-150"
        >
          Sign Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={handleUpdateProfile}
        okText="Save Changes"
        title="Edit Profile"
        okButtonProps={{ className: 'btn-primary border-none' }}
        cancelButtonProps={{ className: 'btn-outline' }}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="font-display text-xs font-bold uppercase tracking-wider text-black block mb-2">
              Display Name
            </label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="Enter your name..."
            />
          </div>
          <div>
            <label className="font-display text-xs font-bold uppercase tracking-wider text-black block mb-2">
              Email (read-only)
            </label>
            <input
              value={user?.email || ''}
              disabled
              className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200">
            <p className="font-body text-xs text-gray-500">
              ℹ️ Profile photo is synced from your Google account and cannot be changed here.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Profile