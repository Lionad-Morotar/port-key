# PortKey Skills

本目录包含基于 `SKILL.md` 定义的 Agent Skills。

## 目录结构

所有技能按以下结构组织：

```
skills/<skill-name>/SKILL.md
```

## 使用方式

如果你使用 `npx skills` 生态工具，可以指向本目录安装或列出技能：

```bash
npx -y skills add Lionad-Morotar/port-key --list
npx -y skills add Lionad-Morotar/port-key --skill smart-port-allocation
```
