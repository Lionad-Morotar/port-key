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

## 요약

키보드의 문자‑숫자 매핑을 이용해 포트를 생성합니다.

여러 프로젝트를 로컬에서 실행할 때 포트 번호를 정하는 것이 번거로울 수 있습니다.

- 지난 몇 년간 새로운 프로젝트가 너무 많이 생겼습니다. 실제로 사용해 보려면 로컬에서 부팅해야 하는데, 그 과정에서 포트 충돌이 발생합니다.
- 브라우저 탭(또는 즐겨찾기)을 일정하게 유지하려면 프로젝트마다 포트가 계속 바뀌지 않아야 합니다.

예를 들어, 제 머신에 Nuxt 앱이 열 개 이상 있습니다. 모두 기본값 `3000`을 사용한다면 당연히 충돌이 발생합니다. 그래서 저는 “프로젝트당 포트를 할당한다”는 간단하고 일관된 규칙을 생각해냈습니다.

[원본 블로그 글](https://lionad.art/articles/simple-naming-method)

### 핵심 아이디어

무작위 숫자를 선택하는 대신 **키보드 레이아웃을 기준으로 프로젝트 이름을 숫자로 매핑**합니다. 이렇게 하면 포트가 *읽기 쉽고* *기억하기 쉬워집니다.

결과값이 유효한 포트 범위(**1024–65535**) 안에 있고 예약/시스템 포트를 피한다면 그대로 사용하면 됩니다.

구체적으로는 QWERTY 키보드의 각 문자 위치(행·열)를 기준으로 한 자리 숫자와 매핑합니다.

예시:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（포트 번호）

그 후 처음 4자리(`3453`)를 사용하거나 전체 5자리를 유지해도 됩니다(`34353`). 어느 쪽이든 상관없습니다.

프로젝트에 여러 포트가 필요할 경우(프런트엔드, 백엔드, 데이터베이스 등) 다음 두 방법 중 하나를 선택합니다:

1. 프로젝트 접두어 뒤에 “역할 접미사”를 붙인다  
   - `"cfetch"`의 경우 기본값은 `3435`  
   - 프런트엔드(`fe`, 즉 `43`) → `34354`  
   - 백엔드(`server`) → `34352`  
   - 데이터베이스(`mongo`) → `34357`  
   - …등

2. 프로젝트 접두어 뒤에 순차적인 역할 번호를 부여한다  
   - `"cfetch"`의 경우 기본값은 `3435`  
   - 웹 → `34351`  
   - 백엔드 → `34352`  
   - 데이터베이스 → `34353`  
   - …등

### 유효 포트 범위

- 포트 번호는 **1024–65535** 사이여야 합니다(시스템 포트 0‑1023은 사용 불가).
- **시스템 포트(0‑1023)**: IETF에서 할당. 절대 사용 금지.
- **사용자 포트(1024‑49151)**: IANA에서 할당. 충돌 가능성이 있으니 주의.
- **동적/프라이빗 포트(49152‑65535)**: 할당되지 않음. 개인 혹은 동적 사용에 가장 안전합니다.

---

## 사용 방법

간단한 명령:

```sh
npx -y @lionad/port-key <your-project-name>
```

표준 입출력(MCP) 서버가 필요하면:

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

- `-m, --map <object>`: 사용자 정의 매핑 (JSON 또는 JS 객체 리터럴)
- `--lang <code>`: 출력 언어 (현재는 `en`과 `cn`만 지원, 기본값: `cn`)
- `-d, --digits <count>`: 포트에 사용할 자리수(4 또는 5, 기본값: 4)
- `--padding-zero <true|false>`: 자리수가 부족한 포트를 앞에 0으로 채울지 여부(기본값: true). 예) `"air"` → `1840`
- `-h, --help`: 도움말 표시

예시:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (4자리 포트)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (5자리 포트)
```

참고:
- 기본 로그 언어는 `cn`입니다. 영어 메시지를 보려면 `--lang en`을 사용하세요.
- 도움말은 `-h` 또는 `--help` 옵션으로 확인할 수 있습니다.

### 설정 파일

PortKey는 아래 경로에서 사용자 정의 설정을 읽어들입니다:

- `~/.port-key/config.json`

전체 예시:

```json
{
  // 포트에 사용할 기본 자리수 (4 또는 5)
  "preferDigitCount": 5,
  // 짧은 포트에 앞쪽 0을 채울지 여부 (기본값: true)
  "paddingZero": true,
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

- 이 저장소는 pnpm 모노레포 방식으로 구성되어 있으며, 핵심 패키지는 `packages/core`에 있습니다.
- 설치: 루트 디렉터리에서 `pnpm install` 실행
- 테스트 실행: `pnpm -C packages/core test` 또는 `pnpm -C packages/core test:watch` 실행.
