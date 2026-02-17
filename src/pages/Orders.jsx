// Path: src/pages/Orders.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ref, onValue, remove, update } from 'firebase/database'
import { db } from '../firebase/config'
import { Modal, Select, message, Empty } from 'antd'
import ReactApexChart from 'react-apexcharts'

const statusColors = {
  ordered: 'bg-blue-100 text-blue-800 border border-blue-200',
  processing: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  shipped: 'bg-purple-100 text-purple-800 border border-purple-200',
  delivered: 'bg-green-100 text-green-800 border border-green-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
}

const OrderRow = ({ order, onEdit, onDelete }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
    {/* Product */}
    <td className="px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {order.image ? (
            <img src={order.image} alt="" className="w-full h-full object-contain p-1" />
          ) : (
            <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-body font-semibold text-sm text-black truncate max-w-[200px]">{order.title}</p>
          <p className="font-body text-xs text-gray-400 capitalize">{order.category}</p>
        </div>
      </div>
    </td>

    {/* Date */}
    <td className="px-4 py-4 hidden sm:table-cell">
      <p className="font-body text-sm text-black">
        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <p className="font-body text-xs text-gray-400">
        {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </td>

    {/* Qty */}
    <td className="px-4 py-4 hidden md:table-cell">
      <span className="font-display font-bold text-sm text-black bg-gray-100 px-2 py-1">
        ×{order.quantity || 1}
      </span>
    </td>

    {/* Price */}
    <td className="px-4 py-4 hidden md:table-cell">
      <p className="font-body text-xs text-gray-400">${order.price}/ea</p>
    </td>

    {/* Total */}
    <td className="px-4 py-4">
      <span className="font-display font-bold text-base text-black">${(order.total || 0).toFixed(2)}</span>
    </td>

    {/* Status */}
    <td className="px-4 py-4 hidden lg:table-cell">
      <span className={`font-display text-xs font-bold uppercase tracking-wider px-2 py-1 ${statusColors[order.status] || statusColors.ordered}`}>
        {order.status || 'ordered'}
      </span>
    </td>

    {/* Actions */}
    <td className="px-4 py-4">
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(order)}
          className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all text-gray-500"
          title="Edit Status"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(order)}
          className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-red-500 hover:bg-red-500 hover:text-white transition-all text-gray-500"
          title="Delete Order"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>
    </td>
  </tr>
)

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [editModal, setEditModal] = useState({ open: false, order: null })
  const [newStatus, setNewStatus] = useState('')

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

  const handleEdit = (order) => {
    setNewStatus(order.status || 'ordered')
    setEditModal({ open: true, order })
  }

  const confirmEdit = async () => {
    if (!editModal.order) return
    try {
      const orderRef = ref(db, `orders/${user.uid}/${editModal.order.id}`)
      await update(orderRef, { status: newStatus })
      message.success('Order status updated')
      setEditModal({ open: false, order: null })
    } catch (err) {
      message.error('Failed to update order')
    }
  }

  const handleDelete = (order) => {
    Modal.confirm({
      title: 'Delete Order',
      content: `Remove this order for "${order.title?.slice(0, 40)}..."?`,
      okText: 'Delete',
      okType: 'danger',
      icon: null,
      onOk: async () => {
        try {
          const orderRef = ref(db, `orders/${user.uid}/${order.id}`)
          await remove(orderRef)
          message.success('Order deleted')
        } catch {
          message.error('Failed to delete')
        }
      },
    })
  }

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchSearch = !searchText || o.title?.toLowerCase().includes(searchText.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const statusCount = {}
  orders.forEach(o => {
    const s = o.status || 'ordered'
    statusCount[s] = (statusCount[s] || 0) + 1
  })

  // Radial chart for status breakdown
  const radialOptions = {
    chart: { type: 'radialBar', background: 'transparent', toolbar: { show: false } },
    colors: ['#000', '#333', '#666', '#999', '#ccc'],
    plotOptions: {
      radialBar: {
        hollow: { size: '40%' },
        dataLabels: {
          name: { fontFamily: 'Space Mono', fontSize: '10px', color: '#000', offsetY: -10 },
          value: { fontFamily: 'Space Mono', fontSize: '14px', color: '#000', fontWeight: 'bold' },
        },
      },
    },
    labels: Object.keys(statusCount).map(s => s.toUpperCase()),
    legend: { show: false },
    stroke: { lineCap: 'flat' },
  }
  const radialSeries = Object.values(statusCount).map(v => Math.round((v / orders.length) * 100))

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="font-display text-xs text-gray-400 tracking-[3px] uppercase">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold uppercase tracking-[3px] text-black">Orders</h1>
          <p className="font-body text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="bg-black text-white px-5 py-3 flex items-center gap-3">
          <span className="font-display text-xs text-gray-400 uppercase tracking-wider">Total Spent</span>
          <span className="font-display font-bold text-lg text-white">${totalSpent.toFixed(2)}</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'All Orders', value: orders.length, inverted: true },
          { label: 'Ordered', value: statusCount.ordered || 0 },
          { label: 'Delivered', value: statusCount.delivered || 0 },
          { label: 'Cancelled', value: statusCount.cancelled || 0 },
        ].map((item, i) => (
          <div
            key={i}
            className={`p-5 border-2 border-black ${item.inverted ? 'bg-black text-white' : 'bg-white text-black'} shadow-[3px_3px_0px_0px_${item.inverted ? '#666' : '#e5e5e5'}]`}
          >
            <p className={`font-display text-2xl font-bold ${item.inverted ? 'text-white' : 'text-black'}`}>{item.value}</p>
            <p className={`font-display text-[10px] uppercase tracking-widest mt-1 ${item.inverted ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black p-4 flex flex-col sm:flex-row gap-3">
        <input
          placeholder="Search orders..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="input-field flex-1 text-sm"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field sm:w-44 text-sm bg-white cursor-pointer"
        >
          <option value="all">All Status</option>
          {Object.keys(statusColors).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#e5e5e5] overflow-hidden">
        <div className="bg-black px-6 py-4 flex items-center justify-between">
          <h3 className="font-display text-xs font-bold uppercase tracking-[3px] text-white">Order History</h3>
          <span className="font-display text-xs text-gray-400 tracking-wider">{filtered.length} records</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 border-2 border-black flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" fill="none" stroke="black" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <p className="font-display text-sm font-bold uppercase tracking-[2px] text-black">No orders found</p>
            <p className="font-body text-sm text-gray-400 mt-2">Go to Products to place your first order</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black">
                  <th className="table-header text-left text-[10px]">Product</th>
                  <th className="table-header text-left text-[10px] hidden sm:table-cell">Date</th>
                  <th className="table-header text-left text-[10px] hidden md:table-cell">Qty</th>
                  <th className="table-header text-left text-[10px] hidden md:table-cell">Unit Price</th>
                  <th className="table-header text-left text-[10px]">Total</th>
                  <th className="table-header text-left text-[10px] hidden lg:table-cell">Status</th>
                  <th className="table-header text-left text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <OrderRow
                    key={order.id || i}
                    order={order}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status chart - only if have orders */}
      {orders.length > 0 && radialSeries.length > 0 && (
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#e5e5e5]">
          <h3 className="font-display text-sm font-bold uppercase tracking-[2px] text-black mb-4">Status Distribution</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-64">
              <ReactApexChart
                options={radialOptions}
                series={radialSeries.length > 0 ? radialSeries : [100]}
                type="radialBar"
                height={200}
              />
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(statusCount).map(([status, count]) => (
                <div key={status} className="p-3 border border-gray-100 bg-gray-50">
                  <p className="font-display font-bold text-lg text-black">{count}</p>
                  <p className={`font-display text-[10px] uppercase tracking-wider font-bold mt-0.5 ${statusColors[status] ? '' : 'text-gray-500'}`}>
                    <span className={`px-1.5 py-0.5 ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                      {status}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      <Modal
        open={editModal.open}
        onCancel={() => setEditModal({ open: false, order: null })}
        onOk={confirmEdit}
        okText="Update Status"
        title="Update Order Status"
        okButtonProps={{ className: 'btn-primary border-none' }}
        cancelButtonProps={{ className: 'btn-outline' }}
      >
        {editModal.order && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-gray-50 border border-gray-200">
              <p className="font-body font-semibold text-sm text-black">{editModal.order.title?.slice(0, 50)}...</p>
              <p className="font-display font-bold text-black mt-1">${editModal.order.total?.toFixed(2)}</p>
            </div>
            <div>
              <label className="font-display text-xs font-bold uppercase tracking-wider text-black block mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="input-field bg-white cursor-pointer"
              >
                {Object.keys(statusColors).map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Orders
