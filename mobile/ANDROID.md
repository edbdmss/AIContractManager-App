# 안드로이드 팀원 설치·실행 안내

이 문서는 `AIContractManager-App/mobile`의 React Native + Expo SDK 58 앱을 다른 컴퓨터에서 실행하는 방법입니다. 명령은 별도 안내가 없으면 `mobile` 폴더에서 실행합니다.

## 1. 어떤 방식으로 실행할지 선택

| 방식 | 준비할 것 | 용도 |
|---|---|---|
| 소스에서 로컬 빌드 | Node.js, JDK 17, Android Studio·SDK, 가상 기기 또는 USB 연결 휴대폰 | 개발·디버깅 |
| 기존 개발용 APK 설치 | Node.js, APK, 실제 휴대폰 또는 Android 에뮬레이터 | 로컬 빌드를 생략하고 화면 확인 |
| 시연용 APK 설치 | 서버 주소가 포함된 preview APK, 인터넷 연결 | 컴퓨터의 개발 서버 없이 시연 |

**현재 만든 APK는 개발용입니다.** 설치 후에도 Metro 개발 서버를 켜야 합니다. 개발용 APK 설치가 로그인·백엔드 설정을 대신하지는 않습니다.

## 2. 소스 받기·패키지 설치

팀에서 작업을 공유한 브랜치를 받습니다. 이미 저장소가 있다면 그 체크아웃을 사용합니다.

```sh
git clone https://github.com/edbdmss/AIContractManager-App.git
cd AIContractManager-App
# 팀이 공유한 브랜치가 main과 다르면 해당 브랜치로 이동
cd mobile
npm ci
```

Node.js는 팀 기준으로 **24 LTS**를 사용하고 `node -v`, `npm -v`로 설치를 확인합니다. 공식 다운로드: https://nodejs.org/en/download

처음이나 `package-lock.json` 변경 후에는 `npm ci`를 실행합니다. 패키지를 하나씩 따로 설치하거나 lock 파일을 새로 만들 필요는 없습니다.

## 3. JDK 17 설치

로컬 네이티브 빌드에 필요합니다. 기존 개발용 APK를 설치해서 사용하는 경우에는 JDK 설치를 생략할 수 있습니다.

Temurin 또는 Zulu의 **JDK 17**을 설치합니다. `JRE`가 아닌 `JDK`를 선택합니다.

- Apple Silicon 맥(M1/M2/M3/M4 등): macOS / ARM64(aarch64)
- Intel 맥: macOS / x64
- 일반적인 Intel·AMD Windows PC: Windows / x64

Temurin 다운로드: https://adoptium.net/temurin/releases/?version=17

### macOS

Homebrew가 있다면 다음 방법도 가능합니다.

```sh
brew install --cask zulu@17
```

**Homebrew는 필수가 아닙니다.** 관리자 권한이 없다면 공식 `.tar.gz` 배포본을 풀어 사용자 폴더에 둡니다. macOS JDK의 실제 Java 홈은 압축을 푼 폴더 아래 `Contents/Home`입니다.

예를 들어 `~/Library/Java/JavaVirtualMachines/temurin-17.jdk`에 설치했다면 `~/.zshrc`에 다음을 추가합니다. 다른 JDK를 설치했다면 실제 설치 경로로 변경합니다.

```sh
export JAVA_HOME="$HOME/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
```

### Windows

JDK 설치 후 사용자 환경변수의 `JAVA_HOME`을 JDK 설치 폴더로 설정하고, 사용자 `Path`에 `%JAVA_HOME%\bin`을 추가합니다. 새 PowerShell을 열어 확인합니다.

```powershell
java -version
javac -version
```

두 명령 모두 17 버전이 나와야 합니다. Android Studio에 포함된 Java 버전과 터미널이 사용하는 Java 버전은 다를 수 있습니다.

## 4. Android Studio·SDK 설치

공식 다운로드: https://developer.android.com/studio

