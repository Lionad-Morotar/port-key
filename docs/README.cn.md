<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：简洁、实用的端口命名策略</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 简介

通过字母到数字的键盘映射生成端口  

在本地运行多个项目时，选择端口号会变得相当麻烦。

- 在过去的几年里，新项目层出不穷。要真正尝试它们，常常需要在本地启动——这时端口很容易冲突。  
- 如果想保持浏览器标签页（或书签）稳定，一个项目的端口不应频繁变化。

例如，我的机器上有十多个 Nuxt 应用。如果它们全部默认使用 `3000`，显然运行不下去。因此，我想出了一个简单且一致的端口命名规则，以“分配”每个项目的端口。

[原博客文章](https://lionad.art/articles/simple-naming-method)

### 核心思路

不随机挑选数字，而是根据键盘布局将**项目名称映射为数字**，从而得到可读且易记的端口号。

只要结果在合法端口范围（**1024–65535**）内且不冲突保留/系统端口，即可直接使用。

更具体地说：使用标准 QWERTY 键盘，将每个字母映射为其所在**行/列位置对应的数字**。

示例：  

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）  

随后可取前 4 位数字（如 `3453`），或保留全部位数（如 `34353`）。两者皆可。

如果一个项目需要多个端口（前端、后端、数据库等），可以采用以下两种方式之一：

1. 使用项目前缀，然后追加“角色后缀”  
   - 对于 `"cfetch"`，取 `3435` 作为基数  
   - 前端（`fe`，即 `43`） → `34354`  
   - 后端（`server`） → `34352`  
   - 数据库（`mongo`） → `34357`  
   - …以此类推  

2. 使用项目前缀，然后按顺序分配角色编号  
   - 对于 `"cfetch"`，取 `3435` 作为基数  
   - Web → `34351`  
   - 后端 → `34352`  
   - 数据库 → `34353`  
   - …以此类推  

### 合法端口范围

- 端口必须在 **1024–65535** 范围内（系统保留端口 0-1023 不可用）。  
- **系统端口（0-1023）**：由 IETF 分配，严格禁止使用。  
- **用户端口（1024-49151）**：由 IANA 分配，使用时需注意可能与已注册服务冲突。  
- **动态/私有端口（49152-65535）**：未分配，最适合私有或动态使用。

---

## 使用方法

简单命令：

```sh
npx -y @lionad/port-key <your-project-name>
```

或者你想要一个 stdio MCP 服务器：

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

### CLI 参数

- `-m, --map <object>`：自定义映射（JSON 或类似 JS 对象字面量）  
- `--lang <code>`：输出语言（目前仅支持 `en` 与 `cn`，默认 `cn`）  
- `-d, --digits <count>`：端口首选位数（4 或 5，默认 4）  
- `--padding-zero <true|false>`：短端口是否前置零（默认 true），例如 “air” → 1840  
- `-h, --help`：显示帮助信息  

示例：

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435（4 位端口）
npx @lionad/port-key cfetch --digits 5  # -> 34353（5 位端口）
```

注意事项：  
- 默认日志语言为 `cn`。使用 `--lang en` 可显示英文信息。  
- 使用 `-h` 或 `--help` 查看帮助。

### 配置

PortKey 可读取用户自定义配置文件：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 首选端口位数（4 或 5）
  "preferDigitCount": 5,
  // 短端口前置零（默认 true）
  "paddingZero": true,
  // 自定义字母到数字映射
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口范围限制（包含）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 开发者说明

### 项目结构

- 本仓库采用 pnpm monorepo；核心包位于 `packages/core`。  
- 安装：在根目录执行 `pnpm install`。  
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`。
