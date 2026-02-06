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

基于键盘字母数字映射生成端口

本地运行多个项目时，选择端口号常令人烦恼：

- 过去几年涌现了大量新项目；为真正体验它们，往往需要本地启动——随即端口冲突频发。
- 若希望浏览器标签页（或书签）持久稳定，项目的端口号便不该频繁变动。

例如，我的机器上同时运行着十余个 Nuxt 应用；若它们均默认占用 `3000`，显然不可行。因此，我设计了一套简洁、统一的端口命名规则，为每个项目“分配”专属端口。

[来源博客](https://lionad.art/articles/simple-naming-method)

### 核心思路

不依赖随机数字，而是依据**项目名称键盘布局映射为数字序列**，使端口具备可读性与记忆性。

只要结果落在有效端口范围（**1024–65535**）内，且避开保留/系统端口，即可直接使用。

具体而言：以标准 QWERTY 键盘为基准，依据字母的**行/列位置**将其映射为单个数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

可取前四位（如 `3435`），也可保留全部数字（如 `34353`）——二者皆可。

若项目需多个端口（前端、后端、数据库等），请选择以下任一策略：

1. 使用项目前缀，再附加“角色后缀”
   - 以 `"cfetch"` 为例，取 `3435` 为基础
   - 前端（`fe`，即 `43`）→ `34354`
   - 后端（`server`）→ `34352`
   - 数据库（`mongo`）→ `34357`
   - …依此类推

2. 使用项目前缀，再分配连续角色编号
   - 以 `"cfetch"` 为例，取 `3435` 为基础
   - Web → `34351`
   - 后端 → `34352`
   - 数据库 → `34353`
   - …依此类推

### 有效端口范围

- 端口必须落在 **1024–65535**（系统端口 0–1023 被禁止使用）。
- **系统端口（0–1023）**：由 IETF 分配，严格禁止使用。
- **用户端口（1024–49151）**：由 IANA 分配，使用时须谨慎，可能与注册服务冲突。
- **动态/私有端口（49152–65535）**：未被分配，最适用于私有或动态场景。

---

## 使用方法

简明命令：

```sh
npx -y @lionad/port-key <your-project-name>
```

或启用标准输入/输出 MCP 服务器：

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

- `-m, --map <object>`：自定义映射表（JSON 或 JS 字面量对象）
- `--lang <code>`：输出语言（当前仅支持 `en` 和 `cn`，默认值：`cn`）
- `-d, --digits <count>`：端口推荐位数（4 或 5，默认值：4）
- `--padding-zero <true|false>`：输入位数不足时以尾部零填充至推荐位数（默认值：true）。如 `"air"` → `1840`；`"1234" --digits 5` → `12340`
- `-h, --help`：显示帮助信息

示例：

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435（4 位端口）
npx @lionad/port-key cfetch --digits 5  # -> 34353（5 位端口）
```

备注：
- 默认日志语言为 `cn`；使用 `--lang en` 可显示英文提示。
- 使用 `-h` 或 `--help` 可查看帮助。

### 配置文件

PortKey 会读取用户配置（可选），路径如下：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 端口推荐位数（4 或 5）
  "preferDigitCount": 5,
  // 输入位数不足时以尾部零填充至推荐位数（默认：true）
  "paddingZero": true,
  // 自定义字母到数字的映射规则
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
