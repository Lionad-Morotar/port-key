<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：一种简洁实用的端口命名策略</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 개요

키보드 레이아웃을 기반으로端口编号

로컬 환경에서 여러 프로젝트를 동시에 실행할 때,端口 번호를 설정하는 일이 점점 불편해집니다.

- 최근 몇 년간 새롭게 시작한 프로젝트가 *매우* 많았습니다. 이를 실제로 확인하려면 보통 로컬에서 실행해야 하며, 그러다 보면端口 충돌이 자주 발생합니다.
- 브라우저 탭(또는 북마크)을 일관되게 유지하고 싶다면, 각 프로젝트에 대한端口 번호가 자주 바뀌어서는 안 됩니다.

예를 들어, 제 머신에는 10개가 넘는 Nuxt 앱이 설치되어 있습니다. 모두 기본值 `3000`을 사용한다면 очividно 작동하지 않습니다. 그래서 저는 프로젝트마다 일관되게端口를 “할당”할 수 있는 간단하고 일관된命名 규칙을 고안했습니다.

[원문 블로그 게시물](https://lionad.art/articles/simple-naming-method)

### 핵심 아이디어

무작위 숫자를 선택하기보다, 프로젝트 이름을 **키보드 상의 위치에 따라 숫자로 매핑**하여,端口 번호가 *가독성*과 *기억하기 쉬움*을 갖도록 합니다.

결과값이 유효한端口 범위(**1024–65535**) 내에 있고, 예약/시스템端口를 충돌하지 않는다면 바로 사용할 수 있습니다.

구체적으로, 일반 QWERTY 키보드를 기준으로 각 글자를 **행/열 위치에 따라 단일 숫자로 매핑**합니다.

예시:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口 번호）

그 후 첫 4자리(예: `3453`)를 사용하거나, 더 많은 자리를 그대로 유지할 수 있습니다(예: `34353`). 두 방식 모두 문제없습니다.

多个端口(프론트엔드, 백엔드, 데이터베이스 등)가 필요한 경우 다음 두 가지 접근법 중 하나를 선택합니다:

1. 프로젝트 이름을 기반으로 한 “프리픽스”를 만들고, 역할을 나타내는 “접미사” 추가  
   - `"cfetch"`에서 `3435`를 기본값으로 사용  
   - 프론트엔드(`fe`, 즉 `43`) → `34354`  
   - 백엔드(`server`) → `34352`  
   - 데이터베이스(`mongo`) → `34357`  
   - 이와 같이 계속

2. 프로젝트 이름의 기준 번호에서 역할별로 순차적으로 숫자 추가  
   - `"cfetch"`에서 `3435`를 기본값으로 사용  
   - 웹 → `34351`  
   - 백엔드 → `34352`  
   - 데이터베이스 → `34353`  
   - 이와 같이 계속

### 유효한端口 범위

-端口는 **1024–65535** 내에서 사용해야 합니다(시스템端口 0–1023은 차단됨).  
- **시스템端口 (0–1023)**: IETF에서 할당. 등록된 시스템 서비스 전용이므로 엄격히 사용 금지.  
- **유저端口 (1024–49151)**: IANA에서 할당. 등록된 서비스와 충돌 가능하므로 주의해서 사용할 것.  
- **동적/사설端口 (49152–65535)**: 할당되지 않음. 사설 또는 동적 용도로 가장 안전.

---

## 사용 방법

간단한 명령어:

```sh
npx -y @lionad/port-key <your-project-name>
```

또는 stdio MCP 서버를 원하는 경우:

```sh
npx -y @lionad/port-key-mcp
```

```json
{
  "mcpServers": {
    "port-key": {
      "command": "npx",
      "args": ["@lionad/port-key-mcp"]
    }
  }
}
```


### CLI 옵션

- `-m, --map <object>`: 사용자 정의 매핑 설정(JSON 또는 JS 스타일 객체 리터럴)  
- `--lang <code>`: 언어 설정(현재는 `en`과 `cn`만 지원, 기본값: `cn`)  
- `-d, --digits <count>`:端口 번호 자릿수 선호 설정(4 또는 5, 기본값: 4)  
- `--padding-zero <true|false>`: 입력이 짧을 때 원하는 자릿수에 맞춰 끝에 0을 추가(기본값: true). 예: `"air"` → `1840`, `"1234" --digits 5` → `12340`  
- `-h, --help`: 도움말 표시  

예시:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (4자리端口)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (5자리端口)
```

참고:
- 기본 로그 언어는 `cn`입니다. 영문 메시지를 보려면 `--lang en`을 사용하세요.
- `-h` 또는 `--help`로 도움말을 볼 수 있습니다.

### 설정

PortKey는 다음 경로에서 사용자 설정 파일을 선택적으로 읽습니다:

- `~/.port-key/config.json`

전체 예시:

```json
{
  //端口 번호에 선호하는 자릿수(4 또는 5)
  "preferDigitCount": 5,
  // 입력이 짧을 때 자릿수 맞춤을 위해 끝에 0 추가 여부(기본값: true)
  "paddingZero": true,
  // 사용자 정의字母-숫자 매핑
  "blockedPorts": [3000, 3001, 3002, 6666],
  //端口 범위 제한(포함)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 개발자 안내

### 프로젝트 구조

- 이 저장소는 pnpm monorepo로 구성됨; 핵심 패키지는 `packages/core`에 위치.
- 설치: 루트 디렉터리에서 `pnpm install` 실행  
- 테스트 실행: `pnpm -C packages/core test` 또는 `pnpm -C packages/core test:watch`
