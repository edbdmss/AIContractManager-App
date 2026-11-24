# 계약의 모든것 — 모바일 프론트엔드

React Native + TypeScript + Expo SDK 58 프로젝트입니다. 로그인 후 기존 백엔드
`/api/aicontract`를 사용합니다. 앱 안에 로그인 우회, 예시 계약, 로컬 챗봇 답변은 없습니다.
서버를 사용할 수 없으면 오류와 재시도를 표시합니다.

## 안드로이드 팀원 설치·실행

다른 컴퓨터의 JDK·Android SDK 설치, 에뮬레이터 실행, 기존 APK 사용, 백엔드·로그인 연결과 Git 공유 범위는 [안드로이드 실행 안내](ANDROID.md)를 참고하세요.

## 개발 실행

```sh
cd mobile
npm ci
npm run web
```

개발 웹의 기본 API 주소는 `http://localhost:8080/api/aicontract`,
Android 에뮬레이터는 `http://10.0.2.2:8080/api/aicontract`입니다.
실제 휴대폰에서는 `.env.local`의 서버 주소를 접근 가능한 서버 주소로 바꿉니다.
서버가 꺼져 있으면 로그인 화면까지만 확인할 수 있습니다.

## 서버와 연결할 때

- `.env.example`을 참고해 API 주소와 로그인 callback 주소를 설정합니다.
- 카카오·네이버 콘솔의 callback 주소는 앱이 전송하는 주소와 정확히 같아야 합니다.
- 웹 callback: `/oauth/callback`.
- 모바일 callback: HTTPS로 제공하는 웹 프론트의 `/oauth/native-callback`을 사용합니다.
  이 페이지는 로그인 코드를 `contractmanager://oauth/callback`으로 전달합니다.
- 네이티브 로그인은 Expo Go 대신 설치형 개발/배포 앱에서 확인합니다.
- 배포 앱은 공개 HTTPS API 주소가 필요합니다. localhost로 자동 연결되지 않습니다.
- 이용약관·개인정보 처리방침 페이지가 준비되면 환경변수로 URL을 설정합니다.
  서비스 정책 문서는 이 프로젝트에서 임의로 생성하지 않습니다.

## 코드 범위

계약 등록·조회·수정·삭제·금액 확인, 문서 업로드·AI 분석 요청, 대시보드,
알림함·알림 수신 설정, 등록 제안, 챗봇의 기존 API 호출을 사용합니다.
알림함과 서버의 수신 설정은 실제 FCM 기기 등록·수신과 구분됩니다.
휴대폰의 결제 알림 자동 수집 및 FCM 기기 연결은 별도 네이티브 연동 작업입니다.

## 검사

```sh
npm run typecheck
npm run lint
npm test
npm run build:web
```

테스트 데이터는 `tests/` 안에서만 사용합니다. 테스트는 외부 서버 없이 인증 갱신,
데이터 변환, 입력 검증과 예시 기능 제거를 검사합니다.
실제 OAuth 로그인·DB 저장·AI 응답과 Android 기기 동작은 서버 및 제공자 설정이
준비되면 별도로 검증해야 합니다. 코드 검사 통과가 배포 검증 완료를 뜻하지는 않습니다.
