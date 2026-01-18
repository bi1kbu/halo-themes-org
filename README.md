# Theme Organization (Halo v2)

## 主题简介

本主题用于 Halo v2 社团/组织官网，重点面向内容展示与插件能力扩展，采用 Halo 官方主题模板（Thymeleaf），不引入重型前端框架。

## 兼容性

- Halo：>= 2.0.0（见 `theme.yaml` 的 `requires`）

## 本地开发（Docker）

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

## 构建与发布（Vite）

1. 安装依赖：

```bash
pnpm install
```

2. 构建资源：

```bash
pnpm run build
```

构建产物输出到：

- `templates/assets/build`

发布前请确保已执行构建（`templates/assets/build` 默认不提交）。

## 主题配置入口

- `settings.yaml`：主题设置表单（全局、样式、首页、分类页、页脚等）
- `annotation-setting.yaml`：文章/分类自定义字段（如日程日期、分类介绍）

## 插件适配

插件清单与适配说明见 `plugins.md`，主题已内置以下插件的适配点或样式变量：

- Docsme（文档站）：`plugin:plugin-docsme`，模板包含可用性兜底
- 搜索组件：`PluginSearchWidget`
- 链接管理：`PluginLinks`
- 评论组件：`PluginCommentWidget`
- 联系表单：`PluginContactForm`
- Shiki 代码高亮：`shiki`
- 编辑器超链接卡片：`editor-hyperlink-card`

如果插件未安装，模板会通过 `pluginFinder.available(...)` 进行兜底处理。

## 结构说明

- `templates/modules/base-head.html` 引入 `build/main.css` 与 `build/main.js`
- 页面模板按需引入 `build/page-*.css` 与 `build/page-*.js`
- 开发时可执行 `pnpm run build:watch` 监听 `src/` 变化
