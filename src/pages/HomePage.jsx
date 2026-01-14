// src/pages/HomePage.jsx

import { useState } from 'react';
import { Row, Col, Carousel, Pagination } from 'react-bootstrap';
import ProductCard from '../components/ProductCard'; // 상품 카드 컴포넌트
import products from '../data/products.json'; // 상품 데이터
import './HomePage.css'; // HomePage 전용 CSS
import { Link } from 'react-router-dom'; // Link 컴포넌트 import

function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <Carousel className="mb-5">
        {/* 각 Carousel.Item의 내용을 Link 컴포넌트로 감싸서 클릭 가능하게 만듭니다. */}
        <Carousel.Item>
          <Link to="/event/season-off" className="carousel-link-wrapper">
            <img
              className="d-block w-100 carousel-img"
              src="https://placehold.co/1200x400/CCCCCC/FFFFFF?text=Event+1"
              alt="First slide"
            />
            <Carousel.Caption>
              <h3>시즌 오프 세일</h3>
              <p>지금 가장 사랑받는 향수를 특별한 가격에 만나보세요.</p>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
        <Carousel.Item>
          <Link to="/event/new-member" className="carousel-link-wrapper">
            <img
              className="d-block w-100 carousel-img"
              src="https://placehold.co/1200x400/AAAAAA/FFFFFF?text=Event+2"
              alt="Second slide"
            />
            <Carousel.Caption>
              <h3>신규 회원 혜택</h3>
              <p>가입 즉시 사용 가능한 15% 할인 쿠폰을 드립니다.</p>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
        <Carousel.Item>
          <Link to="/event/summer-sale" className="carousel-link-wrapper">
            <img
              className="d-block w-100 carousel-img"
              src="https://placehold.co/1200x400/888888/FFFFFF?text=Event+3"
              alt="Third slide"
            />
            <Carousel.Caption>
              <h3>여름을 위한 향수</h3>
              <p>가볍고 상쾌한 여름의 향기를 지금 만나보세요.</p>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      </Carousel>

      <h1 className="mb-4">베스트 셀러</h1>
      <Row xs={1} md={2} lg={3} className="g-4">
        {currentProducts.map(product => (
          <Col key={product.id} className="mb-4">
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          {pageNumbers.map(number => (
            <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
              {number}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </div>
  );
}

export default HomePage;
