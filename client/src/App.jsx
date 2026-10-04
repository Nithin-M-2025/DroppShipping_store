import {Routes, Route , useLocation} from 'react-router';
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './components/NotFound'
import ProductDetails from './pages/ProductDetails'
import About from './components/About'
import Contact from './components/Contact'
import Cart from './pages/Cart'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/admin/Dashboard'
import './App.css'

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="container">
      {!isLoginPage && <Header />}

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element = {<Register />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>}/>
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>}/>
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isLoginPage && <Footer />}
    </div>
  )
}

export default App