처음 실행할 때 Standard 설정으로 진행합니다. 시작 화면에서 `More Actions → SDK Manager`를 열거나, 프로젝트 화면의 Settings에서 `Android SDK`를 검색합니다.

설치할 항목:

- SDK Platforms: Android 16 / API 36
- SDK Tools: Android SDK Build-Tools 36.0.0, Android SDK Platform-Tools, Android Emulator
- SDK Tools: Android SDK Command-line Tools (latest) — 추가 SDK 관리용

프로젝트 빌드가 별도 SDK·NDK·CMake 버전을 요구하면 해당 버전도 설치합니다. 시스템 이미지 다운로드와 SDK 플랫폼 설치는 별개입니다.

### macOS 경로 설정

SDK Manager의 `Android SDK Location`을 확인합니다. 기본 위치를 사용했다면 `~/.zshrc`에 추가합니다.

```sh
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

적용·확인:

```sh
source ~/.zshrc
java -version
javac -version
adb --version
```

### Windows 경로 설정

사용자 환경변수의 `ANDROID_HOME`을 SDK Manager에 표시되는 SDK 위치로 설정합니다. 기본 위치는 보통 `C:\Users\사용자명\AppData\Local\Android\Sdk`입니다.

사용자 `Path`에 `%ANDROID_HOME%\platform-tools`와 `%ANDROID_HOME%\emulator`를 추가하고 새 PowerShell에서 `adb --version`을 확인합니다.

**다른 사람의 `.zshrc`, SDK 폴더, `local.properties`는 복사하지 않습니다.** 각 컴퓨터의 설치 경로를 사용합니다.

## 5. 가상 휴대폰 만들기

Android Studio 시작 화면의 `More Actions → Virtual Device Manager`에서 `Create Device`를 선택합니다. 프로젝트를 열었다면 Device Manager를 사용합니다.

1. 기기: Pixel 8
2. 시스템 이미지: Android 16 / API 36
3. Apple Silicon 맥: Google Play ARM 64 v8a (`arm64-v8a`)
4. Intel·AMD 컴퓨터: 해당 호스트가 지원하는 x86_64 이미지
5. 다운로드가 끝난 뒤 Finish
6. ▶ 버튼을 눌러 안드로이드 홈 화면까지 켜지는지 확인

시스템 이미지를 내려받지 않고 기기 설정만 만들면 에뮬레이터가 즉시 종료될 수 있습니다.

## 6. 소스에서 첫 실행

가상 기기를 켜고 `mobile`에서 실행합니다.

```sh
npx expo run:android --device
```

목록에서 생성한 가상 기기를 선택합니다. Expo가 `mobile/android/`를 생성하고 앱을 빌드·설치한 뒤 Metro 개발 서버를 실행합니다. 별도로 Android Studio 새 프로젝트를 만들 필요는 없습니다.

첫 실행은 Gradle·SDK·의존성 다운로드와 네이티브 컴파일 때문에 오래 걸릴 수 있습니다. 진행 로그와 실패 여부를 확인합니다.

설치 후 일반적인 화면·TypeScript 코드만 수정할 때는 다음 명령으로 실행합니다.

```sh
npm run start:device
```

필요하면 터미널에서 `a`를 눌러 설치된 앱을 엽니다. 네이티브 패키지나 앱 설정 변경은 재빌드가 필요할 수 있습니다. 생성된 Android 파일을 직접 수정하기보다 `app.json`과 Expo config plugin을 통해 관리합니다.

## 7. 기존 개발용 APK로 실행

소스 다운로드와 `npm ci`는 필요하지만, 로컬 네이티브 빌드는 생략할 수 있습니다.

1. 팀에서 공유한 **현재 소스의 네이티브 설정과 호환되는 개발용 APK**를 받습니다.
2. 실제 휴대폰에는 APK를 다운로드해 설치합니다. 에뮬레이터에는 APK를 창에 끌어다 놓거나 `adb install 경로/app.apk`로 설치합니다.
3. `mobile`에서 `npm run start:device`를 실행합니다.
4. 실제 휴대폰은 컴퓨터와 같은 와이파이에 연결하고, 개발용 앱에서 터미널의 QR·링크로 서버에 연결합니다.
5. 필요하면 개발용 앱의 주소 입력에 터미널에 표시된 개발 서버 주소를 넣습니다.

기존 APK와 로컬 빌드의 서명키가 다르면 덮어쓰기 설치가 거절될 수 있습니다. 이때는 기존 설치의 데이터 보존 여부를 확인한 뒤 처리합니다.

## 8. 백엔드와 연결

### 백엔드를 같은 컴퓨터에서 실행

Docker Desktop을 켭니다. 앱 저장소와 별개인 `AIContractManager-BE`에서 실행합니다.

```sh
cd AIContractManager-BE
docker compose --env-file .env up -d --build
docker compose --env-file .env ps
```

BE의 `.env`는 백엔드 담당자에게 안전하게 전달받고 Git에는 올리지 않습니다. 현재 Compose의 필수 변수는 `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `JWT_SECRET`입니다. 로그인은 카카오·네이버 설정값, AI 분석은 `GEMINI_API_KEY`도 필요합니다.

