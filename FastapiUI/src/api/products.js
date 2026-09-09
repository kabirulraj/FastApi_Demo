const BASE = '/api'

export async function fetchProducts({ search = '', category = '', sort = 'name', page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams({ search, category, sort, page, limit })
  const res = await fetch(`${BASE}/products?${params}`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function fetchProduct(id) {
  const res = await fetch(`${BASE}/products/${id}`)
  if (!res.ok) throw new Error('Product not found')
  return res.json()
}

export async function fetchCategories() {
  const res = await fetch(`${BASE}/categories`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function addProduct(data) {
  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to add product')
  return res.json()
}


export const MOCK_PRODUCTS = [
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 299.99, original_price: 399.99, category: 'Electronics', rating: 4.8, reviews: 2341, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', badge: 'Best Seller', in_stock: true },
  { id: 2, name: 'Mechanical Gaming Keyboard', price: 149.99, original_price: 179.99, category: 'Electronics', rating: 4.6, reviews: 1205, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop', badge: 'Hot', in_stock: true },
  { id: 3, name: 'Minimalist Leather Watch', price: 189.00, original_price: null, category: 'Fashion', rating: 4.9, reviews: 876, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', badge: 'New', in_stock: true },
  { id: 4, name: 'Ergonomic Office Chair', price: 449.00, original_price: 599.00, category: 'Furniture', rating: 4.7, reviews: 3102, image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop', badge: 'Sale', in_stock: true },
  { id: 5, name: 'Portable Bluetooth Speaker', price: 79.99, original_price: 99.99, category: 'Electronics', rating: 4.5, reviews: 654, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', badge: null, in_stock: true },
  { id: 6, name: 'Running Sneakers Pro', price: 129.99, original_price: 159.99, category: 'Fashion', rating: 4.4, reviews: 987, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', badge: null, in_stock: false },
  { id: 7, name: '4K Ultra HD Monitor 27"', price: 549.00, original_price: 699.00, category: 'Electronics', rating: 4.8, reviews: 1432, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop', badge: 'Best Seller', in_stock: true },
  { id: 8, name: 'Ceramic Coffee Mug Set', price: 34.99, original_price: null, category: 'Home', rating: 4.6, reviews: 421, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop', badge: 'New', in_stock: true },
  { id: 9, name: 'Smart Fitness Tracker', price: 89.99, original_price: 119.99, category: 'Electronics', rating: 4.3, reviews: 2109, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop', badge: 'Sale', in_stock: true },
  { id: 10, name: 'Linen Throw Blanket', price: 59.00, original_price: null, category: 'Home', rating: 4.7, reviews: 312, image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&h=400&fit=crop', badge: null, in_stock: true },
  { id: 11, name: 'Stainless Steel Water Bottle', price: 29.99, original_price: 39.99, category: 'Home', rating: 4.5, reviews: 1876, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop', badge: null, in_stock: true },
  { id: 12, name: 'Wireless Charging Pad', price: 39.99, original_price: 49.99, category: 'Electronics', rating: 4.4, reviews: 743, image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop', badge: 'Hot', in_stock: true },
]

export const MOCK_CATEGORIES = ['All', 'Electronics', 'Fashion', 'Furniture', 'Home']
