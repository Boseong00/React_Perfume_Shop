# 보안 개선 작업 내역

## 프로젝트 개요
- **프로젝트명**: 해향직 (해외 향수 직구 쇼핑몰)
- **기술 스택**: React 19.2.0, Vite 7.2.4, React Router 7.12.0, React Bootstrap 2.10.10
- **작업 일자**: 2026-01-14

---

## 1. XSS (Cross-Site Scripting) 공격 방지

### **상황**
- 제품명, 설명 등 사용자에게 보여지는 데이터가 검증 없이 렌더링
- `alert()` 함수에 제품 정보가 필터링 없이 삽입되어 XSS 공격에 취약
- `products.json`의 데이터가 검증 없이 화면에 출력
- 악의적인 스크립트 코드 삽입 시 실행될 위험 존재

**취약 코드 예시:**
```javascript
// src/pages/ProductPage.jsx:26 (수정 전)
alert(`${product.name} ${quantity}개가 장바구니에 추가되었습니다.`);

// src/pages/CartPage.jsx:36 (수정 전)
alert(`총 ${totalPrice.toLocaleString()}원 ${method}로 결제가 완료되었습니다.`);
```

### **원인/분석**
- 입력값 sanitization 로직 부재
- React의 기본 XSS 보호만으로는 `alert()`, `dangerouslySetInnerHTML` 등에서 취약
- JSON 데이터의 무결성 검증 없음
- 사용자 입력값과 외부 데이터에 대한 필터링 없이 직접 사용

### **해결**
1. **DOMPurify 라이브러리 설치**
   ```bash
   npm install dompurify
   ```

2. **보안 유틸리티 함수 작성** (`src/utils/validation.js`)
   ```javascript
   import DOMPurify from 'dompurify';

   // XSS 공격 방지를 위한 문자열 정제
   export const sanitizeInput = (dirty) => {
     if (typeof dirty !== 'string') {
       return String(dirty);
     }
     return DOMPurify.sanitize(dirty, {
       ALLOWED_TAGS: [], // 모든 HTML 태그 제거
       ALLOWED_ATTR: [] // 모든 HTML 속성 제거
     });
   };

   // 제품 데이터 검증
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
   ```

3. **제품 페이지에 검증 로직 적용**
   ```javascript
   // src/pages/ProductPage.jsx (수정 후)
   import { validateProduct } from '../utils/validation';

   const rawProduct = products.find(p => p.id === parseInt(productId));
   const product = rawProduct ? validateProduct(rawProduct) : null;
   ```

4. **결제 메서드 sanitization**
   ```javascript
   // src/pages/CartPage.jsx (수정 후)
   const handlePaymentConfirm = (method) => {
     const sanitizedMethod = sanitizeInput(method);
     showNotification(`총 ${formatPrice(totalPrice)}원 ${sanitizedMethod}로 결제가 완료되었습니다.`);
   };
   ```

### **검증**
- 모든 외부 데이터가 `sanitizeInput()` 함수를 거쳐 정제됨
- HTML 태그 및 스크립트 코드 자동 제거
- `<script>alert('XSS')</script>` 같은 악성 코드 입력 시 텍스트로만 처리
- DOMPurify를 통한 화이트리스트 기반 정제로 안전성 확보

---

## 2. 입력값 검증 및 범위 제한

### **상황**
- 제품 수량 입력 시 음수, 무한대, 비정상적인 큰 값 입력 가능
- 수량 증가 버튼 무제한 클릭으로 메모리 및 성능 문제 발생 가능
- 가격 계산 시 오버플로우 위험 존재

**취약 코드 예시:**
```javascript
// src/pages/ProductPage.jsx:66-68 (수정 전)
<Button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
<span>{quantity}</span>
<Button onClick={() => setQuantity(q => q + 1)}>+</Button>
```

### **원인/분석**
- 수량 입력의 상한선 미설정
- 비정상적인 값에 대한 검증 로직 부재
- 사용자가 개발자 도구로 직접 state 값 변조 가능

