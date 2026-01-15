// App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // CartProvider를 import 합니다.
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import SeasonOffPage from './pages/SeasonOffPage'; // 이벤트 페이지 import
import NewMemberPage from './pages/NewMemberPage'; // 이벤트 페이지 import
import SummerSalePage from './pages/SummerSalePage'; // 이벤트 페이지 import
import NotFoundPage from './pages/NotFoundPage'; // 404 페이지 import
import './App.css';

function App() {
  return (
    // CartProvider로 전체 앱을 감싸줍니다.
    // 이렇게 하면 모든 페이지와 컴포넌트가 CartContext에 접근할 수 있습니다.
    <CartProvider>
      <BrowserRouter>
        <Header />
        <main className="container mt-4 mb-5">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            {/* 이벤트 페이지 라우트 추가 */}
            <Route path="/event/season-off" element={<SeasonOffPage />} />
            <Route path="/event/new-member" element={<NewMemberPage />} />
            <Route path="/event/summer-sale" element={<SummerSalePage />} />
            {/* 404 페이지 라우트 (모든 경로와 일치하지 않을 때) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
