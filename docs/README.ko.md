<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：간단하고 실용적인 포트 명명 전략</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Brief

문자-숫자 키보드 매핑을 이용해 포트를 생성합니다.

여러 프로젝트를 로컬에서 실행할 때, 포트 번호 선택이 번거로울 수 있습니다.

- 최근 몇 년간 새로운 프로젝트가 *너무 많이* 생겨났습니다. 실제로 사용해 보려면 로컬에서 부팅해야 하는 경우가 많고, 그 과정에서 포트 충돌이 발생합니다.
- 브라우저 탭(또는 북마크)을 안정적으로 유지하려면, 프로젝트의 포트가 계속 바뀌지 않아야 합니다.

예를 들어 제 머신에는 Nuxt 앱이 10개 이상 있습니다. 모두 기본값인 `3000`을 사용한다면 당연히 동작하지 않겠죠. 그래서 저는 “프로젝트당 포트를 할당한다”는 간단하고 일관된 규칙을 만들었습니다.

[Source Blog Post](https://lionad.art/articles/simple-naming-method)

### 핵심 아이디어

무작위 숫자를 선택하는 대신, **키보드 위치**를 기준으로 프로젝트 이름을 숫자로 매핑합니다. 이렇게 하면 포트가 *읽히기 쉽고* *외우기 쉬운* 형태가 됩니다.

결과가 유효한 포트 범위(**1024–65535**) 안에 들어가고, 예약/시스템 포트를 피한다면 바로 사용할 수 있습니다.

구체적으로는 QWERTY 키보드의 각 문자에 행/열 위치를 기반으로 한 자릿수를 매핑합니다.

예시:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（포트 번호）

그 후 앞의 4자리(`3453`)를 사용하거나, 더 많은 자릿수를 유지할 수 있습니다(`34353`). 둘 다 괜찮습니다.

프로젝트가 여러 포트를 필요로 할 경우(프론트엔드, 백엔드, 데이터베이스 등), 다음 두 가지 방법 중 하나를 선택합니다:

1. 프로젝트 접두사에 “역할 접미”를 추가  
   - `"cfetch"`의 경우 기본값 `3435` 사용  
   - 프론트엔드(`fe`, 즉 `43`) → `34354`  
   - 백엔드(`server`) → `34352`  
   - 데이터베이스(`mongo`) → `34357`  
   - …이와 같이

2. 프로젝트 접두사에 순차적인 역할 번호를 부여  
   - `"cfetch"`의 경우 기본값 `3435` 사용  
   - 웹 → `34351`  
   - 백엔드 → `34352`  
   - 데이터베이스 → `34353`  
   - …이와 같이

### 유효 포트 범위

- 포트는 **1024–65535** 사이여야 합니다(시스템 포트 0-1023은 차단됨).
- **시스템 포트(0‑1023)**: IETF가 할당. 절대 사용 금지.
- **사용자 포트(1024‑49151)**: IANA가 할당. 등록된 서비스와 충돌할 수 있으니 주의.
- **동적/프라이빗 포트(49152‑65535)**: 할당되지 않음. 사적 혹은 동적 용도로 가장 안전함.

---

## 사용 방법

간단한 명령어:

```sh
npx -y @lionad/port-key <your-project-name>
```

또는 stdio MCP 서버가 필요하면:

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

- `-m, --map <object>`: 사용자 정의 매핑 (JSON 혹은 JS‑like 객체 리터럴)
- `--lang <code>`: 출력 언어 (현재는 `en`와 `cn`만 지원, 기본값: `cn`)
- `-d, --digits <count>`: 포트에 사용할 자릿수(`4` 또는 `5`, 기본값: `4`)
- `-h, --help`: 도움말 보기

예시:

```bash
npx @lionad/port-key cfetch # → 3435
npx @lionad/port-key cfetch --digits 4  # → 3435 (4자리 포트)
npx @lionad/port-key cfetch --digits 5  # → 34353 (5자리 포트)
```

참고:
- 기본 로그 언어는 `cn`입니다. `--lang en`을 사용하면 영어 메시지를 표시합니다.
- `-h` 또는 `--help`를 사용해 도움말을 확인하세요.

### 설정 파일

PortKey는 아래 위치에서 옵션이 담긴 사용자 설정 파일을 읽습니다:

- `~/.port-key/config.json`

예시 전체:

```json
{
  // 포트에 사용할 선호 자릿수 (4 또는 5)
  "preferDigitCount": 5,
  // 사용자 정의 문자‑숫자 매핑
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 포트 범위 제한 (포함)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 개발자를 위한 정보

### 프로젝트 구조

- 이 저장소는 pnpm monorepo 방식을 사용합니다; 핵심 패키지는 `packages/core`에 있습니다.
- 설치: 저장소 루트에서 `pnpm install` 실행
- 테스트 실행: `pnpm -C packages/core test` 또는 `pnpm -C packages/core test:watch` 실행.
