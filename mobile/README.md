# 계약의 모든것 — React Native 모바일 앱

확정한 시안을 React Native + TypeScript + Expo SDK 58로 구현했습니다.
기존 웹 `../front/contract-ui`는 별도로 유지합니다.

```sh
cd /Users/bee/Desktop/AIContractManager/AIContractManager-App/mobile
npm install
npm run web
# Android 개발 서버
npm run android
```

앱은 로그인 화면에서 시작합니다. 실제 로그인 시 기존 백엔드 `/api/aicontract`를 사용하고,
**로그인 없이 데모 둘러보기**를 선택하면 기기에 저장하는 데모로 동작합니다.
서버 모드와 데모 데이터는 서로 섞지 않습니다.

[백엔드 연결과 실행 준비](./CONNECTION.md)를 확인하세요.
실제 서버가 실행되지 않았거나 OAuth 제공자 callback 설정이 없으면 서버 로그인은 완료되지 않습니다.

연결 코드: 소셜 로그인/토큰 갱신/로그아웃, 계약 CRUD/금액 확인, 월 지출/캘린더,
알림/수신 설정, 구독 제안, 파일 업로드/분석, 챗봇.
실제 Android 결제 알림 수집과 FCM 기기 푸시 수신은 아직 연결하지 않았습니다.

## 코드

- `src/app`: Expo Router 화면
- `src/auth`: 로그인, OAuth callback, 인증 저장
- `src/state`: 서버 데이터와 데모 데이터
- `src/services`: HTTP 및 백엔드 데이터 변환
- `src/features`: 등록·수정 폼
- `src/components`: 공통 UI와 아이콘

## 검사

```sh
npm run typecheck
npm run lint
npm test
npm run build:web
```

테스트는 모의 서버 응답으로 인증 만료·동시 갱신·데이터 변환을 검사합니다.
실제 계정 로그인 및 DB 저장 검사를 대신하지 않습니다.
