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

借助键盘布局的字母与数字映射生成端口号。

当您本地运行多个项目时，为各项目选择合适的端口号往往令人头疼：

- 过去几年里出现了大量新项目，要真正体验它们通常需本地启动——随之而来的便是端口冲突问题；
- 若您希望保持浏览器标签页（或书签）的稳定性，则应避免项目端口号频繁变动。

例如，我的机器上运行着十余个 Nuxt 应用；若它们默认均使用 `3000` 端口，显然不可行。因此我设计了一套简洁一致的端口命名规则，用于为每个项目“分配”唯一的端口号。

[原文博客](https://lionad.art/articles/simple-naming-method)

### 核心思路

摒弃随意选取数字的做法，转而依据键盘布局将**项目名称映射为数字序列**，使端口号具备可读性与记忆性。

只要结果落在有效端口范围内（**1024–65535**），且避开预留/系统端口，即可直接使用。

具体而言：基于标准 QWERTY 键盘布局，将每个字母按其所在的**行/列位置**映射为单个数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

随后可取前 4 位数字（如 `3453`）或保留更多位数（如 `34353`），均无不可。

若项目需占用多个端口（如前端、后端、数据库等），可任选以下两种方式之一：

1. 以项目前缀为基础，追加“角色后缀”：
   - 将 `"cfetch"` 对应端口 `3435` 作为基础值；
   - 前端（缩写 `fe`，即 `43`）→ `34354`
   - 后端（缩写 `server`，即 `218375`）→ `34352`
   - 数据库（缩写 `mongo`，即 `651824`）→ `34357`
   - 依此类推

2. 以项目前缀为基础，按角色顺序分配数字：
   - 将 `"cfetch"` 对应端口 `3435` 作为基础值；
   - Web → `34351`
   - 后端 → `34352`
   - 数据库 → `34353`
   - 依此类推

### 有效端口范围

- 端口号须落在 **1024–65535** 范围内（系统保留端口 0–1023 禁止使用）；
- **系统端口（0–1023）**：由 IETF 分配，严格禁止使用；
- **注册端口（1024–49151）**：由 IANA 分配，使用时需谨慎，可能与已注册服务冲突；
- **动态/私有端口（49152–65535）**：未分配，最适合私有或动态用途。

---

## 使用方法

简单命令如下：

```sh
npx -y @lionad/port-key <ваше-имя-проекта>
```

若需启用标准输入输出的 MCP 服务器，可执行：

```sh
npx -y @lionad/port-key-mcp
```

配置示例：

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

- `-m, --map <object>`：自定义映射关系（JSON 或类 JS 字面量对象）；
- `--lang <код>`：输出语言（当前支持 `en` 与 `cn`，默认为 `cn`）；
- `-d, --digits <количество>`：端口号位数偏好（4 或 5，默认为 4）；
- `--padding-zero <true|false>`：当输入内容不足时，是否以尾部补零达到指定位数（默认为 `true`），例如 `"air"` → `1840`；若设定 `--digits 5`，则 `"1234"` → `12340`；
- `-h, --help`：显示帮助信息。

使用示例：

```bash
npx @lionad/port-key cfetch # → 3435
npx @lionad/port-key cfetch --digits 4  # → 3435 (4位端口号)
npx @lionad/port-key cfetch --digits 5  # → 34353 (5位端口号)
```

备注：
- 默认日志语言为 `cn`，可使用 `--lang en` 切换为英文提示；
- 使用 `-h` 或 `--help` 可查看帮助信息。

### 配置文件

PortKey 将从以下位置读取可选用户配置：

- `~/.port-key/config.json`

完整示例：

```json
{
  // 端口号首选位数（4 或 5）
  "preferDigitCount": 5,
  // 输入内容不足时是否以尾部补零至首选位数（默认：true）
  "paddingZero": true,
  // 自定义字母到数字的映射
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口号有效范围（含边界）
  "minPort": 1024,
  "maxPort": 49151
}
```


---

## 开发者说明

### 项目结构

- 本仓库采用 pnpm monorepo 结构，核心包位于 `packages/core`；
- 安装依赖：在根目录执行 `pnpm install`；
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`。