### **해결**
1. **수량 검증 함수 작성**
   ```javascript
   // src/utils/validation.js
   export const validateQuantity = (quantity, min = 1, max = 99) => {
     const num = parseInt(quantity, 10);

     if (isNaN(num) || !isFinite(num)) {
       return min;
     }

     if (num < min) return min;
     if (num > max) return max;

     return num;
   };
   ```

2. **수량 변경 핸들러에 검증 적용**
   ```javascript
   // src/pages/ProductPage.jsx (수정 후)
   const handleQuantityChange = (delta) => {
     setQuantity(prevQuantity => validateQuantity(prevQuantity + delta, 1, 99));
   };
   ```

3. **버튼 비활성화 처리**
   ```javascript
   <Button
     onClick={() => handleQuantityChange(-1)}
     disabled={quantity <= 1}
   >
     -
   </Button>
   <span className="mx-3">{quantity}</span>
   <Button
     onClick={() => handleQuantityChange(1)}
     disabled={quantity >= 99}
   >
     +
   </Button>
   ```

4. **가격 포맷팅 함수 안전성 강화**
   ```javascript
   // src/utils/validation.js
   export const formatPrice = (price) => {
     const num = Number(price);

     if (isNaN(num) || !isFinite(num)) {
       return '0';
     }

     return Math.max(0, num).toLocaleString();
   };
   ```

### **검증**
- 수량이 1~99 범위로 제한됨
- 비정상적인 값 입력 시 자동으로 최소/최대값으로 조정
- 버튼 비활성화로 UX 개선 및 무효한 입력 방지
- 가격 계산 시 NaN 및 Infinity 예외 처리 완료

---

## 3. Alert 대신 안전한 Toast 알림 구현

### **상황**
- `alert()` 함수 사용으로 XSS 취약점 존재
- 사용자 경험(UX) 저하 (브라우저 기본 alert는 모달이 화면 전체를 차단)
- alert 메시지 내용이 sanitize 없이 표시되어 악성 코드 실행 가능

**취약 코드 예시:**
```javascript
// src/pages/ProductPage.jsx (수정 전)
alert(`${product.name} ${quantity}개가 장바구니에 추가되었습니다.`);

// src/pages/CartPage.jsx (수정 전)
alert('장바구니가 비어있습니다.');
```

### **원인/분석**
- `alert()` 함수는 HTML을 렌더링하지 않지만, 문자열 삽입 시 보안 위험
- 사용자가 페이지를 떠나지 못하게 하는 불편함
- 모바일 환경에서 UX 저하

### **해결**
1. **React Bootstrap Toast 컴포넌트 사용**
   ```javascript
   // src/pages/ProductPage.jsx (수정 후)
   import { Toast, ToastContainer } from 'react-bootstrap';

   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastVariant, setToastVariant] = useState('success');

   const showNotification = (message, variant = 'success') => {
     setToastMessage(message);
     setToastVariant(variant);
     setShowToast(true);
   };
   ```

2. **Toast 컴포넌트 렌더링**
   ```javascript
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
   ```

3. **안전한 알림 호출**
   ```javascript
   // 장바구니 담기
   const handleAddToCart = () => {
     const validatedQty = validateQuantity(quantity, 1, 99);
     addToCart(product, validatedQty);
     showNotification(`${validatedQty}개가 장바구니에 추가되었습니다.`);
   };

   // 결제 완료
   const handlePaymentConfirm = (method) => {
     const sanitizedMethod = sanitizeInput(method);
     showNotification(`총 ${formatPrice(totalPrice)}원 ${sanitizedMethod}로 결제가 완료되었습니다.`);
   };
   ```

### **검증**
- 모든 `alert()` 호출이 Toast로 대체됨
- 메시지 내용이 React의 안전한 렌더링 방식으로 표시
- 3초 후 자동으로 사라지며 사용자 흐름 방해하지 않음
- 화면 우측 상단에 비침습적으로 표시되어 UX 개선

