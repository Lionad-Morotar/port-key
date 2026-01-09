## Registry 设置

* 使用官方默认 registry：<https://registry.npmjs.org/（当前> .npmrc 已指向官方，无需改动）

* 发布命令在默认 registry 下执行；如需移除 .npmrc 以完全走 Node 默认，也可在确认后删除（保持现状即可）

## 必要改动

* 对齐入口与导出

  * 在 package.json 添加 exports: { ".": "./src/portkey.js" }，不再依赖 main

  * 保持 type=module；源码直接以 ESM 发布

  * index.js 不作为入口；可删除或改为 ESM 中转（保留与否不影响 exports）

* 精简发布内容

  * 在 package.json 添加 files: \["src", "bin", "README.md", "LICENSE" ]，避免 test/public 被带入包

* 完善元数据

  * 补充 description、repository、bugs、homepage、engines（例如 node>=16），提升包质量与可发现性

* 添加 LICENSE 文件

  * 根据 package.json 的 ISC 生成 LICENSE 文本并随包发布

## 不做的改动（按你的偏好）

* 不强制加入测试钩子：不添加 prepublishOnly 测试；需要时可手动运行 vitest

## 验证与发布

* 包体验证：npm publish --dry-run 或 npm pack，确认仅包含 src、bin、README、LICENSE

* 运行验证：

  * import { mapToPort } from 'portkey' 验证 ESM 导入

  * npx portkey --help 验证 CLI 可用

* 名称冲突应对：若 “portkey” 被占用，备用名：portkey-cli 或 port-key

* 发布：npm login（建议开启 2FA）→ 语义化版本（如 0.1.1）→ npm publish

## 参考文件

* package.json [package.json](file:///Users/lionad/Github/Lionad-Morotar/port-key/package.json)

* 源码导出 [portkey.js](file:///Users/lionad/Github/Lionad-Morotar/port-key/src/portkey.js)

* CLI 可执行 [portkey.js](file:///Users/lionad/Github/Lionad-Morotar/port-key/bin/portkey.js)

* README [README.md](file:///Users/lionad/Github/Lionad-Morotar/port-key/README.md)

