# 贡献指南

感谢愿意为本主题贡献。提交前请确保符合以下规范：

- 先在 Issues 中说明问题或方案，避免重复工作
- 保持主题模板结构与 Halo v2 官方规范一致
- 插件适配请通过 `pluginFinder.available(...)` 判定可用性
- 插件样式优先使用插件提供的 CSS 变量进行统一
- 本地构建资源并自测关键页面

## 本地开发

1. 使用 `dev/docker-compose.yml` 启动开发环境：

```bash
docker compose -f dev/docker-compose.yml up -d
```

2. 将本项目克隆到开发环境的 `themes` 目录内，例如 `themes/theme-organization`。
3. 在主题目录构建资源，开发时可用 `build:watch`：

```bash
pnpm install
pnpm run build
```

如需边改边看：

```bash
pnpm run build:watch
```

## 提交说明

- 修改说明清晰、范围明确
- 不提交 `templates/assets/build` 产物
