<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: 간단하고 실용적인 포트 명명 전략</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Brief

키보드의 문자-숫자 매핑을 이용해 포트를 생성합니다.

여러 프로젝트를 로컬에서 실행할 때, 포트 번호 선택이 번거로울 수 있습니다.

- 최근 몇 년간 새로운 프로젝트가 *매우 많이* 생겨났습니다. 실제로 사용해 보려면 로컬에서 부팅해야 하는 경우가 많고, 이때 포트 충돌이 발생합니다.
- 브라우저 탭(또는 북마크)을 안정적으로 유지하려면, 프로젝트마다 포트가 계속 바뀌지 않아야 합니다.

예를 들어, 제 컴퓨터에는 Nuxt 애플리케이션이 10개 이상 있습니다. 모두가 기본값인 `3000`을 사용한다면 당연히 충돌이 발생합니다. 그래서 저는 프로젝트마다 “포트를 할당”하는 간단하고 일관된 규칙을 고안했습니다.

[Source Blog Post](https://lionad.art/articles/simple-naming-method)

### 핵심 아이디어

임의의 숫자를 선택하는 대신, **키보드 레이아웃을 기준으로 프로젝트명을 숫자로 매핑**합니다. 이렇게 하면 포트 번호가 *읽기 쉽고* *외우기 쉬운* 형태가 됩니다.

결과가 유효한 포트 범위(**0–65535**) 안에 들어가고, 예약/시스템 포트를 피한다면 그대로 사용할 수 있습니다.

구체적으로는 QWERTY 키보드의 각 문자 위치를 기준으로, **행/열**에 따라 하나의 숫자로 매핑합니다.

예시:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（포트 번호）

그 후 처음 4자리(`3453`)를 사용하거나, 전체 5자리를 그대로 사용할 수 있습니다. 두 방법 모두 괜찮습니다.

프로젝트에 여러 포트가 필요할 경우(프론트엔드, 백엔드, 데이터베이스 등), 다음 두 가지 방법 중 하나를 선택합니다:

1. 프로젝트 접두사 뒤에 **역할 접미사**를 붙인다  
   - `"cfetch"`의 경우 기본값 `3435`를 사용  
   - 프론트엔드(`fe`, 즉 `43`) → `34354`  
   - 백엔드(`server`) → `34352`  
   - 데이터베이스(`mongo`) → `34357`  

2. 프로젝트 접두사 뒤에 **순차적인 역할 번호**를 부여한다  
   - `"cfetch"`의 경우 기본값 `3435`를 사용  
   - 웹 → `34351`  
   - 백엔드 → `34352`  
   - 데이터베이스 → `34353`

### 유효 포트 범위

- 포트 번호는 **0–65535** 사이여야 합니다.
- 사용자 정의 서비스의 경우 일반적으로 **1024–49151**(비예약) 혹은 **49152–65535**(프라이빗/동적) 범위를 사용하는 것이 좋습니다.
- 매핑된 숫자가 이 제한 이하라면 유효합니다.

---

## How to use

```bash
npx @lionad/port-key <your-project-name>
```

### CLI 옵션

- `-m, --map <object>`: 사용자 정의 매핑 (JSON 또는 JS 객체 리터럴)
- `--lang <code>`: 출력 언어 지정 (현재는 `en`과 `cn`만 지원, 기본값: `cn`)
- `-d, --digits <count>`: 포트에 사용할 자릿수 지정 (4 또는 5, 기본값: 4)
- `-h, --help`: 도움말 표시

예시:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (4자리 포트)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (5자리 포트)
```

참고 사항:
- 기본 로그 언어는 `cn`입니다. 영어 메시지를 보려면 `--lang en`을 사용하세요.
- `-h` 또는 `--help` 옵션으로 도움말을 확인할 수 있습니다.

### Config

PortKey는 다음 위치에서 사용자 설정 파일(`config.json`)을 읽어들입니다:

- `~/.port-key/config.json`

예시 구성 파일:

```json
{
  // 포트에 사용할 선호 자릿수 (4 또는 5)
  "preferDigitCount": 5,
  // 사용자 정의 문자-숫자 매핑
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 포트 범위 제한 (포함)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## For Developer

### Project Structure

- 이 저장소는 pnpm monorepo 구조를 사용합니다; 핵심 패키지는 `packages/core`에 있습니다.
- 설치: 프로젝트 루트에서 `pnpm install`을 실행합니다.
- 테스트 실행: `pnpm -C packages/core test` 또는 `pnpm -C packages/core test:watch`.
