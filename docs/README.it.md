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

## 简介

通过键盘字母与数字的映射生成端口号

在本地同时运行多个项目时，挑选合适的端口号往往令人头疼。

- 过去几年中涌现了大量新项目；若想真正体验它们，通常需要在本地启动——随之而来的便是端口冲突问题。
- 若希望浏览器标签页（或书签）长期稳定，项目所使用的端口不应频繁变动。

举例而言：我的计算机上运行着十余个 Nuxt 应用。倘若它们全部默认使用 `3000` 端口，显然不可行。为此，我制定了一套简单、一致的端口命名规则，用以“分配”各项目的专属端口。

[原文博客](https://lionad.art/articles/simple-naming-method)

### 核心思路

摒弃随机数字，改用**项目名称按键位置映射为数字**的方式，使端口具备可读性与记忆性。

只要结果处于合法端口范围内（**1024–65535**）且不与保留/系统端口冲突，即可直接使用。

具体规则如下：基于标准 QWERTY 键盘布局，按每个字母的**行列位置**将其映射为单个数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

随后可截取前 4 位（如 `3453`），或保留更多位数（如 `34353`），二者皆可。

若项目需多个端口（前端、后端、数据库等），请选择以下两种方案之一：

1. 以项目名前缀为基础，追加“角色后缀”  
   - 对 `"cfetch"`，取基础值 `3435`  
   - 前端（`fe`，即 `43`）→ `34354`  
   - 后端（`server`）→ `34352`  
   - 数据库（`mongo`）→ `34357`  
   - 依此类推

2. 以项目名前缀为基础，按角色顺序分配编号  
   - 对 `"cfetch"`，取基础值 `3435`  
   - Web 服务 → `34351`  
   - 后端服务 → `34352`  
   - 数据库 → `34353`  
   - 依此类推

### 合法端口范围

- 端口号必须位于 **1024–65535** 之间（系统保留端口 0–1023 禁止使用）。
- **系统端口（0–1023）**：由 IETF 分配，严格禁止。
- **用户端口（1024–49151）**：由 IANA 分配，使用时需注意可能与已注册服务冲突。
- **动态/私有端口（49152–65535）**：未分配，最适合私有或临时使用。

---

## 使用方法

简单命令：

```sh
npx -y @lionad/port-key <your-project-name>
```

或需启用标准输入/输出 MCP 服务器：

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


### 命令行选项

- `-m, --map <object>`：自定义映射（JSON 或类 JS 字面量格式）
- `--lang <code>`：输出语言（当前仅支持 `en` 和 `cn`，默认：`cn`）
- `-d, --digits <count>`：端口数字位数偏好（4 或 5，默认：4）
- `--padding-zero <true|false>`：当输入较短时，以尾随零补足至偏好位数（默认：true）。例如 `"air"` → `1840`；输入 `"1234" --digits 5` → `12340`
- `-h, --help`：显示帮助信息

示例：

```bash
npx @lionad/port-key cfetch # → 3435
npx @lionad/port-key cfetch --digits 4  # → 3435（4位端口）
npx @lionad/port-key cfetch --digits 5  # → 34353（5位端口）
```

备注：
- 默认日志语言为 `cn`；使用 `--lang en` 可显示英文提示。
- 使用 `-h` 或 `--help` 显示帮助信息。

### 配置文件

PortKey 支持从以下路径读取可选用户配置：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 端口数字位数偏好（4 或 5）
  "preferDigitCount": 5,
  // 当输入较短时，以尾随零补足至偏好位数（默认：true）
  "paddingZero": true,
  // 自定义字母-数字映射关系
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口范围限制（含边界）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 开发者说明

### 项目结构

- 本仓库采用 pnpm monorepo 架构；核心包位于 `packages/core`。
- 安装依赖：在根目录执行 `pnpm install`。
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`。
