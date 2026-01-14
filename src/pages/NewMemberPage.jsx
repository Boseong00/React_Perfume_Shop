// src/pages/NewMemberPage.jsx

import { Container, Card, Button } from 'react-bootstrap';

function NewMemberPage() {
  return (
    <Container>
      <h1 className="my-4">신규 회원 혜택</h1>
      <Card className="text-center">
        <Card.Header as="h2">New Member Benefits</Card.Header>
        <Card.Body>
          <Card.Title>가입 즉시 15% 할인 쿠폰 발급!</Card.Title>
          <Card.Text>
            저희 쇼핑몰에 처음 오셨나요?
            <br />
            지금 회원가입하고 모든 상품에 적용 가능한 15% 할인 쿠폰을 받아가세요.
          </Card.Text>
          <Button variant="primary">회원가입 하러가기</Button>
        </Card.Body>
        <Card.Footer className="text-muted">쿠폰은 발급일로부터 30일간 유효합니다.</Card.Footer>
      </Card>
    </Container>
  );
}

export default NewMemberPage;
