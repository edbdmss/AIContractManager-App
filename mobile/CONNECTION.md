# 실행 설정

기존 백엔드 소스는 변경하지 않습니다. 모바일 화면은 로그인한 계정의 API 데이터만 사용합니다.

1. `.env.example`을 참고해 `.env.local`에 서버 주소를 설정합니다.
2. 배포 환경에서는 HTTPS API 주소를 지정합니다.
3. 카카오·네이버에 웹 callback과 모바일용 HTTPS callback을 등록합니다.
4. 모바일용 HTTPS callback 페이지는 이 프로젝트의 `/oauth/native-callback`입니다.
   이 경로를 웹으로 호스팅하고 `EXPO_PUBLIC_NATIVE_OAUTH_REDIRECT_URI`에 전체 주소를 넣습니다.
5. 네이티브 앱은 `contractmanager://oauth/callback`으로 돌아와, 백엔드에서 인증 토큰을 받습니다.
6. 백엔드 실행 후 로그인 → 구독 등록 → 목록 → 수정 → 삭제를 검증합니다.
7. 계약서 업로드·AI 분석, 월 리포트·일정·알림·챗봇도 실제 서버로 검증합니다.

DB 비밀번호, OAuth client secret, JWT 서명키는 공개 환경변수에 넣지 않습니다.
로그인 토큰은 네이티브 SecureStore와 웹 sessionStorage에 저장하며 API 서버 주소에 묶여 있습니다.
서버 주소가 달라지면 이전 서버의 로그인 정보를 사용하지 않습니다.

웹 origin이 달라지면 백엔드 CORS 허용 설정과 OAuth 콘솔 callback 등록도 함께 맞춰야 합니다.
FCM 및 안드로이드 결제 알림 수집은 현재 변경에 포함되지 않습니다.

이용약관·개인정보 처리방침 URL이 설정되면 마이페이지에서 해당 페이지를 엽니다.
실제 서비스 정책과 공개 URL은 서비스 운영자가 준비해야 합니다.
