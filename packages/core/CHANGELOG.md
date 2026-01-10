# 更新日志

## v0.1.5

- fix: 将符号链接的 README.md 替换为实际文件，确保 npm 发布时 README 被正确包含

## v0.1.4

- docs: add readme in packages/core

## v0.1.3

- feat: 首次运行时提示欢迎信息
- feat: 配置文件读取失败时会显示错误信息
- feat: 增加日志文件，使用 `~/.port-key/log.json` 记录运行次数

## v0.1.2

- feat: 更改包名为 `@lionad/port-key`

## v0.1.1

- feat: 更改包名为 `port-key`

## v0.1.0

- feat: 提供命令行运行能力：`npx portkey -- <项目名称>`（`bin/port-key.js`）
- feat: 提供默认的键盘映射策略（1qaz、2wsx、3edc、4rfv、5tgb、6yhn、7ujm、8ik、9ol、0p）
- feat: 支持自定义映射 `-m/--map`（支持 JSON 或 JS 对象字面量）
- feat: 支持自定义映射键校验
- feat: 支持用户配置：`~/.portkey/config.json`
- feat: 端口选择与校验（0–65535，尊重 `blockedPorts`、`minPort`、`maxPort`）
- feat: 新增配置项 `preferDigitCount`（默认 4，支持 4 或 5）
- feat: 新增命令行参数 `-d/--digits` 控制优先位数
- feat: 测试覆盖（vitest）
- feat: 端口生成失败时输出详细信息：展示候选值及拒绝原因
- feat: 支持 i18n，中文和英文（en）
