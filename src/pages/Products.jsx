// Path: src/pages/Products.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { ref, push, set, onValue, remove, update } from 'firebase/database'
import { db } from '../firebase/config'
import { Modal, Select, Input, message, Spin, Rate } from 'antd'

const { Option } = Select

const ProductCard = ({ product, onOrder, onEdit, onDelete, ordered }) => (
  <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#e5e5e5] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-0.5 transition-all duration-200 flex flex-col animate-slide-up overflow-hidden group">
    {/* Image */}
    <div className="relative bg-gray-50 p-6 border-b-2 border-black h-44 flex items-center justify-center overflow-hidden">
      <img
        src={product.image}
        alt={product.title}
        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      {/* Category tag */}
      <span className="absolute top-3 left-3 bg-black text-white font-display text-[9px] font-bold tracking-wider uppercase px-2 py-1">
        {product.category}
      </span>
      {ordered && (
        <span className="absolute top-3 right-3 bg-green-600 text-white font-display text-[9px] font-bold tracking-wider uppercase px-2 py-1">
          Ordered
        </span>
      )}
    </div>

    {/* Content */}
    <div className="flex-1 p-5 flex flex-col gap-3">
      <h3 className="font-body font-semibold text-sm text-black leading-snug line-clamp-2">
        {product.title}
      </h3>
      <div className="flex items-center gap-2">
        <Rate disabled defaultValue={Math.round(product.rating?.rate || 0)} className="text-xs" style={{ fontSize: 10 }} />
        <span className="font-body text-xs text-gray-400">({product.rating?.count || 0})</span>
      </div>
      <p className="font-body text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
        {product.description}
      </p>

      {/* Price */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="font-display font-bold text-xl text-black">${product.price}</span>
        <div className="flex items-center gap-2">
          {/* Edit */}
          <button
            onClick={() => onEdit(product)}
            className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all duration-150 text-gray-500 group/btn"
            title="Edit"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {/* Delete */}
          <button
            onClick={() => onDelete(product)}
            className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-red-500 hover:bg-red-500 hover:text-white transition-all duration-150 text-gray-500"
            title="Delete"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
          {/* Order */}
          <button
            onClick={() => onOrder(product)}
            className="flex-1 bg-black text-white font-display font-bold text-[10px] tracking-widest uppercase px-4 py-2 hover:bg-white hover:text-black border-2 border-black transition-all duration-150"
          >
            Order
          </button>
        </div>
      </div>
    </div>
  </div>
)

const Products = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [apiLoading, setApiLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [orderedIds, setOrderedIds] = useState(new Set())
  const [editModal, setEditModal] = useState({ open: false, product: null })
  const [orderModal, setOrderModal] = useState({ open: false, product: null })
  const [editForm, setEditForm] = useState({ title: '', price: '' })
  const [qty, setQty] = useState(1)
  const [categories, setCategories] = useState([])

  // Fetch products from FakeStore API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://fakestoreapi.com/products')
        const data = await res.json()
        setProducts(data)
        setFiltered(data)
        const cats = [...new Set(data.map(p => p.category))]
        setCategories(cats)
      } catch (err) {
        message.error('Failed to load products')
      } finally {
        setApiLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Load ordered product IDs from Firebase
  useEffect(() => {
    if (!user) return
    const ordersRef = ref(db, `orders/${user.uid}`)
    const unsubscribe = onValue(ordersRef, (snap) => {
      if (snap.exists()) {
        const ids = new Set(Object.values(snap.val()).map(o => o.productId))
        setOrderedIds(ids)
      }
    })
    return () => unsubscribe()
  }, [user])

  // Filter + sort products
  useEffect(() => {
    let data = [...products]
    if (category !== 'all') data = data.filter(p => p.category === category)
    if (searchText) data = data.filter(p => p.title.toLowerCase().includes(searchText.toLowerCase()))
    if (sortBy === 'price-asc') data.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') data.sort((a, b) => b.price - a.price)
    else if (sortBy === 'rating') data.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
    setFiltered(data)
  }, [products, category, searchText, sortBy])

  // Place order
  const handleOrder = (product) => {
    setOrderModal({ open: true, product })
    setQty(1)
  }

  const confirmOrder = async () => {
    if (!orderModal.product) return
    const p = orderModal.product
    try {
      const ordersRef = ref(db, `orders/${user.uid}`)
      const newOrderRef = push(ordersRef)
      const orderData = {
        id: newOrderRef.key,
        productId: p.id,
        title: p.title,
        image: p.image,
        price: p.price,
        quantity: qty,
        total: parseFloat((p.price * qty).toFixed(2)),
        category: p.category,
        status: 'ordered',
        createdAt: new Date().toISOString(),
      }
      await set(newOrderRef, orderData)

      // Update user stats
      const userRef = ref(db, `users/${user.uid}`)
      const snap = await import('firebase/database').then(({ get }) => get(userRef))
      const currentData = snap.val() || {}
      await update(userRef, {
        totalOrders: (currentData.totalOrders || 0) + 1,
        totalSpent: parseFloat(((currentData.totalSpent || 0) + p.price * qty).toFixed(2)),
      })

      message.success(`✓ Order placed for ${p.title.slice(0, 30)}...`)
      setOrderModal({ open: false, product: null })
    } catch (err) {
      console.error(err)
      message.error('Failed to place order')
    }
  }

  // Edit product (local state only - FakeStore API is read-only)
  const handleEdit = (product) => {
    setEditForm({ title: product.title, price: product.price })
    setEditModal({ open: true, product })
  }

  const confirmEdit = () => {
    if (!editForm.title || !editForm.price) {
      message.error('Please fill all fields')
      return
    }
    setProducts(prev => prev.map(p =>
      p.id === editModal.product.id
        ? { ...p, title: editForm.title, price: parseFloat(editForm.price) }
        : p
    ))
    message.success('Product updated locally')
    setEditModal({ open: false, product: null })
  }

  // Delete product (local state only)
  const handleDelete = (product) => {
    Modal.confirm({
      title: 'Delete Product',
      content: `Are you sure you want to remove "${product.title.slice(0, 40)}..."?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      icon: null,
      onOk: () => {
        setProducts(prev => prev.filter(p => p.id !== product.id))
        message.success('Product removed')
      },
    })
  }

  if (apiLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="font-display text-xs text-gray-400 tracking-[3px] uppercase">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold uppercase tracking-[3px] text-black">Products</h1>
          <p className="font-body text-sm text-gray-500 mt-0.5">{filtered.length} products available</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-black text-white px-4 py-2 font-display text-xs font-bold tracking-wider uppercase">
            {products.length} Total
          </div>
          <div className="bg-gray-100 text-black px-4 py-2 font-display text-xs font-bold tracking-wider uppercase border border-black">
            {orderedIds.size} Ordered
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black p-4 flex flex-col sm:flex-row gap-3 shadow-[4px_4px_0px_0px_#e5e5e5]">
        <input
          placeholder="Search products..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="input-field flex-1 text-sm"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="input-field sm:w-48 text-sm bg-white cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="input-field sm:w-44 text-sm bg-white cursor-pointer"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', ...categories].map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`
              flex-shrink-0 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider border-2 transition-all duration-150
              ${category === c
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-black hover:bg-gray-50'
              }
            `}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 bg-white">
          <p className="font-display text-xs font-bold uppercase tracking-[3px] text-gray-400">No products found</p>
          <p className="font-body text-sm text-gray-300 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOrder={handleOrder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              ordered={orderedIds.has(product.id)}
            />
          ))}
        </div>
      )}

      {/* Order Confirmation Modal */}
      <Modal
        open={orderModal.open}
        onCancel={() => setOrderModal({ open: false, product: null })}
        onOk={confirmOrder}
        okText="Place Order"
        title="Confirm Order"
        okButtonProps={{ className: 'btn-primary border-none' }}
        cancelButtonProps={{ className: 'btn-outline' }}
      >
        {orderModal.product && (
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200">
              <img
                src={orderModal.product.image}
                alt=""
                className="w-16 h-16 object-contain"
              />
              <div>
                <p className="font-body font-semibold text-sm text-black leading-snug">
                  {orderModal.product.title.slice(0, 50)}...
                </p>
                <p className="font-display font-bold text-lg text-black mt-1">
                  ${orderModal.product.price}
                </p>
              </div>
            </div>

            <div>
              <label className="font-display text-xs font-bold uppercase tracking-wider text-black block mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 border-2 border-black font-bold text-lg hover:bg-black hover:text-white transition-colors"
                >−</button>
                <span className="font-display font-bold text-xl w-12 text-center">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 border-2 border-black font-bold text-lg hover:bg-black hover:text-white transition-colors"
                >+</button>
              </div>
            </div>

            <div className="border-t-2 border-black pt-4 flex items-center justify-between">
              <span className="font-display text-sm font-bold uppercase tracking-wider text-black">Total</span>
              <span className="font-display text-2xl font-bold text-black">
                ${(orderModal.product.price * qty).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        open={editModal.open}
        onCancel={() => setEditModal({ open: false, product: null })}
        onOk={confirmEdit}
        okText="Save Changes"
        title="Edit Product"
        okButtonProps={{ className: 'btn-primary border-none' }}
        cancelButtonProps={{ className: 'btn-outline' }}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="font-display text-xs font-bold uppercase tracking-wider text-black block mb-2">
              Product Title
            </label>
            <Input
              value={editForm.title}
              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="font-display text-xs font-bold uppercase tracking-wider text-black block mb-2">
              Price ($)
            </label>
            <Input
              type="number"
              value={editForm.price}
              onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
              className="input-field"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Products
