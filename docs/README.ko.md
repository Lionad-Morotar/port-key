<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/Lionad-Morotar/port-key/main/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：간단하고 실용적인 포트 네이밍 전략</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 개요

키보드의 문자-숫자 매핑으로 포트 생성하기

로컬에서 여러 프로젝트를 한꺼번에 실행하다 보면 포트 번호를 정하는 일이 귀찮아집니다.

- 지난 몇 년 동안 새로운 프로젝트가 *정말* 많아졌습니다. 직접 써보려면 로컬에서 부팅해야 하는 경우가 많고, 그러다 보면 포트 충돌이 발생하기 시작합니다.
- 브라우저 탭(또는 북마크)을 안정적으로 유지하려면 프로젝트의 포트가 계속 바뀌어서는 안 됩니다.

예를 들어, 제 머신에는 10개가 넘는 Nuxt 앱이 있습니다. 모두 기본값인 `3000`을 사용한다면 당연히 제대로 동작하지 않습니다. 그래서 저는 프로젝트별로 포트를 "할당"하는 간단하고 일관된 포트 네이밍 규칙을 고안했습니다.

[원문 블로그 글](https://lionad.art/articles/simple-naming-method)

### 핵심 아이디어

무작위 숫자를 고르는 대신, **프로젝트 이름을 키보드 기준으로 숫자에 매핑**하여 포트를 *읽기 쉽고* *기억하기 쉽게* 만듭니다.

결과가 유효한 포트 범위(**1024–65535**) 안에 있고 예약/시스템 포트와 충돌하지 않는다면 그대로 사용하면 됩니다.

더 구체적으로는, 표준 QWERTY 키보드를 기준으로 각 문자를 **행/열 위치**에 따라 한 자리 숫자로 매핑합니다.

예시:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`(포트 번호)

이후 첫 4자리(예: `3453`)를 사용하거나 더 많은 자리(예: `34353`)를 유지해도 됩니다. 어느 쪽이든 괜찮습니다.

프로젝트에 여러 포트(프론트엔드, 백엔드, 데이터베이스 등)가 필요하다면 다음 두 가지 접근 방식 중 **하나**를 선택합니다.

1. 프로젝트 접두사 뒤에 "역할 접미사"를 덧붙이기
   - `"cfetch"`의 경우 `3435`를 기준으로 사용
   - 프론트엔드(`fe`, 즉 `43`) → `34354`
   - 백엔드(`server`) → `34352`
   - 데이터베이스(`mongo`) → `34357`
   - ……이런 식으로 계속

2. 프로젝트 접두사 뒤에 역할을 순차적으로 할당하기
   - `"cfetch"`의 경우 `3435`를 기준으로 사용
   - Web → `34351`
   - 백엔드 → `34352`
   - 데이터베이스 → `34353`
   - ……이런 식으로 계속

### 유효한 포트 범위

- 포트는 반드시 **1024–65535** 범위 안에 있어야 합니다(시스템 포트 0–1023은 차단됨).
- **시스템 포트(0–1023)**: IETF에서 할당. 엄격히 차단됨.
- **사용자 포트(1024–49151)**: IANA에서 할당. 등록된 서비스와 충돌할 수 있으므로 주의해서 사용하세요.
- **동적/사설 포트(49152–65535)**: 미할당. 사설 또는 동적 용도에 가장 안전함.

---

## 사용 방법

간단한 명령:

```sh
npx -y @lionad/port-key <your-project-name>
```

또는 stdio MCP 서버가 필요한 경우:

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

- `-m, --map <object>`: 사용자 정의 매핑(JSON 또는 JS 스타일의 객체 리터럴)
- `--lang <code>`: 출력 언어(현재는 `en`과 `cn`만 지원, 기본값: `cn`)
- `-d, --digits <count>`: 포트의 선호 자릿수(4 또는 5, 기본값: 4)
- `--padding-zero <true|false>`: 입력이 짧을 때 끝에 0을 채워 선호 자릿수에 맞춤(기본값: true). 예: `"air"` → `1840`, `"1234" --digits 5` → `12340`
- `-h, --help`: 도움말 표시

예시:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (4자리 포트)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (5자리 포트)
```

참고:
- 기본 로그 언어는 `cn`입니다. 영어 메시지를 보려면 `--lang en`을 사용하세요.
- 도움말을 보려면 `-h` 또는 `--help`를 사용하세요.

### 설정

PortKey는 다음 위치에서 선택적 사용자 설정을 읽습니다.

- `~/.port-key/config.json`

전체 예시:

```json
{
  // 포트의 선호 자릿수(4 또는 5)
  "preferDigitCount": 5,
  // 입력이 짧을 때 끝에 0을 채워 선호 자릿수에 맞춤(기본값: true)
  "paddingZero": true,
  // 사용자 정의 문자-숫자 매핑
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 포트 범위 제한(양끝 포함)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 개발자용

### 프로젝트 구조

- 이 저장소는 pnpm monorepo로 구성되어 있으며, 핵심 패키지는 `packages/core`에 있습니다.
- 설치: 루트 디렉터리에서 `pnpm install`을 실행합니다.
- 테스트 실행: `pnpm -C packages/core test` 또는 `pnpm -C packages/core test:watch`를 사용합니다.
