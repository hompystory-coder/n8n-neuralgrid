# 🚀 n8n NeuralGrid API Documentation

완전히 새로 만든 깨끗한 API 엔드포인트들

---

## 🔐 인증 (Authentication)

### POST `/api/auth/[...nextauth]`
NextAuth.js 인증 엔드포인트
- 로그인/로그아웃
- 세션 관리

---

## 📊 워크플로우 (Workflows)

### GET `/api/workflows`
워크플로우 목록 조회

**Query Parameters:**
- `page` (optional): 페이지 번호 (default: 1)
- `limit` (optional): 페이지당 항목 수 (default: 10)

**Response:**
```json
{
  "workflows": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### POST `/api/workflows`
워크플로우 생성

**Body:**
```json
{
  "name": "My Workflow",
  "description": "Description",
  "workflowData": {},
  "tags": ["tag1", "tag2"]
}
```

### GET `/api/workflows/[id]`
워크플로우 상세 조회

### PUT `/api/workflows/[id]`
워크플로우 수정

**Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated Description",
  "workflowData": {},
  "tags": ["new-tag"],
  "isActive": true
}
```

### DELETE `/api/workflows/[id]`
워크플로우 삭제

### POST `/api/workflows/[id]/execute`
워크플로우 실행

---

## 📦 템플릿 (Templates)

### GET `/api/templates`
템플릿 목록 조회

**Query Parameters:**
- `category` (optional): 카테고리 필터
- `search` (optional): 검색어
- `featured` (optional): 추천 템플릿만 (true/false)

### GET `/api/templates/[id]`
템플릿 상세 조회

### POST `/api/templates`
템플릿 생성 (관리자 only)

**Body:**
```json
{
  "workflowId": "workflow-id",
  "name": "Template Name",
  "description": "Description",
  "category": "automation",
  "tags": ["tag1", "tag2"]
}
```

### POST `/api/templates/[id]/install`
템플릿 설치 (워크플로우로 복사)

---

## 💳 결제 (Payments)

### POST `/api/payments/confirm`
결제 승인

**Body:**
```json
{
  "paymentKey": "toss-payment-key",
  "orderId": "order-id",
  "amount": 29000,
  "planType": "PRO"
}
```

**Plans:**
- `FREE`: 1,000 실행/월, 3개 워크플로우 (무료)
- `PRO`: 10,000 실행/월, 무제한 워크플로우 (₩29,000/월)
- `ENTERPRISE`: 무제한 실행, 무제한 워크플로우 (₩99,000/월)

### POST `/api/payments/cancel`
결제 취소

**Body:**
```json
{
  "paymentKey": "toss-payment-key",
  "cancelReason": "사용자 요청"
}
```

---

## 👑 관리자 (Admin)

### GET `/api/admin/stats`
전체 통계 조회 (관리자 only)

**Response:**
```json
{
  "stats": {
    "users": { "total": 100, "active": 85 },
    "workflows": { "total": 500, "active": 300 },
    "executions": { "total": 10000 },
    "payments": { "total": 50, "revenueThisMonth": 1450000 },
    "usersByPlan": [...]
  },
  "recentUsers": [...]
}
```

### GET `/api/admin/users`
사용자 목록 조회 (관리자 only)

**Query Parameters:**
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수
- `search` (optional): 검색어 (이메일, 이름)

---

## 🔔 Webhook

### POST `/api/webhooks/n8n?workflowId={id}`
n8n Webhook 엔드포인트

외부 서비스에서 워크플로우를 트리거할 때 사용

**Query Parameters:**
- `workflowId`: 실행할 워크플로우 ID

**Body:** Any JSON data

### GET `/api/webhooks/n8n?workflowId={id}`
Webhook URL 테스트

### POST `/api/webhooks/toss`
Toss Payments Webhook

결제 상태 변경 알림 수신

**Event Types:**
- `PAYMENT_CONFIRMED`: 결제 승인
- `PAYMENT_CANCELED`: 결제 취소
- `VIRTUAL_ACCOUNT_ISSUED`: 가상계좌 발급

---

## 🔒 인증 헤더

모든 인증이 필요한 API는 NextAuth 세션을 사용합니다.

```javascript
// 클라이언트에서 사용 예시
import { getSession } from 'next-auth/react'

const session = await getSession()
// NextAuth가 자동으로 세션을 관리합니다
```

---

## ⚠️ 에러 응답

모든 API는 일관된 에러 형식을 반환합니다:

```json
{
  "error": "에러 메시지"
}
```

**Status Codes:**
- `400`: Bad Request (잘못된 요청)
- `401`: Unauthorized (인증 필요)
- `403`: Forbidden (권한 없음)
- `404`: Not Found (리소스 없음)
- `429`: Too Many Requests (한도 초과)
- `500`: Internal Server Error (서버 오류)

---

## 📊 사용 예시

### 워크플로우 생성
```typescript
const response = await fetch('/api/workflows', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My First Workflow',
    description: 'Automated email sending',
    workflowData: { nodes: [], connections: {} },
    tags: ['email', 'automation'],
  }),
})

const data = await response.json()
```

### 템플릿 설치
```typescript
const response = await fetch('/api/templates/template-id/install', {
  method: 'POST',
})

const data = await response.json()
// data.workflow.id - 생성된 워크플로우 ID
```

### 결제 승인
```typescript
const response = await fetch('/api/payments/confirm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    paymentKey: 'toss-payment-key',
    orderId: 'order-12345',
    amount: 29000,
    planType: 'PRO',
  }),
})

const data = await response.json()
```

---

## 🎯 주요 특징

✅ **타입 안전성**: Prisma Schema와 100% 일치  
✅ **일관된 에러 처리**: 모든 API가 동일한 에러 형식 사용  
✅ **권한 관리**: 사용자/관리자 권한 자동 체크  
✅ **사용량 관리**: 자동으로 구독 한도 체크  
✅ **Webhook 지원**: n8n 및 Toss Payments 연동  

---

## 📞 문의

API 관련 문의사항이 있으시면 이슈를 등록해주세요.
