// src/pages/CartPage.jsx

import { useState } from 'react'; // useState를 import 합니다.
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { ListGroup, Button, Row, Col, Image, Card, Modal } from 'react-bootstrap'; // Modal을 import 합니다.

function CartPage() {
  const { cartItems, incrementQuantity, decrementQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // 모달 표시 여부를 관리하는 state
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // 결제하기 버튼 클릭 시 모달 열기
  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }
    setShowModal(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPaymentMethod(''); // 선택된 결제 수단 초기화
  };

  // 결제 확정 처리
  const handlePaymentConfirm = (method) => {
    setSelectedPaymentMethod(method);
    alert(`총 ${totalPrice.toLocaleString()}원 ${method}로 결제가 완료되었습니다. 감사합니다!`);
    clearCart(); // 장바구니 비우기
    setShowModal(false); // 모달 닫기
    navigate('/'); // 결제 후 홈으로 이동
  };

  return (
    <div>
      <h1 className="mb-4">장바구니</h1>
      {cartItems.length === 0 ? (
        <Card className="text-center">
          <Card.Body>
            <Card.Title>장바구니가 비어있습니다.</Card.Title>
            <Card.Text>마음에 드는 상품을 담아보세요.</Card.Text>
            <Button as={Link} to="/" variant="primary">쇼핑 계속하기</Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {/* 왼쪽: 상품 목록 */}
          <Col md={8}>
            <ListGroup variant="flush">
              {cartItems.map(item => (
                <ListGroup.Item key={item.id}>
                  <Row className="align-items-center">
                    <Col md={2}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col md={3}>
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </Col>
                    <Col md={2}>{item.price.toLocaleString()}원</Col>
                    <Col md={3} className="d-flex align-items-center">
                      <Button size="sm" variant="outline-secondary" onClick={() => decrementQuantity(item.id)}>-</Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button size="sm" variant="outline-secondary" onClick={() => incrementQuantity(item.id)}>+</Button>
                    </Col>
                    <Col md={2}>
                      <Button variant="danger" size="sm" onClick={() => removeFromCart(item.id)}>삭제</Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          {/* 오른쪽: 주문 요약 */}
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>주문 요약</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>총 상품 수량:</Col>
                      <Col className="text-end">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}개</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col><strong>총 주문 금액:</strong></Col>
                      <Col className="text-end"><strong>{totalPrice.toLocaleString()}원</strong></Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-grid">
                    {/* 결제하기 버튼 클릭 시 모달 열기 */}
                    <Button variant="primary" size="lg" onClick={handleCheckoutClick} disabled={cartItems.length === 0}>
                      결제하기
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* 결제 수단 선택 모달 */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>결제 수단 선택</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">총 결제 금액: <strong>{totalPrice.toLocaleString()}원</strong></p>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" onClick={() => handlePaymentConfirm('카드')}>카드 결제</Button>
            <Button variant="outline-primary" onClick={() => handlePaymentConfirm('무통장 입금')}>무통장 입금</Button>
            <Button variant="outline-primary" onClick={() => handlePaymentConfirm('카카오페이')}>카카오페이</Button>
            <Button variant="outline-primary" onClick={() => handlePaymentConfirm('네이버페이')}>네이버페이</Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            취소
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CartPage;
