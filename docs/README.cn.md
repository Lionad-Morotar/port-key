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

依据键盘布局将字母映射为数字，生成端口号。

当你本地运行多个项目时，选择合适的端口号往往令人头疼：

- 过去几年里，新项目层出不穷；真正尝试它们通常需要本地启动——随即端口冲突频发；
- 若希望保持浏览器标签页（或书签）稳定，项目的端口号应固定不变。

例如，我的机器上运行着十余个 Nuxt 应用；若全部默认使用 `3000` 端口显然不可行。因此我设计了一套简洁、一致的端口命名规则，为每个项目“分配”专属端口号。

[原文博客](https://lionad.art/articles/simple-naming-method)

### 核心思想

与其随意选取数字，不如依据键盘布局将**项目名称映射为数字**，使端口具备可读性与记忆性。

只要生成的端口号处于有效范围内（**1024–65535**）且避开保留/系统端口，即可直接使用。

具体做法：在标准 QWERTY 键盘上，根据每个字母的**行列位置**将其映射为单个数字。

示例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（端口号）

随后可选取前 4 位数字（如 `3453`），或保留全部位数（如 `34353`）均可。

若项目需多个端口（前端、后端、数据库等），可采用以下任一方案：

1. 以项目名前缀为基础，拼接“角色后缀”  
   - `"cfetch"` 基础端号取 `3435`  
   - 前端（`fe` 即 `43`）→ `34354`  
   - 后端（`server`）→ `34352`  
   - 数据库（`mongo`）→ `34357`  
   - 余此类推

2. 以项目名前缀为基础，顺序分配角色编号  
   - `"cfetch"` 基础端号取 `3435`  
   - Web 服务 → `34351`  
   - 后端 → `34352`  
   - 数据库 → `34353`  
   - 余此类推

### 有效端口范围说明

- 端口号必须位于 **1024–65535** 区间（系统保留端口 0-1023 禁止使用）。
- **系统端口（0–1023）**：由 IETF 分配，严禁使用。
- **用户端口（1024–49151）**：由 IANA 分配，使用时需谨慎，可能与已注册服务冲突。
- **动态/私有端口（49152–65535）**：未分配，最适合私有或临时使用。

---

## 使用方法

简捷命令如下：

```sh
npx -y @lionad/port-key <your-project-name>
```

或若需一个标准输入/输出 MCP 服务器：

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

- `-m, --map <object>`：自定义映射规则（JSON 或类 JS 字面量对象）
- `--lang <code>`：输出语言（当前仅支持 `en` 与 `cn`，默认：`cn`）
- `-d, --digits <count>`：端口号 preferred digit count（4 或 5，默认值：4）
- `--padding-zero <true|false>`：输入过短时，以尾零补齐至指定位数（默认：true）。例如 `"air"` → `1840`；运行 `"1234" --digits 5` 则输出 `12340`
- `-h, --help`：显示帮助信息

用例：

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435（4 位端口号）
npx @lionad/port-key cfetch --digits 5  # -> 34353（5 位端口号）
```

备注：
- 默认日志语言为 `cn`；如需英文提示，请加入参数 `--lang en`
- 使用 `-h` 或 `--help` 查看帮助信息。

### 配置方式

PortKey 可从以下路径读取可选用户配置：

- `~/.port-key/config.json`

完整示例如下：

```json
{
  // 端口号 preferred digit count（4 或 5）
  "preferDigitCount": 5,
  // 输入过短时是否以尾零补齐至 preferred digit count（默认：true）
  "paddingZero": true,
  // 自定义字母-数字映射关系
  "blockedPorts": [3000, 3001, 3002, 6666],
  // 端口号限制区间（含边界）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 开发者说明

### 项目结构

- 本仓库采用 pnpm monorepo 构建；核心模块位于 `packages/core`。
- 安装依赖：在根目录执行 `pnpm install`
- 运行测试：`pnpm -C packages/core test` 或 `pnpm -C packages/core test:watch`
