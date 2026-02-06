<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：一种简单实用的端口命名策略</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 概述

通过键盘字母与数字的映射关系生成端口号

当你在本地同时运行多个项目时，挑选合适的端口号常常令人头疼。

- 过去几年中出现了大量新项目。为了真正体验它们，你通常需要本地启动服务——随之而来的便是端口冲突问题。
- 如果你想保持浏览器标签页（或书签）的稳定性，项目所使用的端口不应频繁变更。

例如，我的机器上已运行着十余个 Nuxt 应用。若它们全部默认使用 `3000` 端口，显然无法共存。因此，我设计了一套简单、一致的端口命名规则，用于为不同项目“分配”专属端口。

[原文博客](https://lionad.art/articles/simple-naming-method)

### 核心思路

摒弃随意选取数字的方式，转而依据**键盘布局将项目名称映射为数字**，使端口号具备可读性与记忆性。

只要生成的端口号落在合法范围内（**1024–65535**），且避开已预留/系统级端口，即可直接使用。

具体方法如下：以标准 QWERTY 键盘为基础，根据每个字母的**行列位置**映射为单一数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

你可以仅取前四位数字（如 `3453`），或保留更多位数（如 `34353`），两种方式均可。

若项目需多个端口（前端、后端、数据库等），可任选以下两种策略之一：

1. 使用项目前缀，再附加“角色后缀”
   - 以 `"cfetch"` 为例，取 `3435` 作为基础值
   - 前端（`fe`，对应数字 `43`）→ `34354`
   - 后端（`server`，对应数字 `2`）→ `34352`
   - 数据库（`mongo`，对应数字 `7`）→ `34357`
   - ……依此类推

2. 使用项目前缀，再按顺序分配角色编号
   - 以 `"cfetch"` 为例，取 `3435` 作为基础值
   - Web 服务 → `34351`
   - 后端 → `34352`
   - 数据库 → `34353`
   - ……依此类推

### 合法端口范围

- 端口号需位于 **1024–65535**（系统保留端口 0–1023 禁止使用）
- **系统端口（0–1023）**：由 IETF 分配，严格禁止使用
- **用户端口（1024–49151）**：由 IANA 分配，使用时请谨慎，可能与已注册服务冲突
- **动态/私有端口（49152–65535）**：未被分配，最适合私有或动态用途

---

## 使用方法

简单命令如下：

```sh
npx -y @lionad/port-key <你的项目名称>
```

或你希望配置一个标准输入/输出的 MCP 服务：

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


### 命令行参数

- `-m, --map <object>`：自定义映射规则（JSON 或类 JavaScript 对象字面量）
- `--lang <code>`：输出语言（当前仅支持 `en` 与 `cn`，默认：`cn`）
- `-d, --digits <count>`：端口 preferred digit count（4 或 5，默认值：4）
- `--padding-zero <true|false>`：当输入长度不足时，是否以尾零补足至指定位数（默认为 `true`）。例如：`"air"` → `1840`，而 `"1234" --digits 5` → `12340`
- `-h, --help`：显示帮助信息

示例：

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435（四位端口）
npx @lionad/port-key cfetch --digits 5  # -> 34353（五位端口）
```

说明：
- 默认日志语言为 `cn`。如需英文提示，请添加参数 `--lang en`
- 使用 `-h` 或 `--help` 可查看帮助信息

### 配置文件

PortKey 会从以下路径读取可选用户配置：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 端口 preferred digit count（4 或 5）
  "preferDigitCount": 5,
  // 当输入长度不足时，是否以尾零补足至 preferred digits（默认：true）
  "paddingZero": true,
  // 自定义字母到数字的映射关系
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口取值范围限制（含边界）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 开发者说明

### 项目结构

- 本仓库采用 pnpm monorepo 结构；核心包位于 `packages/core`
- 安装依赖：在根目录执行 `pnpm install`
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`
