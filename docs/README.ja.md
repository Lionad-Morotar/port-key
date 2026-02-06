<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：简单实用的端口命名策略</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 概要

基于键盘字母数字映射生成端口

当你本地同时运行多个项目时，选择端口号往往令人烦恼。

- 过去几年中涌现了大量新项目。若想真正体验它们，通常需在本地启动——随之而来的便是端口冲突问题。
- 若希望浏览器标签页（或书签）保持稳定，某项目的端口就应避免反复变动。

举个例子：我的机器上运行着十余个 Nuxt 应用。若全部默认使用 `3000` 端口，显然不可行。因此我设计了一套简单且一致的端口命名规则，为每个项目“分配”端口。

[原始博客文章](https://lionad.art/articles/simple-naming-method)

### 核心思想

不随意选取数字，而是根据项目名称按键盘位置将其映射为数字，使端口具备**可读性**与**可记忆性**。

只要结果落在有效端口范围（**1024–65535**）内，且不与预留/系统端口冲突，即可直接使用。

具体而言：依据标准 QWERTY 键盘布局，将每个字母映射为单个数字（基于其所在**行列位置**）。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

你可以仅取前 4 位（如 `3453`），或保留更多位数（如 `34353`），均可。

若某项目需多个端口（前端、后端、数据库等），请选择以下两种方式之一：

1. 使用项目名前缀，再追加“角色后缀”  
   - `"cfetch"` 取 `3435` 为基础  
   - 前端（`fe`，即 `43`）→ `34354`  
   - 后端（`server`）→ `34352`  
   - 数据库（`mongo`）→ `34357`  
   - …以此类推

2. 使用项目名前缀，再依序分配角色编号  
   - `"cfetch"` 取 `3435` 为基础  
   - Web → `34351`  
   - 后端 → `34352`  
   - 数据库 → `34353`  
   - …以此类推

### 有效端口范围

- 端口必须在 **1024–65535** 之间（系统端口 0–1023 被禁止使用）。
- **系统端口（0–1023）**：由 IETF 分配，严格禁止。
- **用户端口（1024–49151）**：由 IANA 分配，使用时需谨慎，因其可能与已注册服务冲突。
- **动态/私有端口（49152–65535）**：未分配，适合私有或临时用途。

---

## 使用方法

简单命令：

```sh
npx -y @lionad/port-key <your-project-name>
```

或你需要一个 stdio MCP 服务器：

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

- `-m, --map <object>`：自定义映射（JSON 或类 JS 对象字面量）
- `--lang <code>`：输出语言（目前仅支持 `en` 与 `cn`，默认：`cn`）
- `-d, --digits <count>`：端口 preferred digit count（4 或 5，默认：4）
- `--padding-zero <true|false>`：输入较短时以尾随零补足至 preferred digits（默认：true）。例如 `"air"` → `1840`；`"1234" --digits 5` → `12340`
- `-h, --help`：显示帮助

示例：

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435（4 位端口）
npx @lionad/port-key cfetch --digits 5  # -> 34353（5 位端口）
```

注意：
- 默认日志语言为 `cn`；使用 `--lang en` 可显示英文提示。
- 使用 `-h` 或 `--help` 查看帮助。

### 配置文件

PortKey 可从以下位置读取可选用户配置：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 端口 preferred digit count（4 或 5）
  "preferDigitCount": 5,
  // 输入较短时以尾随零补足至 preferred digits（默认：true）
  "paddingZero": true,
  // 自定义字母-数字映射
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口范围限制（含边界）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 开发者说明

### 项目结构

- 本仓库采用 pnpm monorepo 结构；核心包位于 `packages/core`。
- 安装依赖：在根目录执行 `pnpm install`。
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`。
