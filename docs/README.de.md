<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：一种简洁实用的端口命名方案</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 简介

通过键盘字母与数字的映射生成端口编号

当您本地运行多个项目时，为各项目分配端口号往往会带来困扰。

- 过去几年中涌现了**大量**新项目，而真正体验它们通常需要本地启动——随之而来便是端口冲突问题。
- 若希望保持浏览器标签页（或书签）的稳定性，项目所使用的端口应避免频繁变动。

例如：我本机上运行着十余个 Nuxt 应用。倘若它们默认均使用 `3000` 端口，显然不可行。因此我设计了一套简洁、统一的端口命名规则，用于为各项目“指定”专属端口。

[原文博客](https://lionad.art/articles/simple-naming-method)

### 核心思想

摒弃随意选取数字的方式，转而根据项目名称中字母在键盘上的**行/列位置**映射为数字，使端口号具备可读性与记忆性。

只要结果落在有效端口范围内（**1024–65535**）且避开保留/系统端口，即可直接使用。

具体而言：在标准 QWERTY 键盘上，依据每个字母的键位行与列坐标，映射为单个数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

您可选取前 4 位数字（例如 `3453`），也可保留更多位数（如 `34353`），二者皆可接受。

若某项目需多个端口（前端、后端、数据库等），请任选以下两种策略之一：

1. 采用项目名前缀 + “角色后缀”  
   - `"cfetch"` 的基础映射为 `3435`  
   - 前端（`fe` 即 `43`）→ `34354`  
   - 后端（`server` 即 `20`）→ `34352`  
   - 数据库（`mongo` 即 `64736`）→ `34357`  
   - 依此类推

2. 采用项目名前缀 + 连续角色编号  
   - `"cfetch"` 的基础映射为 `3435`  
   - Web 服务 → `34351`  
   - 后端 → `34352`  
   - 数据库 → `34353`  
   - 依此类推

### 有效端口范围说明

- 端口号必须位于 **1024–65535** 区间内（系统保留端口 0–1023 禁用）。
- **系统端口（0–1023）**：由 IETF 分配，严格禁用。
- **用户端口（1024–49151）**：由 IANA 分配，使用时请谨慎，因其可能与已注册服务冲突。
- **动态/私有端口（49152–65535）**：未分配，最适于私有或动态用途。

---

## 使用方式

简单命令：

```sh
npx -y @lionad/port-key <your-project-name>
```

或使用标准 I/O MCP 服务器：

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


### 命令行参数选项

- `-m, --map <object>`：自定义映射关系（JSON 格式或 JS 字面量对象）
- `--lang <code>`：输出语言（当前仅支持 `en` 与 `cn`，默认值为 `cn`）
- `-d, --digits <count>`：端口号 preferred digit count（4 或 5，默认值为 4）
- `--padding-zero <true|false>`：当输入长度不足时，是否以末尾零填充至 preferred digit count（默认值为 true）。例如：`"air"` → `1840`，`"1234" --digits 5` → `12340`
- `-h, --help`：显示帮助信息

使用示例：

```bash
npx @lionad/port-key cfetch # → 3435
npx @lionad/port-key cfetch --digits 4  # → 3435（4 位端口号）
npx @lionad/port-key cfetch --digits 5  # → 34353（5 位端口号）
```

注意事项：
- 默认日志语言为 `cn`；如需英文提示信息，请使用 `--lang en`
- 可通过 `-h` 或 `--help` 查看帮助信息

### 配置文件

PortKey 从以下路径读取可选的用户配置：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 端口号 preferred digit count（4 或 5）
  "preferDigitCount": 5,
  // 当输入长度不足时，是否以末尾零填充至 preferred digit count（默认值：true）
  "paddingZero": true,
  // 自定义字母到数字的映射规则
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口范围限制（含边界）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 开发者指南

### 项目结构说明

- 本仓库采用 pnpm monorepo 架构；核心包位于 `packages/core`。
- 安装依赖：在根目录执行 `pnpm install`
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`
