<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：简洁实用的端口命名策略</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 简介

通过字母到数字的键盘映射生成端口号。

当你在本地运行多个项目时，选择端口号会变得非常麻烦。

- 在过去几年里，新项目层出不穷。要真正尝试它们，你往往需要在本地启动它们——于是端口冲突接踵而来。  
- 如果希望浏览器标签页（或书签）保持稳定，一个项目的端口不应频繁变化。

例如，我的机器上有十多个 Nuxt 应用。如果它们全部默认使用 `3000`，显然不可行。因此，我想出了一个简单且一致的端口命名规则，以“分配”每个项目对应的端口。

[源博客文章](https://lionad.art/articles/simple-naming-method)

### 核心思路

不使用随机数字，而是将**项目名称映射为键盘上的数字**，从而得到*可读且易记*的端口号。

只要结果在合法的端口范围（**0–65535**）内且不冲突系统保留端口，即可直接使用。

更具体地说：使用标准 QWERTY 键盘，将每个字母根据其**行/列位置**映射为单个数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

然后可以取前 4 位数字（例如 `3453`），也可以保留更多位数（例如 `34353`）。两者皆可。

如果一个项目需要多个端口（前端、后端、数据库等），可以采用以下两种方式之一：

1. 使用项目前缀，再追加“角色后缀”  
   - 对于 `"cfetch"`，取 `3435` 作为基数  
   - 前端（`fe`，即 `43`） → `34354`  
   - 后端（`server`） → `34352`  
   - 数据库（`mongo`） → `34357`  
   - …以此类推  

2. 使用项目前缀，再按顺序分配角色  
   - 对于 `"cfetch"`，取 `3435` 作为基数  
   - Web → `34351`  
   - 后端 → `34352`  
   - 数据库 → `34353`  
   - …以此类推  

### 合法端口范围

- 端口号必须在 **0–65535** 范围内。  
- 对于自定义服务，通常最好使用 **1024–49151**（非保留）或 **49152–65535**（私有/动态）范围。  
- 只要映射得到的数字不超过上限，即为合法。

---

## 使用方法

简洁命令：

```sh
npx -y @lionad/port-key <your-project-name>
```

或者想要一个 stdio MCP 服务器：

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

- `-m, --map <object>`：自定义映射（JSON 或类似 JS 的对象字面量）  
- `--lang <code>`：输出语言（目前仅支持 `en` 与 `cn`，默认 `cn`）  
- `-d, --digits <count>`：端口的首选数字位数（4 或 5，默认 4）  
- `-h, --help`：显示帮助信息  

示例：

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435（四位端口）
npx @lionad/port-key cfetch --digits 5  # -> 34353（五位端口）
```

注意：
- 默认日志语言为 `cn`。使用 `--lang en` 可显示英文提示。  
- 使用 `-h` 或 `--help` 查看帮助。

### 配置

PortKey 支持从以下位置读取可选用户配置：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 端口首选数字位数（4 或 5）
  "preferDigitCount": 5,
  // 自定义字母到数字映射
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口范围限制（含）
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
