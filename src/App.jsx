import { useEffect, useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/products`)
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        setProducts(data.items || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addToCart = (p) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id)
      if (existing) {
        return prev.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...p, quantity: 1 }]
    })
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const checkout = async () => {
    if (cart.length === 0) return
    try {
      const order = {
        customer_name: 'Guest',
        customer_email: 'guest@example.com',
        items: cart.map((c) => ({
          product_id: c.id || '',
          title: c.title,
          price: c.price,
          quantity: c.quantity,
        })),
        total,
        status: 'pending',
      }
      const res = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
      if (!res.ok) throw new Error('Checkout failed')
      const data = await res.json()
      alert(`Order placed! ID: ${data.id}`)
      setCart([])
    } catch (e) {
      alert(e.message)
    }
  }

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter)
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">BlueShop</h1>
          <div className="flex items-center gap-3">
            <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="border rounded px-2 py-1">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="relative">
              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full">Cart: {cart.reduce((s,i)=>s+i.quantity,0)}</span>
            </div>
            <a href="/test" className="text-sm text-blue-600 underline">Test</a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading && <p className="animate-pulse">Loading products...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
                <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <h3 className="font-semibold text-lg line-clamp-2">{p.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 flex-1">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-blue-600 font-bold">${'{'}p.price.toFixed(2){'}'}</span>
                  <button onClick={() => addToCart(p)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Add to cart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <span className="font-semibold">Total:</span> ${'{'}total.toFixed(2){'}'}
          </div>
          <button onClick={checkout} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={cart.length===0}>
            Checkout
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
