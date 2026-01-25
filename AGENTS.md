# Instructions
- 所有回复使用简体中文，语气简洁直接。
- 需要列出方案或步骤时使用列表，信息优先于修辞。
- 不确定时先提问再行动，避免臆测。
- 读取和写入文件默认使用 UTF-8 编码。
- 所有涉及较大代码量的修改进行完成后，使用Chrome MCP进行访问验证。

# 项目目标与范围
- 本仓库为 Halo v2 主题（社团/组织官网），优先服务“内容展示 + 插件能力”。
- 重点是主题层适配与统一视觉，不做前后端分离，不引入 Vue/React 全家桶。
- 登录页使用 Halo 自带页面。

# 技术选型与约定
- 模板：Halo v2 主题模板（Thymeleaf），按官方规范组织模板与静态资源。
- 交互：原生 JS 或轻量 Alpine.js 增强；避免复杂 SPA。
- 构建：允许引入 Vite 等前端构建工具，但需要在 README 中更新使用说明。
- 样式：统一设计令牌（CSS Variables）；支持明暗模式与移动端优先的响应式布局。

# 插件适配原则（必须遵循）
- 插件入口用 `pluginFinder.available(...)` 判定可用性，不可假设插件已安装。
- 插件调用走其公开 API（如 `SearchWidget.open()`），不改插件内部代码。
- 插件样式用其提供的 CSS 变量做主题统一；与主题色/字体/圆角保持一致。
- 若缺少插件文档或代码片段，先向用户索取再实现。

# 站点结构（主菜单）
- URL：http://localhost:8090
- 首页：/
- 社团概况：/about
  - 社团概况：/about（自定义页面，使用 默认 模板）
  - 社团历史：/history（自定义页面，使用 默认 模板）
  - 友情链接：/links（由 链接管理 插件实现具体功能）
- 项目介绍：/categories/projects（分类页，使用 项目分类介绍页 模板）
  - 智慧实验室：/categories/smart-lab（分类页，使用 单项目归档介绍页 模板）
  - 水下机器人：/categories/underwater（分类页，使用 单项目归档介绍页 模板）
- 社团动态：/categories/news（分类页，使用 动态分类页 模板）
- 加入我们：/join（自定义页面，使用 默认 模板）
- 社团文档：/docs（由 Docsme 插件实现具体功能）
  - 工作手册：/docs/manual（由 Docsme 插件实现具体功能）
  - 社团制度：/docs/regulations（由 Docsme 插件实现具体功能）

# 质量与一致性
- 明暗模式：默认跟随系统，可在主题设置中切换并持久化。
- 多端适配：通过判断屏幕分辨率与横纵比例实现多端样式切断。
- 文案与导航结构：集中在主题设置或模板配置中，避免散落硬编码。
- Release 流程：更新 `theme.yaml` 的 `spec.version` → 运行 `scripts/package.ps1` 生成 `theme-organization.zip` → 创建 Release 并上传 zip → 发布前向用户确认标题与说明。
