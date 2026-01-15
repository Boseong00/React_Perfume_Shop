// src/pages/NotFoundPage.jsx

import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

function NotFoundPage() {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center shadow">
            <Card.Body className="p-5">
              <div className="mb-4">
                <h1 className="display-1 fw-bold text-danger">404</h1>
                <h2 className="mb-3">페이지를 찾을 수 없습니다</h2>
                <p className="text-muted mb-4">
                  요청하신 페이지가 존재하지 않거나 이동되었습니다.
                  <br />
                  URL을 다시 확인해 주세요.
                </p>
              </div>
              <div className="d-grid gap-2">
                <Button as={Link} to="/" variant="primary" size="lg">
                  홈으로 돌아가기
                </Button>
                <Button as={Link} to="/cart" variant="outline-secondary">
                  장바구니 보기
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default NotFoundPage;
