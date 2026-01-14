// src/components/ProductCard.jsx

import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './ProductCard.css'; // 상품 카드 전용 CSS 파일을 import 합니다.

// product 객체를 props로 받아 카드 UI를 생성하는 컴포넌트
function ProductCard({ product }) {
  return (
    // Link 컴포넌트로 카드를 감싸서 전체를 클릭 가능하게 만듭니다.
    // 경로는 '/product/상품id' 형태가 됩니다.
    <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
      <Card className="h-100 shadow-sm">
        {/* 'product-card-img' 클래스를 적용하여 CSS로 이미지 크기를 조절합니다. */}
        <Card.Img variant="top" src={product.image} className="product-card-img" />
        <Card.Body>
          <Card.Title style={{ fontSize: '1rem', fontWeight: 'bold' }}>{product.name}</Card.Title>
          <Card.Text className="mb-0">{product.price.toLocaleString()}원</Card.Text>
          <Card.Text className="text-muted">{product.volume}</Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default ProductCard;
