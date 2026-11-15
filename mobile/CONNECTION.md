# 기존 백엔드 연결

대상: `AIContractManager-BE` 현재 API `/api/aicontract`.
백엔드 소스는 변경하지 않았습니다. 모바일은 로그인한 계정의 API를 호출하며,
로그인 화면에서 명시적으로 선택한 데모는 별도 기기 데이터만 사용합니다.
데모 계약을 서버에 자동 업로드하지 않습니다.

## 실행 준비

1. 기존 MySQL DB와 Spring Boot 서버를 실행합니다. 서버 실행 도구는 Java 17 이상과 Maven입니다.
2. 웹에서 확인할 경우 API 주소는 기본 `http://localhost:8080/api/aicontract`입니다.
3. 실제 기기에서는 `.env.local`의 `EXPO_PUBLIC_API_BASE_URL`을 컴퓨터 LAN IP 또는 배포 서버 HTTPS 주소로 설정하고 Expo 개발 서버를 재시작합니다.
4. 웹 OAuth의 기본 callback은 `http://localhost:8081/oauth/callback`입니다. 카카오·네이버 콘솔에 같은 주소를 등록해야 합니다.
5. 네이티브 OAuth는 개발 빌드에서 검사합니다. 기본 callback scheme은 `contractmanager://oauth/callback`입니다. 제공자 허용 정책에 따라 네이티브 SDK나 HTTPS 복귀 경로의 추가 설계가 필요할 수 있습니다. 등록하지 않은 callback으로 로그인 성공을 보장하지 않습니다.

공개 환경변수에 DB 비밀번호, OAuth client secret, JWT 서명키를 넣지 않습니다.
토큰은 네이티브 SecureStore, 웹은 탭의 sessionStorage에 저장합니다.
웹 화면을 다른 주소/포트로 실행하면 백엔드의 CORS 허용 origin도 일치해야 합니다.
현재 백엔드에는 `http://localhost:8081` 허용 설정이 있습니다.

## 연결 코드

- 인증: authorize → 외부 로그인 → callback state 검증 → login → Bearer 토큰. 401 발생 시 한 번의 refresh로 재요청. 동시 요청의 refresh는 공유합니다. 로그아웃은 refresh 토큰을 서버에서 폐기하고 기기의 인증 정보도 정리합니다.
- 계약: 목록/생성/수정/삭제/금액 확인. ID는 UUID 문자열입니다.
- 서버 PUT에 맞춰 기존 해지 마감일·위약금 등 편집하지 않은 필드를 보존합니다.
- 대시보드: 서버 월 지출 및 월별 캘린더. 금액 확인 전 계약은 서버 정책에 따라 월 지출에서 제외됩니다.
- 알림: 서버 목록·숨김·전체 숨김·수신 설정. 실제 FCM 기기 등록/푸시 수신은 별도 작업입니다.
- 제안: accept 결과로 폼 자동 입력 후 계약 저장 → complete 연결. 수락한 초안은 계정별 기기 저장으로 복귀할 수 있습니다.
- 문서: 계약 생성 → multipart 업로드 → AI 분석 → 상세 확인. 실패한 작업을 같은 화면에서 재시도하면 생성한 계약/문서를 재사용합니다. 화면을 닫으면 내 계약에서 생성된 계약을 확인합니다.
- 챗봇: 계약별 최근 세션 이력 조회 → 메시지 전송.

## 검증 범위

코드 검사 및 모의 API 응답을 이용한 계약 변환/인증 재시도 테스트를 실행합니다.
실제 OAuth 계정 로그인·DB 저장·Gemini 분석·FCM 전달은 실행 중인 서버와 제공자 설정이 준비된 후 별도로 검증해야 합니다.
