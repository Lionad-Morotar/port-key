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

## 概要

基于键盘按键布局生成端口号

当本地运行大量项目时，选择合适的端口号会变得令人烦恼。

- 过去几年里出现了*大量*新项目；为真正体验它们，你通常需要本地启动——随之而来的便是端口冲突问题。
- 若你想保持浏览器标签页（或书签）的稳定性，项目所使用的端口就不应频繁变动。

举个例子：我的机器上运行着十余个 Nuxt 应用。若它们默认均使用 `3000` 端口，显然不可行。为此，我设计了一套简洁且统一的端口命名规则，用以“分配”各项目的专属端口。

[原文博客](https://lionad.art/articles/simple-naming-method)

### 核心理念

不依赖随机数字，而是依据键盘布局，将**项目名称映射为数字序列**，从而让端口号具备可读性与可记忆性。

只要所得结果处于有效端口范围（**1024–65535**）且不与保留/系统端口冲突，即可直接使用。

具体而言：在标准 QWERTY 键盘上，依据字母所处的**行/列位置**将其映射为单个数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

随后可取前 4 位数字（如 `3453`），或保留更多位数（如 `34353`），两种方式均可。

若某项目需占用多个端口（如前端、后端、数据库等），请选择以下两种策略之一：

1. 以项目名称映射值为前缀，附加“角色后缀”  
   - `"cfetch"` 的基础映射值为 `3435`  
   - 前端（`fe`，即 `43`）→ `34354`  
   - 后端（`server`，即 `27`）→ `34352`  
   - 数据库（`mongo`，即 `76824`）→ 取前一位数 `7` → `34357`  
   - 依此类推

2. 以项目名称映射值为前缀，按顺序分配角色编号  
   - `"cfetch"` 的基础映射值为 `3435`  
   - Web 服务 → `34351`  
   - 后端 → `34352`  
   - 数据库 → `34353`  
   - 依此类推

### 有效端口范围说明

- 端口号必须在 **1024–65535** 范围内（系统保留端口 0–1023 不可使用）。
- **系统端口（0–1023）**：由 IETF 分配，严格禁止使用。
- **用户端口（1024–49151）**：由 IANA 分配，使用时需谨慎，因其可能与已注册服务冲突。
- **动态/私有端口（49152–65535）**：未被分配，最适合私有或动态使用场景。

---

## 使用方法

简易命令如下：

```sh
npx -y @lionad/port-key <your-project-name>
```

若需使用标准输入输出型 MCP 服务器，可执行：

```sh
npx -y @lionad/port-key-mcp
```

配置文件示例：

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

- `-m, --map <object>`：自定义映射规则（JSON 或类 JS 字面量格式）
- `--lang <code>`：输出语言（目前仅支持 `en` 和 `cn`，默认为 `cn`）
- `-d, --digits <count>`：端口号所需位数（4 或 5，默认为 4）
- `--padding-zero <true|false>`：输入较短时，以尾部补零方式补齐至指定位数（默认为 `true`）；例如 `"air"` → `1840`；`"1234" --digits 5` → `12340`
- `-h, --help`：显示帮助信息

示例命令：

```bash
npx @lionad/port-key cfetch # 输出：3435
npx @lionad/port-key cfetch --digits 4  # 输出：3435（4位端口）
npx @lionad/port-key cfetch --digits 5  # 输出：34353（5位端口）
```

备注：
- 默认日志语言为 `cn`；如需英文提示，请添加 `--lang en` 参数。
- 使用 `-h` 或 `--help` 可显示帮助信息。

### 配置文件

PortKey 支持从以下位置读取可选用户配置：

- `~/.port-key/config.json`

完整配置示例：

```json
{
  // 端口号首选位数（4 或 5）
  "preferDigitCount": 5,
  // 输入较短时是否以尾部补零方式补齐至首选位数（默认：true）
  "paddingZero": true,
  // 自定义字母到数字的映射
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口范围限制（含边界）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 开发者说明

### 项目结构

- 本仓库采用 pnpm monorepo 结构，核心包位于 `packages/core` 目录。
- 安装依赖：在根目录执行 `pnpm install`。
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`。
