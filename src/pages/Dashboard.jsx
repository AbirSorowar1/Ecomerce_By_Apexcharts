// Path: src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase/config'
import ReactApexChart from 'react-apexcharts'

const StatCard = ({ label, value, sub, icon, inverted }) => (
  <div
    className={`
      p-6 border-2 border-black
      shadow-[4px_4px_0px_0px_#000]
      animate-slide-up
      ${inverted ? 'bg-black text-white' : 'bg-white text-black'}
    `}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 flex items-center justify-center border-2
        ${inverted ? 'border-white text-white' : 'border-black text-black'}
      `}>
        {icon}
      </div>
      <span className={`font-display text-xs font-bold tracking-[3px] uppercase
        ${inverted ? 'text-gray-400' : 'text-gray-400'}
      `}>
        {label}
      </span>
    </div>
    <p className={`font-display text-3xl font-bold tracking-tight
      ${inverted ? 'text-white' : 'text-black'}
    `}>
      {value}
    </p>
    <p className={`font-body text-xs mt-1 ${inverted ? 'text-gray-400' : 'text-gray-500'}`}>
      {sub}
    </p>
  </div>
)

const Dashboard = () => {
  const { user, userData } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const ordersRef = ref(db, `orders/${user.uid}`)
    const unsubscribe = onValue(ordersRef, (snap) => {
      if (snap.exists()) {
        const data = Object.values(snap.val())
        setOrders(data)
      } else {
        setOrders([])
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  // Chart data - monthly orders (last 7 months)
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  const monthlyData = months.map((_, i) => {
    return orders.filter(o => {
      const d = new Date(o.createdAt)
      const now = new Date()
      const diff = (now.getMonth() - d.getMonth() + 12) % 12
      return diff === (6 - i)
    }).length
  })

  // Spending area chart
  const spendingData = months.map((_, i) => {
    return orders
      .filter(o => {
        const d = new Date(o.createdAt)
        const now = new Date()
        const diff = (now.getMonth() - d.getMonth() + 12) % 12
        return diff === (6 - i)
      })
      .reduce((sum, o) => sum + (o.total || 0), 0)
  })

  // Category donut
  const categoryCount = {}
  orders.forEach(o => {
    const cat = o.category || 'Other'
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  })
  const catLabels = Object.keys(categoryCount).slice(0, 5)
  const catValues = catLabels.map(c => categoryCount[c])

  const lineChartOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', sparkline: { enabled: false } },
    colors: ['#000000'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
    stroke: { curve: 'smooth', width: 2.5 },
    xaxis: {
      categories: months,
      labels: { style: { fontFamily: 'Space Mono', fontSize: '10px', colors: '#6b6b6b' } },
      axisBorder: { color: '#e5e5e5' },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontFamily: 'Space Mono', fontSize: '10px', colors: '#6b6b6b' }, formatter: (v) => Math.round(v) } },
    grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { style: { fontFamily: 'DM Sans', fontSize: '13px' }, theme: 'light' },
  }

  const barChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    colors: ['#000000'],
    plotOptions: { bar: { borderRadius: 0, columnWidth: '60%' } },
    xaxis: {
      categories: months,
      labels: { style: { fontFamily: 'Space Mono', fontSize: '10px', colors: '#6b6b6b' } },
      axisBorder: { color: '#e5e5e5' },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontFamily: 'Space Mono', fontSize: '10px', colors: '#6b6b6b' }, formatter: (v) => `$${Math.round(v)}` } },
    grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { style: { fontFamily: 'DM Sans', fontSize: '13px' } },
  }

  const donutOptions = {
    chart: { type: 'donut', background: 'transparent' },
    colors: ['#000000', '#333333', '#666666', '#999999', '#cccccc'],
    legend: {
      position: 'bottom',
      fontFamily: 'DM Sans',
      fontSize: '12px',
      labels: { colors: '#000' },
    },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', fontFamily: 'Space Mono', color: '#000', fontSize: '11px' } } } } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { style: { fontFamily: 'DM Sans' } },
  }

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const avgOrder = orders.length ? totalSpent / orders.length : 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-black text-white p-6 md:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#e5e5e5] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-display text-gray-400 text-xs tracking-[4px] uppercase font-bold mb-2">
              Welcome back
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              {user?.displayName?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="font-body text-gray-400 text-sm mt-1">
              Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white text-black px-4 py-2 flex items-center gap-2 border border-white">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-display text-xs font-bold tracking-wider uppercase">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={orders.length}
          sub="All time orders"
          inverted
          icon={
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          }
        />
        <StatCard
          label="Total Spent"
          value={`$${totalSpent.toFixed(0)}`}
          sub="Cumulative spending"
          inverted={false}
          icon={
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Avg. Order"
          value={`$${avgOrder.toFixed(0)}`}
          sub="Per transaction"
          inverted
          icon={
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
        />
        <StatCard
          label="Categories"
          value={catLabels.length || 0}
          sub="Product categories"
          inverted={false}
          icon={
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          }
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area chart - Orders over time */}
        <div className="xl:col-span-2 bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#e5e5e5]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-[2px] text-black">Order Trend</h3>
              <p className="font-body text-xs text-gray-500 mt-0.5">Monthly order count</p>
            </div>
            <span className="tag text-xs">7 Months</span>
          </div>
          <ReactApexChart
            options={lineChartOptions}
            series={[{ name: 'Orders', data: monthlyData }]}
            type="area"
            height={220}
          />
        </div>

        {/* Donut - Categories */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#e5e5e5]">
          <div className="mb-6">
            <h3 className="font-display text-sm font-bold uppercase tracking-[2px] text-black">Categories</h3>
            <p className="font-body text-xs text-gray-500 mt-0.5">Order distribution</p>
          </div>
          {catLabels.length > 0 ? (
            <ReactApexChart
              options={{ ...donutOptions, labels: catLabels }}
              series={catValues}
              type="donut"
              height={220}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 border-2 border-black flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="font-display text-xs font-bold uppercase tracking-wider text-gray-400">No data yet</p>
                <p className="font-body text-xs text-gray-300 mt-1">Place an order first</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar chart - Spending */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#e5e5e5]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-[2px] text-black">Spending</h3>
              <p className="font-body text-xs text-gray-500 mt-0.5">Monthly expenditure ($)</p>
            </div>
            <span className="tag text-xs">Bar</span>
          </div>
          <ReactApexChart
            options={barChartOptions}
            series={[{ name: 'Spending ($)', data: spendingData }]}
            type="bar"
            height={200}
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#e5e5e5] overflow-hidden">
          <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-display text-xs font-bold uppercase tracking-[3px] text-white">Recent Orders</h3>
            <span className="font-display text-xs text-gray-400 tracking-wider">{recentOrders.length} shown</span>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-display text-xs font-bold uppercase tracking-wider text-gray-400">No orders yet</p>
              <p className="font-body text-xs text-gray-300 mt-1">Go to Products to place your first order!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order, i) => (
                <div key={order.id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {order.image ? (
                      <img src={order.image} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-black truncate">{order.title || 'Product'}</p>
                    <p className="font-body text-xs text-gray-400 truncate">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-sm text-black">${(order.total || 0).toFixed(2)}</p>
                    <span className={`badge text-xs ${
                      order.status === 'delivered' ? 'badge-success' :
                      order.status === 'pending' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {order.status || 'ordered'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