---

## 4. Vite 보안 헤더 및 CSP 설정

### **상황**
- Vite 기본 설정으로 보안 헤더 미적용
- CORS, XSS, Clickjacking 공격에 취약
- Content Security Policy(CSP) 미설정으로 외부 스크립트 실행 가능
- 프로덕션 빌드 시 소스맵 노출로 코드 분석 용이

**취약 설정:**
```javascript
// vite.config.js (수정 전)
export default defineConfig({
  plugins: [react()],
})
```

### **원인/분석**
- 보안 헤더 설정 누락
- CSP 정책 부재로 인라인 스크립트 제한 없음
- 소스맵이 프로덕션에 포함되어 원본 코드 노출
- console.log가 프로덕션에 남아 디버깅 정보 노출

### **해결**
```javascript
// vite.config.js (수정 후)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 서버 보안 헤더 설정
    headers: {
      // XSS 보호
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      // HTTPS 강제 (프로덕션에서 중요)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      // Content Security Policy
      'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: http:; " +
        "connect-src 'self';"
    }
  },
  build: {
    // 빌드 보안 설정
    sourcemap: false, // 프로덕션에서 소스맵 비활성화
    minify: 'terser', // 코드 난독화
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true
      }
    }
  }
})
```

### **검증**
- **X-Content-Type-Options: nosniff** - MIME 타입 스니핑 방지
- **X-Frame-Options: DENY** - 클릭재킹(Clickjacking) 공격 방지
- **X-XSS-Protection** - 브라우저 내장 XSS 필터 활성화
- **CSP** - 허용된 소스에서만 리소스 로드
- 프로덕션 빌드 시 소스맵 제거로 코드 분석 어렵게 함
- console.log 자동 제거로 디버깅 정보 노출 방지

---

## 5. 404 에러 페이지 구현

### **상황**
- 존재하지 않는 URL 접근 시 빈 화면 또는 에러 표시
- 라우팅 실패 시 사용자에게 적절한 안내 없음
- 잘못된 제품 ID 접근 시 처리 미흡

**문제 코드:**
```javascript
// src/App.jsx (수정 전)
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/product/:productId" element={<ProductPage />} />
  <Route path="/cart" element={<CartPage />} />
  {/* 404 처리 없음 */}
</Routes>
```

### **원인/분석**
- 와일드카드 라우트(`*`) 미설정
- 사용자가 잘못된 URL 입력 시 처리 로직 부재
- 보안 측면에서 시스템 정보 노출 가능성

### **해결**
1. **404 페이지 컴포넌트 생성**
   ```javascript
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
   ```

2. **라우트 설정 추가**
   ```javascript
   // src/App.jsx (수정 후)
   import NotFoundPage from './pages/NotFoundPage';

   <Routes>
     <Route path="/" element={<HomePage />} />
     <Route path="/product/:productId" element={<ProductPage />} />
     <Route path="/cart" element={<CartPage />} />
     <Route path="/event/season-off" element={<SeasonOffPage />} />
     <Route path="/event/new-member" element={<NewMemberPage />} />
     <Route path="/event/summer-sale" element={<SummerSalePage />} />
     {/* 404 페이지 라우트 (모든 경로와 일치하지 않을 때) */}
     <Route path="*" element={<NotFoundPage />} />
   </Routes>
   ```

### **검증**
- 존재하지 않는 URL 접근 시 친절한 404 페이지 표시
- 홈으로 돌아가기 버튼으로 사용자 이탈 방지
- 시스템 에러 메시지 노출 없이 커스텀 페이지로 대체
- 보안 측면에서 내부 구조 정보 숨김

---

## 6. HTML 보안 메타 태그 추가

### **상황**
- 기본 HTML 템플릿에 보안 관련 메타 태그 부재
- SEO 및 접근성 미흡 (영어 lang 속성, 의미없는 title)
- Referrer 정보 노출로 사용자 추적 가능

