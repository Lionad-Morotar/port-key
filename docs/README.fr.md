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

## 简介

通过键盘字母-数字映射生成端口号  

当你本地同时运行多个项目时，选择端口号往往令人头疼。

- 近年来，新项目层出不穷。为了真正尝试这些项目，你常常需要在本地启动它们——随之而来的便是端口冲突问题。
- 若你想保持浏览器标签页（或书签）的稳定性，项目的端口号就不应频繁变动。

例如，我的机器上运行着十余个 Nuxt 应用。如果它们都默认使用 `3000` 端口，显然不可行。因此，我设计了一套简单、一致的端口命名规则，用于为各项目“分配”唯一的端口号。

[原文博客](https://lionad.art/articles/simple-naming-method)

### 核心思路

与其随机选择数字，不如依据**项目名称按键盘位置映射为数字**，使得端口号具备可读性与可记忆性。

只要结果处于有效端口范围内（**1024–65535**），且未占用保留端口或系统端口，即可直接使用。

具体而言：基于标准 QWERTY 键盘布局，以各字母的**行列位置**映射为单个数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

你可以截取前 4 位（如 `3435`），也可保留更多位（如 `34353`）——两种方式均可。

若某一项目需要多个端口（如前端、后端、数据库等），请选择以下两种方案之一：

1. 以项目名前缀为基础，追加“角色后缀”  
   - `"cfetch"` → 基础值为 `3435`  
   - 前端（`fe`，对应 `43`）→ `34354`  
   - 后端（`server`，对应 `2283756` → 取各位数字之和模10后得 `2`）→ `34352`  
   - 数据库（`mongo`，对应 `64747` → 取最后一位 `7`）→ `34357`  
   - …依此类推

2. 以项目名前缀为基础，追加连续角色编号  
   - `"cfetch"` → 基础值为 `3435`  
   - Web 服务 → `34351`  
   - 后端 → `34352`  
   - 数据库 → `34353`  
   - …依此类推

### 有效端口范围说明

- 端口号必须位于 **1024–65535** 之间（系统保留端口 0–1023 已被禁止使用）。
- **系统端口（0–1023）**：由 IETF 分配，严禁使用。
- **用户端口（1024–49151）**：由 IANA 分配，使用时需谨慎，以免与已注册服务冲突。
- **动态/私有端口（49152–65535）**：未被分配，最适合私人或动态用途。

---

## 使用方法

简易命令：

```sh
npx -y @lionad/port-key <your-project-name>
```

或若需调用 stdio MCP 服务器：

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

- `-m, --map <object>`：自定义映射规则（JSON 或类 JavaScript 对象字面量）
- `--lang <code>`：输出语言（当前仅支持 `en` 和 `cn`，默认值：`cn`）
- `-d, --digits <count>`：端口位数偏好（4 或 5， 默认值：4）
- `--padding-zero <true|false>`：输入过短时，是否以尾部零补足至指定位数（默认值：`true`）。例如 `"air"` → `1840`； `"1234" --digits 5` → `12340`
- `-h, --help`：显示帮助信息

示例：

```bash
npx @lionad/port-key cfetch # → 3435
npx @lionad/port-key cfetch --digits 4  # → 3435（4位端口）
npx @lionad/port-key cfetch --digits 5  # → 34353（5位端口）
```

备注：
- 默认日志语言为 `cn`。使用 `--lang en` 可显示英文提示信息。
- 使用 `-h` 或 `--help` 可查看帮助。

### 配置说明

PortKey 支持从以下路径读取用户可选配置文件：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 端口位数偏好（4 或 5）
  "preferDigitCount": 5,
  // 输入较短时，是否以尾零补足至偏好位数（默认值：true）
  "paddingZero": true,
  // 自定义字母-数字映射规则
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口范围限制（含边界）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 开发者指南

### 项目结构

- 本仓库采用 pnpm monorepo 构建，核心包位于 `packages/core`。
- 安装依赖：在根目录执行 `pnpm install`。
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`。
