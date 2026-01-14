// src/pages/SummerSalePage.jsx

import { Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function SummerSalePage() {
  return (
    <Container>
      <h1 className="my-4">여름을 위한 향수</h1>
      <Card className="text-center">
        <Card.Header as="h2">Summer Fragrance Collection</Card.Header>
        <Card.Body>
          <Card.Title>가볍고 상쾌한 여름의 향기</Card.Title>
          <Card.Text>
            무더운 여름, 당신을 더욱 빛나게 해줄 시트러스와 아쿠아 노트의 향수들을 만나보세요.
            <br />
            아래 링크에서 추천 상품들을 확인할 수 있습니다.
          </Card.Text>
          <Link to="/">추천 상품 보러가기</Link>
        </Card.Body>
        <Card.Footer className="text-muted">이벤트 기간: ~ 8월 31일까지</Card.Footer>
      </Card>
    </Container>
  );
}

export default SummerSalePage;
