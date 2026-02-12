# Theme Organization (Halo v2)

## 主题简介

本主题用于 Halo v2 社团/组织官网，重点是内容展示与插件能力适配。  
技术路线为 Halo 官方主题模板（Thymeleaf）+ 原生 JS/Vite，不使用前后端分离。

## 兼容性

- Halo：`>= 2.22.8`（以 `theme.yaml` 的 `spec.requires` 为准）
- Node.js：建议 18+
- 包管理器：pnpm

## 当前开发环境

- 使用 `halo-dev` 编排（不再使用本仓库内 Docker 开发方式）
- 主题目录：`themes/theme-organization`
- 本地访问：`http://localhost:8090`

## 常用命令

1. 安装依赖

```bash
pnpm install
```

2. 构建前端资源（仅构建，不打包）

```bash
pnpm run build
```

3. 监听构建

```bash
pnpm run build:watch
```

4. 主题打包

```bash
pnpm run package
```

## 打包规则（已更新）

`pnpm run package` 调用 `scripts/package.ps1`，当前逻辑如下：

1. 打包开始先读取 `theme.yaml` 中 `spec.version`。
2. 自动执行补丁位递增（`+0.0.1`）。
3. 默认执行 `pnpm run build` 构建资源。
4. 打包输出到 `build/` 目录。
5. 产物命名：`<themeName>-<version>.zip`，例如 `theme-organization-1.0.13.zip`。

可选：跳过构建

```bash
powershell -ExecutionPolicy Bypass -File scripts/package.ps1 -SkipBuild
```

## 模板与配置现状

1. 页面模板（`customTemplates.page`）当前包含：
- 加入我们：`page-join.html`
- 概括：`page-outline.html`
- 历史：`page-history.html`

2. “加入我们”已使用独立模板文件 `page-join.html`，避免与系统默认模板 `page.html` 语义冲突。

3. 默认页面模板 `templates/page.html` 已移除 `content-header`，仅渲染正文区域。

4. 首页为“配置驱动单页”：
- 在主题设置 `全局 -> 默认首页关联页面`（`settings.yaml` 中的 `home_page`）选择单页后，根路径 `/` 渲染该单页内容。

## 主题设置入口

- `settings.yaml`：主题设置（全局、样式、项目聚合页、动态分类页、页脚）
- `annotation-setting.yaml`：分类扩展字段设置

## 插件适配说明

插件可用性统一通过 `pluginFinder.available(...)` 做兜底判断。  
插件适配清单见 `plugins.md`。

## 目录说明

- `templates/modules/base-head.html`：全局资源入口（`build/main.css` / `build/main.js`）
- `templates/*.html`：页面模板
- `src/`：样式与脚本源码
- `templates/assets/build/`：Vite 构建产物
- `scripts/package.ps1`：主题打包脚本
