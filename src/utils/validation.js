// src/utils/validation.js
// 보안 관련 유틸리티 함수

import DOMPurify from 'dompurify';

/**
 * XSS 공격 방지를 위한 문자열 정제
 * @param {string} dirty - 정제할 문자열
 * @returns {string} 정제된 안전한 문자열
 */
export const sanitizeInput = (dirty) => {
  if (typeof dirty !== 'string') {
    return String(dirty);
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // 모든 HTML 태그 제거
    ALLOWED_ATTR: [] // 모든 HTML 속성 제거
  });
};

/**
 * 수량 입력값 검증 및 범위 제한
 * @param {number} quantity - 검증할 수량
 * @param {number} min - 최소값 (기본: 1)
 * @param {number} max - 최대값 (기본: 99)
 * @returns {number} 검증된 수량
 */
export const validateQuantity = (quantity, min = 1, max = 99) => {
  const num = parseInt(quantity, 10);

  if (isNaN(num) || !isFinite(num)) {
    return min;
  }

  if (num < min) return min;
  if (num > max) return max;

  return num;
};

/**
 * 제품 데이터 검증
 * @param {object} product - 검증할 제품 객체
 * @returns {object|null} 검증된 제품 객체 또는 null
 */
export const validateProduct = (product) => {
  if (!product || typeof product !== 'object') {
    return null;
  }

  // 필수 필드 검증
  if (!product.id || !product.name || !product.price) {
    return null;
  }

  // 가격 검증 (양수여야 함)
  if (typeof product.price !== 'number' || product.price <= 0) {
    return null;
  }

  // 안전한 제품 객체 반환 (XSS 방지)
  return {
    id: parseInt(product.id, 10),
    name: sanitizeInput(product.name),
    price: product.price,
    volume: sanitizeInput(product.volume || ''),
    description: sanitizeInput(product.description || ''),
    image: sanitizeInput(product.image || '')
  };
};

/**
 * 가격 포맷팅 (안전한 숫자 변환)
 * @param {number} price - 포맷팅할 가격
 * @returns {string} 포맷팅된 가격 문자열
 */
export const formatPrice = (price) => {
  const num = Number(price);

  if (isNaN(num) || !isFinite(num)) {
    return '0';
  }

  return Math.max(0, num).toLocaleString();
};
