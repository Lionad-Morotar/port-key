<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/Lionad-Morotar/port-key/main/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：一种简洁实用的端口命名策略</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 简介

通过键盘字母到数字的映射生成端口号

当你在本地运行多个项目时，选择端口号往往会让人头疼。

- 过去几年里，新项目层出不穷。要真正体验它们，通常需要在本地启动——然后端口就开始冲突了。
- 如果你希望浏览器标签页（或书签）保持稳定，项目的端口号就不应频繁变动。

例如，我的机器上运行着十多个 Nuxt 应用。如果它们全部默认使用 `3000`，显然行不通。因此我设计了一套简单、一致的端口命名规则，为每个项目“分配”专属端口。

[原文博客](https://lionad.art/articles/simple-naming-method)

### 核心思想

与其随机选取数字，不如依据键盘布局将**项目名称映射为数字**，让端口具备可读性和记忆性。

只要结果落在有效端口范围内（**1024–65535**）且不占用保留/系统端口，即可直接使用。

具体来说：在标准 QWERTY 键盘上，根据每个字母的**行列位置**将其映射为单个数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

你可以取前 4 位数字（如 `3453`），也可以保留更多位数（如 `34353`），两种方式均可。

如果项目需要多个端口（前端、后端、数据库等），请从以下两种方案中任选其一：

1. 以项目名前缀为基础，追加“角色后缀”
   - `"cfetch"` 的基础值为 `3435`
   - 前端（`fe` 即 `43`）→ `34354`
   - 后端（`server`）→ `34352`
   - 数据库（`mongo`）→ `34357`
   - ……依此类推

2. 以项目名前缀为基础，按顺序分配角色编号
   - `"cfetch"` 的基础值为 `3435`
   - Web 服务 → `34351`
   - 后端 → `34352`
   - 数据库 → `34353`
   - ……依此类推

### 有效端口范围

- 端口号必须位于 **1024–65535** 之间（系统端口 0-1023 已被禁用）。
- **系统端口（0-1023）**：由 IETF 分配，严格禁止使用。
- **用户端口（1024-49151）**：由 IANA 分配，使用时需谨慎，可能与已注册服务冲突。
- **动态/私有端口（49152-65535）**：未被分配，最适合私有或动态用途。

---

## 使用方法

简单命令：

```sh
npx -y @lionad/port-key <your-project-name>
```

或使用 stdio MCP 服务器：

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
- `--lang <code>`：输出语言（当前仅支持 `en` 和 `cn`，默认：`cn`）
- `-d, --digits <count>`：端口号的首选位数（4 或 5，默认：4）
- `--padding-zero <true|false>`：输入过短时，以尾零补齐至首选位数（默认：true）。例如 `"air"` -> `1840`，`"1234" --digits 5` -> `12340`
- `-h, --help`：显示帮助信息

示例：

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435（4 位端口）
npx @lionad/port-key cfetch --digits 5  # -> 34353（5 位端口）
```

备注：
- 默认日志语言为 `cn`。使用 `--lang en` 可显示英文信息。
- 使用 `-h` 或 `--help` 查看帮助。

### 配置

PortKey 可从以下路径读取可选用户配置：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 端口号的首选位数（4 或 5）
  "preferDigitCount": 5,
  // 输入过短时，以尾零补齐至首选位数（默认：true）
  "paddingZero": true,
  // 自定义字母到数字的映射
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口范围限制（含边界）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 开发者指南

### 项目结构

- 本仓库采用 pnpm monorepo；核心包位于 `packages/core`。
- 安装：在根目录执行 `pnpm install`。
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`。
