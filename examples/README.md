# 示例项目总览

本目录包含分形多级索引系统在不同 AI 编辑器平台的完整示例项目。

---

## 📂 示例列表

### 1. [Cursor 示例](cursor-example/)

**平台**: Cursor (https://cursor.sh)

**特点**:
- ✅ 完整的 TypeScript 项目结构
- ✅ 经典三层架构（Controllers/Services/Models）
- ✅ 详细的配置说明和测试场景
- ✅ 包含实际可运行的代码示例

**适合**:
- Cursor 用户
- 想深入了解索引系统的开发者
- 需要参考完整配置的用户

**快速开始**:
```bash
cd cursor-example
# 在 Cursor 中打开项目
cursor .
```

---

### 2. [Windsurf 示例](windsurf-example/)

**平台**: Windsurf

**特点**:
- ✅ 与 Cursor 示例相同的项目结构
- ✅ 适配 Windsurf 的配置目录（`.windsurf/`）
- ✅ 简化的 README，重点说明与 Cursor 的差异

**适合**:
- Windsurf 用户
- 从 Cursor 迁移的用户

**快速开始**:
```bash
cd windsurf-example
# 在 Windsurf 中打开项目
```

---

### 3. [Kiro 示例](kiro-example/)

**平台**: Kiro

**特点**:
- ✅ 与 Cursor 示例相同的项目结构
- ✅ 适配 Kiro 的配置目录（`.kiro/`）
- ✅ 简化的 README，重点说明与 Cursor 的差异

**适合**:
- Kiro 用户
- 从 Cursor 迁移的用户

**快速开始**:
```bash
cd kiro-example
# 在 Kiro 中打开项目
```

---

## 🎯 示例项目结构

所有示例项目都包含相同的代码结构：

```
example-project/
├── .{platform}/              # 平台配置目录
│   ├── rules/
│   │   └── doc-maintenance.md
│   └── index-config.json
├── .{platform}rules          # 全局规则文件
├── src/
│   ├── controllers/          # API 层
│   │   ├── FOLDER_INDEX.md
│   │   ├── user.controller.ts
│   │   └── auth.controller.ts
│   ├── services/             # 业务层
│   │   ├── FOLDER_INDEX.md
│   │   ├── user.service.ts
│   │   └── auth.service.ts
│   ├── models/               # 数据层
│   │   ├── FOLDER_INDEX.md
│   │   └── User.ts
│   └── utils/                # 工具层
│       ├── FOLDER_INDEX.md
│       └── logger.ts
├── PROJECT_INDEX.md          # 项目根索引
└── README.md                 # 项目说明
```

**说明**:
- `{platform}` = `cursor` | `windsurf` | `kiro`

---

## 🧪 测试场景

每个示例项目都可以测试以下场景：

### 场景 1: 初始化索引

虽然示例已包含生成的索引，你可以：

1. 删除所有索引文件
2. 在 AI 编辑器中运行初始化命令
3. 验证生成的索引是否正确

### 场景 2: 添加新依赖

修改 `src/services/user.service.ts`，添加：

```typescript
import { EmailService } from './email.service';
```

期望：AI 应该更新文件头注释和相关索引。

### 场景 3: 创建新文件

在 `src/services/` 中创建 `email.service.ts`

期望：AI 应该：
1. 为新文件添加文件头注释
2. 更新 `FOLDER_INDEX.md`
3. 更新 `PROJECT_INDEX.md`

### 场景 4: 修改实现细节

修改 `user.service.ts` 中某个方法的实现（不改变签名）

期望：AI 不应该更新索引（因为不是结构性变更）

### 场景 5: 检查一致性

手动删除某个 `FOLDER_INDEX.md`，然后运行检查命令

期望：AI 应该检测到缺失并报告

---

## 📊 代码示例说明

### 文件头注释

所有代码文件都包含标准的文件头注释：

```typescript
/**
 * Input: 依赖列表
 * Output: 导出列表
 * Pos: 系统定位描述
 *
 * 🔄 Self-reference: 自指性声明
 */
```

**作用**:
- **Input**: 帮助理解模块依赖
- **Output**: 帮助理解模块提供的功能
- **Pos**: 帮助理解模块在系统中的位置
- **Self-reference**: 声明"当我变化时，更新我"

### FOLDER_INDEX

每个文件夹都包含索引文件：

```markdown
## 📁 folder-name/

**架构说明** (3行)

**文件清单**

🔄 **自指**: 自指性声明
```

**作用**:
- 提供文件夹级别的概览
- 列出所有文件及其简要说明
- 声明自引用关系

### PROJECT_INDEX

项目根目录的索引：

```markdown
# 项目索引

## 项目概览
## 目录结构
## 依赖关系图 (Mermaid)
## 文件清单
```

**作用**:
- 项目架构的全局视图
- 可视化的依赖关系图
- 完整的文件清单和导航

---

## 🔄 平台差异对比

| 特性 | Cursor | Windsurf | Kiro |
|------|--------|----------|------|
| 配置目录 | `.cursor/` | `.windsurf/` | `.kiro/` |
| 全局规则 | `.cursorrules` | `.windsurfrules` | `.kirorules` |
| 自动化级别 | 半自动 | 半自动 | 半自动 |
| 规则文件格式 | Markdown | Markdown | Markdown |
| @文件引用 | 支持 | 支持 | 支持 |

**核心逻辑完全相同**，只是配置文件位置不同。

---

## 🚀 如何使用示例

### 步骤 1: 选择平台

根据你使用的 AI 编辑器选择对应的示例：

- 使用 Cursor → [cursor-example](cursor-example/)
- 使用 Windsurf → [windsurf-example](windsurf-example/)
- 使用 Kiro → [kiro-example](kiro-example/)

### 步骤 2: 打开项目

在对应的编辑器中打开示例项目。

### 步骤 3: 查看配置

阅读以下文件了解配置：

1. `.{platform}rules` - 全局规则
2. `.{platform}/rules/doc-maintenance.md` - 详细规则
3. `README.md` - 使用说明

### 步骤 4: 测试功能

按照 [测试场景](#测试场景) 部分测试各项功能。

### 步骤 5: 应用到实际项目

理解示例后，将配置应用到你的实际项目：

1. 复制 `.{platform}/` 目录到项目
2. 复制 `.{platform}rules` 文件到项目
3. 根据需要调整配置
4. 运行初始化命令

---

## 💡 最佳实践

### 1. 从示例学习

- 仔细阅读每个文件的注释
- 理解三级索引的关系
- 观察依赖关系图的结构

### 2. 渐进式应用

- 先在小项目上测试
- 验证自动更新是否正常
- 逐步应用到大项目

### 3. 团队协作

- 与团队成员分享示例
- 建立统一的使用规范
- 定期检查索引一致性

---

## 📚 更多资源

- **[USE_CASES.md](../USE_CASES.md)** - 8 个真实应用案例
- **[DEMO_SCRIPT.md](../DEMO_SCRIPT.md)** - 演示录制脚本
- **[README.md](../README.md)** - 主项目文档

---

## 🤝 反馈与改进

如果你在使用示例时遇到问题：

1. 检查 AI 编辑器是否正确读取了配置
2. 查看 README 中的常见问题部分
3. 提交 Issue: https://github.com/Claudate/project-multilevel-index/issues

如果你有改进建议：

1. Fork 项目
2. 改进示例
3. 提交 PR

---

**开始探索示例项目，体验分形索引系统的魅力！** 🚀