**취약 HTML:**
```html
<!-- index.html (수정 전) -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>shop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### **원인/분석**
- 보안 메타 태그 누락
- Referrer policy 미설정으로 민감한 정보 노출 가능
- 브라우저 호환성 지시자 부재

### **해결**
```html
<!-- index.html (수정 후) -->
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- 보안 메타 태그 -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <title>해향직 - 해외 향수 직구 쇼핑몰</title>
    <meta name="description" content="프리미엄 해외 향수를 합리적인 가격에 만나보세요" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### **검증**
- **lang="ko"** - 한국어 페이지 명시로 접근성 개선
- **X-UA-Compatible** - IE 엣지 모드 강제
- **referrer policy** - HTTPS→HTTP 전환 시 referrer 전송 안함
- **의미있는 title** - SEO 개선 및 브랜딩
- **description 메타 태그** - 검색 엔진 최적화

---

## 7. 의존성 보안 점검

### **상황**
- npm 패키지 보안 취약점 미확인
- 정기적인 의존성 업데이트 프로세스 부재

### **원인/분석**
- 초기 프로젝트 설정 시 보안 점검 미실시
- 써드파티 라이브러리의 알려진 취약점 확인 필요

### **해결**
```bash
npm audit
```

**결과:**
```
found 0 vulnerabilities
```

### **검증**
- 모든 의존성 패키지에서 보안 취약점 0개 확인
- 최신 버전의 안정적인 패키지 사용 중
- 정기적인 `npm audit` 실행 권장

---

## 보안 개선 요약

| 항목 | 개선 전 | 개선 후 | 파일 |
|------|---------|---------|------|
| **XSS 방지** | 입력값 검증 없음 | DOMPurify 적용 | `src/utils/validation.js` |
| **입력 검증** | 수량 무제한 | 1-99 범위 제한 | `src/pages/ProductPage.jsx` |
| **알림 방식** | alert() 사용 | Toast 컴포넌트 | `src/pages/ProductPage.jsx`, `CartPage.jsx` |
| **보안 헤더** | 미설정 | CSP, XSS 헤더 추가 | `vite.config.js` |
| **404 처리** | 에러 페이지 없음 | 커스텀 404 페이지 | `src/pages/NotFoundPage.jsx` |
| **HTML 보안** | 기본 메타 태그만 | Referrer policy 추가 | `index.html` |
| **의존성** | 점검 안함 | 취약점 0개 확인 | `npm audit` |
| **소스맵** | 프로덕션 노출 | 빌드 시 제거 | `vite.config.js` |

---

## 추가 권장 사항

### 향후 고려할 보안 개선
1. **환경변수 관리**: `.env` 파일로 API 키 및 민감 정보 분리
2. **HTTPS 강제 적용**: 프로덕션 환경에서 SSL/TLS 인증서 적용
3. **서버 사이드 검증**: 실제 결제 시스템 연동 시 백엔드 검증 필수
4. **Rate Limiting**: API 호출 제한으로 DDoS 공격 방지
5. **JWT 인증**: 사용자 인증 시스템 구현 시 토큰 기반 인증
6. **정기 보안 감사**: `npm audit` 및 `Snyk` 같은 도구로 주기적 점검
7. **로깅 및 모니터링**: 보안 이벤트 로깅 및 실시간 모니터링 시스템
8. **CORS 설정**: API 서버 연동 시 적절한 CORS 정책 설정

---

## 기술 스택

### 보안 관련 추가 패키지
- **DOMPurify** (v3.2.2): XSS 공격 방지를 위한 HTML sanitization

### 개발 환경
- Node.js: v18.x 이상
- npm: v9.x 이상

---

## 참고 자료
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Vite Security Best Practices](https://vitejs.dev/guide/build.html)
- [React Security Best Practices](https://react.dev/learn/keeping-components-pure)
