# AIContractManager-App
AI 기반 생활 계약 수명주기 관리 서비스

## 로컬 실행

Spring Boot 백엔드를 먼저 실행한 뒤 프론트를 실행합니다.

```bash
cd front/contract-ui
npm install
npm run dev
```

기본 프론트 주소는 `http://localhost:5173`이며 Vite의 `/api` 프록시가 `http://localhost:8080`으로 요청을 전달합니다.

## 백엔드 연동 범위

- 카카오·네이버 OAuth 로그인 및 첫 로그인 회원가입
- 계약 목록·등록·수정·삭제·금액 확인
- 계약서 업로드·다운로드·삭제
- 계약 상세의 AI 분석 요청

AI 분석 버튼은 백엔드의 다음 API를 호출합니다.

```text
POST /api/v1/contracts/{contractId}/documents/{documentId}/analysis
```

Spring Boot는 업로드된 파일을 `AI_BASE_URL`의 `AI_ANALYZE_PATH`로 multipart 요청하고, AI 서비스의 JSON 결과를 `ai_analyses` 테이블에 저장한 뒤 프론트에 반환합니다.
