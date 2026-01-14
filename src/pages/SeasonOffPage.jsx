// src/pages/SeasonOffPage.jsx

import { Container, Card } from 'react-bootstrap';

function SeasonOffPage() {
  return (
    <Container>
      <h1 className="my-4">시즌 오프 세일</h1>
      <Card className="text-center">
        <Card.Header as="h2">Season Off Sale</Card.Header>
        <Card.Body>
          <Card.Title>최대 40% 할인!</Card.Title>
          <Card.Text>
            지난 시즌 가장 사랑받았던 향수들을 특별한 가격에 만나보세요.
            <br />
            재고 소진 시 이벤트가 조기 마감될 수 있습니다.
          </Card.Text>
        </Card.Body>
        <Card.Footer className="text-muted">이벤트 기간: ~ 재고 소진 시까지</Card.Footer>
      </Card>
    </Container>
  );
}

export default SeasonOffPage;
