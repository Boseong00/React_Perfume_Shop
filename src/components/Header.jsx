// src/components/Header.jsx

import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // useCart Hook import

function Header() {
  // useCart Hook을 사용하여 장바구니 아이템 총 개수를 가져옵니다.
  const { cartItemCount } = useCart();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">해 향 직</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">홈</Nav.Link>
            <Nav.Link as={Link} to="/cart">
              장바구니
              {/* cartItemCount가 0보다 클 때만 Badge를 보여줍니다. */}
              {cartItemCount > 0 && (
                <Badge pill bg="danger" className="ms-1">
                  {cartItemCount}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