`mysql`, `backend`, `ai`가 모두 healthy인지 확인합니다. 앱·소셜 로그인·실제 AI 분석의 성공까지 의미하는 것은 아닙니다.

### 모바일 API 주소

| 실행 환경 | API 주소 예시 |
|---|---|
| Android 기본 에뮬레이터 + 같은 컴퓨터의 BE | `http://10.0.2.2:8080/api/aicontract` |
| 웹 + 같은 컴퓨터의 BE | `http://localhost:8080/api/aicontract` |
| 실제 휴대폰 또는 다른 컴퓨터의 BE | 해당 기기에서 접근 가능한 서버 주소 |
| 시연·배포 앱 | 공개 HTTPS API 주소 |

Android 개발용 실행은 환경변수가 없으면 첫 번째 주소를 기본으로 사용합니다. BE의 `BACKEND_PORT`를 바꿨다면 포트도 맞춥니다.

사용자별 설정은 `mobile/.env.local`에 작성합니다.

```dotenv
EXPO_PUBLIC_ANDROID_API_URL=http://10.0.2.2:8080/api/aicontract
# 백엔드 담당자와 준비한 실제 HTTPS 복귀 주소로 교체 후 사용
# EXPO_PUBLIC_NATIVE_OAUTH_REDIRECT_URI=https://YOUR_WEB_HOST/oauth/native-callback
```

실제 휴대폰의 `localhost`는 휴대폰 자신입니다. `10.0.2.2`도 실제 휴대폰용 주소가 아닙니다. 개발용 APK의 HTTP 허용 여부는 빌드 설정에 따라 확인하고, preview·배포 환경에서는 HTTPS를 사용합니다.

환경변수 변경 후 개발 서버를 종료하고 다시 시작합니다.

```sh
npm run start:device -- --clear
```

## 9. 카카오·네이버 로그인 준비

현재 모바일 OAuth는 다음 경로로 동작합니다.

```text
앱 → 카카오·네이버 → HTTPS 웹 페이지 /oauth/native-callback
   → ‘앱으로 돌아가기’ → contractmanager://oauth/callback → 앱
```

백엔드 담당자와 함께 준비할 항목:

1. 기존 `src/app/oauth/native-callback.tsx` 페이지를 HTTPS 주소로 제공
2. 해당 전체 주소를 카카오 REST API 키의 Redirect URI와 네이버 Callback URL에 등록
3. 동일한 값을 모바일의 `EXPO_PUBLIC_NATIVE_OAUTH_REDIRECT_URI`로 설정
4. BE의 provider 키·secret이 해당 등록 앱과 일치하는지 확인
5. 개발 서버를 재시작하고 처음부터 로그인

