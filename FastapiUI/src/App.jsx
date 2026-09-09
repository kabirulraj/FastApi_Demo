import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProductsPage from './pages/ProductsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
