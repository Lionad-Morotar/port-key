# PortKey 工具使用指南

## 目录
- [工具简介](#工具简介)
- [安装与执行](#安装与执行)
- [核心参数说明](#核心参数说明)
- [使用示例](#使用示例)
- [输出格式](#输出格式)
- [高级用法](#高级用法)
- [常见问题](#常见问题)

## 工具简介

PortKey 是一个基于键盘映射的端口生成工具，通过将项目名称的字母映射为数字，生成可记忆且不易冲突的端口号。

### 核心原理
- 使用标准 QWERTY 键盘布局，将字母映射到数字
- 根据字母在键盘上的行列位置确定对应数字
- 自动处理端口合法性验证（端口范围与屏蔽列表）
- **名称处理**：长项目名称/中文名称的首字母提取由智能体或调用方完成

### 键盘映射规则
```
1: qaz   2: wsx   3: edc   4: rfv   5: tgb
6: yhn   7: ujm   8: ik    9: ol    0: p
```

示例：
- `cfetch` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `343536` → 默认输出 `3435`（取 4 位候选）

### 项目名称处理规则
- **短名称**（1-2 个单词或 ≤8 个字母）：直接使用
  - `"dashboard"` → `"dashboard"`
  - `"myapp"` → `"myapp"`
- **长名称**（多个单词或 >8 个字母）：提取首字母
  - `"我爱我家"`（Wǒ Ài Wǒ Jiā）→ `"wawj"`
  - `"user authentication service"` → `"uas"`
  - `"enterprise resource planning system"` → `"erps"`
  - `"ecommerce payment gateway"` → `"epg"`
- **混合语言**：自动识别中英文，提取拼音或英文字母首字母

## 安装与执行

### 使用 npx（推荐）
无需预安装，直接使用 npx 自动下载和执行：

```bash
npx -y @lionad/port-key <project-name>
```

### 参数说明
- `-y`: 自动确认，跳过下载确认提示
- `@lionad/port-key`: npm 包名

## 核心参数说明

### 必需参数
- **project-name**: 项目名称（必填）
  - 支持字母和数字
  - 自动转换为小写
  - 推荐使用简短名称（1-8 个字母）以获得最佳效果
  - 示例：`"myproject"`, `"dashboard"`, `"shop"`, `"wawj"`（"我爱我家"的首字母）
  - **注意**：PortKey 工具本身不处理中文或长名称，首字母提取由智能体完成

### 可选参数

#### `--digits <count>` 或 `-d <count>`
设置端口号的位数

- **可选值**: 4, 5
- **默认值**: 4
- **说明**: 优先生成指定位数的端口号

示例：
```bash
npx -y @lionad/port-key "myproject" --digits 4   # 生成 4 位端口
npx -y @lionad/port-key "myproject" --digits 5   # 生成 5 位端口
```

#### `--lang <code>`
设置输出语言

- **可选值**: `en`, `cn`
- **默认值**: `cn`
- **说明**: 控制日志消息的语言

示例：
```bash
npx -y @lionad/port-key "myproject" --lang en
npx -y @lionad/port-key "myproject" --lang cn
```

#### `--map <object>`
自定义键盘映射

- **格式**: JSON 或 JS 对象字面量
- **默认值**: 标准 QWERTY 映射
- **说明**: 自定义字母到数字的映射关系

示例：
```bash
npx -y @lionad/port-key "myproject" --map '{"1":"abc","2":"def"}'
```

## 使用示例

### 基础用法
```bash
# 生成默认 4 位端口
npx -y @lionad/port-key "myproject"
# 输出: 7604

# 生成 5 位端口
npx -y @lionad/port-key "myproject" --digits 5
# 无法从输入生成有效端口。
# Rejected candidates:
#   76049: Invalid port number
#   97335: Invalid port number
```

### 首字母提取示例（智能体处理）
```bash
# 长项目名称：用户认证服务 → 提取 "uas"
npx -y @lionad/port-key "uas"
# 输出: 7120

# 长项目名称：我爱我家 → 提取 "wawj"
npx -y @lionad/port-key "wawj"
# 输出: 2127

# 长项目名称：Enterprise Resource Planning System → 提取 "erps"
npx -y @lionad/port-key "erps"
# 输出: 3402
```
**注意**：首字母提取由智能体完成，PortKey 工具只接收处理后的简短名称。

### 端口范围与屏蔽列表（通过配置文件）
PortKey CLI 不提供 `--min-port/--max-port/--blocked-ports` 参数；如需限制范围或屏蔽端口，请使用用户配置文件（见下文“配置文件”）。

### 多组件项目
```bash
# 1. 生成基础端口
npx -y @lionad/port-key "myapp"
# 输出: 7610

# 2. 前端服务（角色前缀更容易生成不同端口）
npx -y @lionad/port-key "fe-myapp"
# 输出: 4376

# 3. 后端服务
npx -y @lionad/port-key "api-myapp"
# 输出: 1087

# 4. 数据库
npx -y @lionad/port-key "db-myapp"
# 输出: 3576
```

### 处理短项目名
```bash
# 短项目名会自动填充零
npx -y @lionad/port-key "air" --digits 4
# 输出: 1840

# 长项目名截取指定位数
npx -y @lionad/port-key "dashboard" --digits 4
# 输出: 3126
```

### 处理长项目名（配合智能体）
```bash
# 智能体将长名称转换为首字母后调用
# 例如："用户认证服务" → "uas"
npx -y @lionad/port-key "uas"
# 输出: 7120

# 例如："电子商务支付网关" → "epg"
npx -y @lionad/port-key "epg"
# 输出: 3050

# 例如："Customer Relationship Management System" → "crms"
npx -y @lionad/port-key "crms"
# 输出: 3472
```

## 输出格式

### 标准输出
默认情况下，PortKey 输出生成的端口号（纯数字）：

```bash
$ npx -y @lionad/port-key "myproject"
# 输出 7604
```

首次运行且本机没有配置文件时，CLI 可能会在 stderr 打印一段提示信息；stdout 仍然只输出端口号，脚本中建议用命令替换读取 stdout（如 `PORT=$(...)`）。

### 详细输出（MCP 模式）
当作为 MCP server 使用时（`@lionad/port-key-mcp`），会返回 JSON 格式的详细信息：

```json
{
  "digits": "760497335",
  "port": 7604,
  "rejectedCandidates": []
}
```

字段说明：
- `digits`: 映射后的数字序列
- `port`: 最终选择的端口号
- `rejectedCandidates`: 被拒绝的候选端口列表（如有）

## 高级用法

### 配置文件
PortKey 会从 `~/.port-key/config.json` 读取用户配置：

```json
{
  "preferDigitCount": 5,
  "paddingZero": true,
  "blockedPorts": [3000, 3001, 6666],
  "minPort": 1024,
  "maxPort": 49151
}
```

也可以通过环境变量 `PORTKEY_HOME` 指定配置目录（目录下仍使用 `.port-key/config.json`）。

### MCP Server 集成
将 PortKey 作为 MCP server 使用：

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

### 批量生成端口
在 Shell 脚本中批量生成端口：

```bash
#!/bin/bash
projects=("project-a" "project-b" "project-c")

for project in "${projects[@]}"; do
  port=$(npx -y @lionad/port-key "$project")
  echo "$project: $port"
done
```

### 集成到启动脚本
将端口生成集成到项目启动脚本：

```bash
#!/bin/bash
PROJECT_NAME="myapp"

# 生成端口
PORT=$(npx -y @lionad/port-key "$PROJECT_NAME")

# 启动服务
export PORT=$PORT
npm start
```

## 常见问题

### Q1: 为什么生成的端口不在期望的范围内？
**A**: 检查以下几点：
1. 检查 `~/.port-key/config.json` 中的 `minPort/maxPort` 配置（如有）
2. 检查 `blockedPorts` 是否屏蔽了范围内的端口
3. 确认期望范围在 1024-65535 之间（0-1023 始终被屏蔽）

### Q2: 短项目名生成的端口位数不足？
**A**: 使用 `--digits` 参数指定位数，工具会自动填充零：
```bash
npx -y @lionad/port-key "air" --digits 4
```

### Q3: 长项目名称如何处理？
**A**: 智能体会自动处理长项目名称：
- **中文长名称**：提取拼音首字母，如 "我爱我家" → "wawj"
- **英文长名称**：提取单词首字母，如 "User Authentication Service" → "uas"
- 也可以手动指定简短名称，如使用 "uas" 代替 "用户认证服务"
- 首字母提取后，由智能体调用 PortKey 生成端口

### Q4: 如何验证生成的端口是否可用？
**A**: 使用以下命令检查端口占用：
```bash
# Linux/Mac
lsof -i :<port>

# Windows
netstat -ano | findstr :<port>
```

### Q5: 能否自定义键盘映射？
**A**: 可以使用 `--map` 参数自定义：
```bash
npx -y @lionad/port-key "myproject" --map '{"1":"abc","2":"def"}'
```

### Q6: 多组件项目如何分配端口？
**A**: 推荐两种方式：
1. **角色前缀法**：`fe-myapp`, `api-myapp`, `db-myapp`
2. **顺序分配法**：基础端口、基础+1、基础+2

详细策略见 [port-best-practices.md](port-best-practices.md)

### Q7: 生成的端口与现有服务冲突怎么办？
**A**: PortKey 不检测端口占用；请先用系统命令确认冲突端口，然后将冲突端口加入 `~/.port-key/config.json` 的 `blockedPorts` 后重试（或换用不同的项目名/角色前缀）。

### Q8: 如何在团队中统一端口分配？
**A**: 建议遵循以下步骤：
1. 使用相同的工具和参数
2. 在文档记录端口分配
3. 使用版本管理端口配置
4. 定期审计端口使用情况
5. **统一首字母规则**：团队内部统一长项目名称的首字母提取规则

## 相关文档
- [端口分配最佳实践](port-best-practices.md)：详细的端口分配策略和团队协作指南
- PortKey GitHub：https://github.com/Lionad-Morotar/port-key
