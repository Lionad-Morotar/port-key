# PortKey Skills

本目录包含基于 `SKILL.md` 定义的 Agent Skills。

## 目录结构

所有技能按以下结构组织：

```
skills/<skill-name>/SKILL.md
```

## 使用方式

如果你使用 `npx skills` 生态工具，可以通过 GitHub 仓库路径安装或列出技能：

```bash
npx -y skills add https://github.com/Lionad-Morotar/port-key/tree/main/packages/skills --list
npx -y skills add https://github.com/Lionad-Morotar/port-key/tree/main/packages/skills --skill smart-port-allocation
```
