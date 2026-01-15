// src/pages/ProductPage.jsx

import { useState } from 'react'; // useState를 import 합니다.
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Button, Toast, ToastContainer } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { validateQuantity, validateProduct, formatPrice } from '../utils/validation';
import products from '../data/products.json';

function ProductPage() {
  const { productId } = useParams();
  const rawProduct = products.find(p => p.id === parseInt(productId));

  // 제품 데이터 검증
  const product = rawProduct ? validateProduct(rawProduct) : null;

  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // clearCart도 useCart에서 가져옵니다.
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (!product) {
    return <h2>상품을 찾을 수 없습니다.</h2>;
  }

  // 수량 변경 핸들러 (보안: 범위 검증)
  const handleQuantityChange = (delta) => {
    setQuantity(prevQuantity => validateQuantity(prevQuantity + delta, 1, 99));
  };

  // Toast 알림 표시 함수
  const showNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // 장바구니 담기 처리 함수: 이제 수량을 함께 전달합니다.
  const handleAddToCart = () => {
    const validatedQty = validateQuantity(quantity, 1, 99);
    addToCart(product, validatedQty); // 상태 변경
    showNotification(`${validatedQty}개가 장바구니에 추가되었습니다.`);
  };

  // 바로 구매 처리 함수 (수량 1개로 고정, 장바구니를 거치지 않음)
  const handleBuyNow = () => {
    const validatedQty = validateQuantity(quantity, 1, 99);
    clearCart(); // 바로 구매이므로 장바구니를 비웁니다.
    showNotification(`${validatedQty}개가 바로 구매 완료되었습니다. 감사합니다!`);
    setTimeout(() => navigate('/'), 1500); // Toast 표시 후 홈으로 이동
  };

  return (
    <Row>
      <Col md={6}>
        <Image src={product.image} alt={product.name} fluid />
      </Col>

      <Col md={6}>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <h2 className="fw-bold">{product.name}</h2>
          </ListGroup.Item>
          <ListGroup.Item>
            <p>{product.description}</p>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row>
              <Col><strong>가격:</strong></Col>
              <Col>{formatPrice(product.price)}원</Col>
            </Row>
            <Row>
              <Col><strong>용량:</strong></Col>
              <Col>{product.volume}</Col>
            </Row>
          </ListGroup.Item>

          {/* 수량 선택 UI 추가 (보안: 범위 제한 1-99) */}
          <ListGroup.Item>
            <Row className="align-items-center">
              <Col><strong>수량:</strong></Col>
              <Col className="d-flex align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="mx-3">{quantity}</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 99}
                >
                  +
                </Button>
              </Col>
            </Row>
          </ListGroup.Item>

          {/* 총 주문 금액 표시 */}
          <ListGroup.Item>
            <Row>
              <Col><strong>총 금액:</strong></Col>
              <Col className="fw-bold fs-5">{formatPrice(product.price * quantity)}원</Col>
            </Row>
          </ListGroup.Item>

          <ListGroup.Item className="d-grid gap-2">
            <Button variant="primary" size="lg" onClick={handleAddToCart}>장바구니 담기</Button>
            <Button variant="secondary" size="lg" onClick={handleBuyNow}>바로 구매</Button>
          </ListGroup.Item>
        </ListGroup>
      </Col>

      {/* Toast 알림 */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">알림</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Row>
  );
}

export default ProductPage;