`KOE006`은 카카오에 등록한 URI와 앱이 요청한 URI가 맞지 않는 경우 확인합니다. 카카오는 REST API Redirect URI에 HTTP·HTTPS만 허용하므로 `contractmanager://...`를 직접 등록하는 방식으로 해결하지 않습니다.

복귀용 HTTPS 페이지가 준비되지 않았다면 시작·로그인 화면은 확인할 수 있지만, 로그인 이후 계약 기능 검증은 아직 완료할 수 없습니다. 개발용 APK라도 이 설정은 필요합니다.

`EXPO_PUBLIC_` 환경변수는 앱 코드에 포함됩니다. DB 비밀번호·OAuth Client Secret·JWT 서명키를 넣지 않습니다.

## 10. 팀 Expo 프로젝트와 클라우드 빌드

- 팀: `bee113s-team`
- Expo 표시 이름: `contract-manager-mobile`
- 주소용 slug: `gyeombi`
- Android 앱 식별자: `com.aicontractmanager.app`

기존 프로젝트 ID·owner가 `app.json`에 연결돼 있습니다. 팀원별로 새 Expo 프로젝트를 만들거나 `eas init`을 다시 실행할 필요는 없습니다. 로컬 빌드는 Expo 팀 계정 로그인 없이 가능하며, 클라우드 빌드·관리에는 해당 팀 권한이 필요합니다.

```sh
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile development
```

| eas.json 프로필 | 결과 | 실행 조건 |
|---|---|---|
| development | 개발용 APK | Metro 개발 서버 필요 |
| preview | 시연용 APK | Metro 불필요, 실제 HTTPS API·OAuth 설정 필요 |
| production | 스토어용 AAB | Google Play 배포용 |

preview를 만들기 전 EAS의 preview 환경에 공개 API·복귀 주소를 설정합니다. Git에서 제외된 `.env.local`이 클라우드 빌드에 전달된다고 가정하지 않습니다. 동일 앱의 업데이트에는 서명 관리가 필요하므로 팀의 기존 EAS 서명키를 사용합니다.

## 11. Git 공유 범위·검증

공유할 것: `src/`, `assets/`, `app.json`, `package.json`, `package-lock.json`, `eas.json`, README와 이 안내 문서 등 소스·설정 파일.

공유하지 않을 것: `.env*`의 실제 설정값, `node_modules/`, `.expo/`, 개인 `.zshrc`, SDK·JDK, 서명키, 개인 SDK 경로가 들어 있는 `local.properties`.

이 프로젝트는 생성되는 `mobile/android/`·`mobile/ios/`도 소스 공유 대상에서 제외하고 각 컴퓨터에서 생성하는 방식입니다. 커밋 전에 Git 제외 규칙을 확인합니다. 저장소 루트 `.gitignore`의 `/android`는 `mobile/android`와 다른 경로이므로, 중첩 경로도 별도로 제외해야 합니다. `git add mobile/` 전에 다음을 확인합니다.

```sh
git status --short
git check-ignore mobile/android mobile/ios
```

위 두 명령은 **앱 저장소 루트**에서 실행합니다. 출력이 없으면 제외 규칙을 점검합니다.

코드 검사:

```sh
npm run typecheck
npm run lint
npm test
```

실제 기기 점검: 로그인 복귀 → 계약 등록·조회·수정·삭제 → 앱 재실행 → PDF 업로드·AI 분석. 기기 푸시와 결제 알림 자동 수집은 별도의 네이티브 구현·권한·기기 검증이 필요합니다.

## 참고 문서

- Expo 환경 설정: https://docs.expo.dev/get-started/set-up-your-environment/
- Expo 로컬 빌드: https://docs.expo.dev/guides/local-app-development/
- Expo 네이티브 프로젝트 생성: https://docs.expo.dev/workflow/continuous-native-generation/
- Temurin 압축본 설치: https://adoptium.net/installation/archives/
- 카카오 Redirect URI: https://developers.kakao.com/docs/ko/app-setting/app
