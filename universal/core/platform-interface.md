# 平台接口抽象 (Platform Interface Abstraction)

## 概述

此文档定义了平台无关的核心逻辑与平台特定适配器之间的接口契约。

通过清晰的接口定义,实现:
- 核心逻辑可在所有平台复用
- 适配器可独立开发和维护
- 新平台支持成本降至最低

## 核心架构

```
┌─────────────────────────────────────┐
│      用户界面 (Platform UI)        │
│   Claude Code | Cursor | Kiro...   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      平台适配器 (Adapter)           │
│  实现 PlatformInterface 接口        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  核心引擎 (Core Engine)             │
│  universal/core/generator/          │
│  universal/core/analyzer/           │
└─────────────────────────────────────┘
```

## 平台接口定义

每个平台适配器必须实现以下接口:

### 1. 文件操作接口

#### readFile(path)
**功能**: 读取文件内容

**输入参数**:
- `path` (string): 文件绝对路径

**返回值**:
- `content` (string): 文件内容
- `error` (object): 错误对象 (如果失败)

**实现要求**:
- Claude Code: 使用 Read 工具
- Cursor: 使用 Cursor API
- 其他: 使用平台特定的文件读取方法

#### writeFile(path, content)
**功能**: 写入文件内容 (创建新文件)

**输入参数**:
- `path` (string): 文件绝对路径
- `content` (string): 要写入的内容

**返回值**:
- `success` (boolean): 是否成功

**实现要求**:
- 必须支持创建新文件
- 如果目录不存在,自动创建
- Claude Code: 使用 Write 工具

#### editFile(path, oldString, newString)
**功能**: 编辑现有文件 (精确字符串替换)

**输入参数**:
- `path` (string): 文件绝对路径
- `oldString` (string): 要替换的旧文本
- `newString` (string): 新文本

**返回值**:
- `success` (boolean): 是否成功

**实现要求**:
- 精确匹配 oldString
- 保持文件其余部分不变
- Claude Code: 使用 Edit 工具

#### scanFiles(rootPath, patterns)
**功能**: 扫描文件系统,获取文件列表

**输入参数**:
- `rootPath` (string): 扫描根目录
- `patterns` (object): 包含和排除模式
  - `include` (array): 包含模式 (如 `["**/*.js"]`)
  - `exclude` (array): 排除模式 (如 `["node_modules/**"]`)

**返回值**:
- `files` (array): 文件路径列表
- `folders` (array): 文件夹路径列表

**实现要求**:
- 递归扫描目录
- 尊重 .gitignore 规则
- Claude Code: 使用 Glob 工具

---

### 2. 用户交互接口

#### askConfirmation(message)
**功能**: 询问用户 Yes/No 问题

**输入参数**:
- `message` (string): 提示消息

**返回值**:
- `confirmed` (boolean): 用户是否确认

**实现要求**:
- 阻塞执行直到用户回答
- 提供明确的 Yes/No 选项

#### showMessage(message, type)
**功能**: 向用户显示消息

**输入参数**:
- `message` (string): 消息内容
- `type` (string): 消息类型 (`info` | `success` | `warning` | `error`)

**返回值**: 无

**实现要求**:
- 使用平台适当的方式显示消息
- 支持多行消息
- 支持 Markdown 格式 (如果平台支持)

---

### 3. 配置管理接口

#### getProjectRoot()
**功能**: 获取项目根目录路径

**返回值**:
- `path` (string): 项目根目录绝对路径

**实现要求**:
- 返回当前工作目录
- 或用户选择的项目根目录

#### getLanguage()
**功能**: 获取用户语言设置

**返回值**:
- `language` (string): 语言代码 (`zh-CN` | `en-US`)

**实现要求**:
- 读取 `.claude/locale-config.json`
- 如果不存在,返回默认值 `zh-CN`

#### loadLanguageFiles(language)
**功能**: 加载语言文件

**输入参数**:
- `language` (string): 语言代码

**返回值**:
- `LANG` (object): 语言对象,结构如下:
  ```javascript
  {
    messages: { /* messages.json */ },
    skill: { /* skill.json */ },
    templates: { /* templates.json */ },
    hooks: { /* hooks.json */ }
  }
  ```

**实现要求**:
- 并行读取 4 个语言文件
- 解析 JSON
- 处理缺失文件错误

---

### 4. 平台能力查询接口

#### getPlatformCapabilities()
**功能**: 查询平台支持的能力

**返回值**:
- `capabilities` (object): 平台能力对象
  ```javascript
  {
    name: "Claude Code",
    fileReference: true,      // 支持文件引用
    autoTrigger: true,        // 支持自动触发
    hookSystem: true,         // 支持 Hook 系统
    batchOperations: true,    // 支持批量操作
    automationLevel: "full"   // full | semi_auto | manual
  }
  ```

#### generatePlatformConfig(targetPath, language)
**功能**: 生成平台特定的配置文件

**输入参数**:
- `targetPath` (string): 目标项目路径
- `language` (string): 语言代码

**返回值**:
- `configFiles` (array): 生成的配置文件路径列表

**实现要求**:
- 生成平台特定的配置文件
  - Claude Code: 已有 plugin.json, 跳过
  - Cursor: 生成 `.cursor/rules/`
  - Kiro: 生成 `.kiro/steering/`
  - 等等
- 嵌入自引用提醒
- 配置文件内容应符合平台规范

---

## 核心引擎调用示例

### 示例 1: 初始化索引系统

```markdown
# 在 universal/core/generator/init-workflow.md 中

**步骤 1: 获取项目根目录**
```
projectRoot = platform.getProjectRoot()
```

**步骤 2: 加载语言配置**
```
language = platform.getLanguage()
LANG = platform.loadLanguageFiles(language)
```

**步骤 3: 询问用户确认**
```
message = LANG.messages.commands.initIndex.confirmDirectory
          .replace("{directory}", projectRoot)
confirmed = platform.askConfirmation(message)

如果未确认，退出
```

**步骤 4: 扫描项目文件**
```
files = platform.scanFiles(projectRoot, {
  include: ["**/*.js", "**/*.py", ...],
  exclude: ["node_modules/**", "dist/**", ...]
})
```

**步骤 5: 分析每个文件**
```
对每个文件:
  content = platform.readFile(file)
  调用 universal/core/analyzer/dependency-parser.md
  调用 universal/core/analyzer/export-parser.md
  调用 universal/core/analyzer/position-inferrer.md

  结果: { input, output, pos }
```

**步骤 6: 生成文件头**
```
对每个文件:
  调用 universal/core/generator/file-header-gen.md
  headerComment = 生成的注释文本

  platform.editFile(file, 旧头部, headerComment)
  或 platform.writeFile(file, headerComment + content)
```

**步骤 7: 生成 FOLDER_INDEX**
```
对每个文件夹:
  调用 universal/core/generator/folder-index-gen.md
  indexContent = 生成的索引内容

  platform.writeFile(folder + "/FOLDER_INDEX.md", indexContent)
```

**步骤 8: 生成 PROJECT_INDEX**
```
调用 universal/core/generator/project-index-gen.md
indexContent = 生成的项目索引

platform.writeFile(projectRoot + "/PROJECT_INDEX.md", indexContent)
```

**步骤 9: 显示完成消息**
```
platform.showMessage(LANG.messages.commands.initIndex.complete, "success")
```
```

---

### 示例 2: 更新索引

```markdown
# 在 universal/core/generator/update-workflow.md 中

**输入参数**:
- changedFiles: 变更的文件列表
- changeType: 变更类型 (Structural / Header / Implementation)

**步骤 1: 过滤需要更新的文件**
```
如果 changeType == "Implementation":
  跳过更新，退出
```

**步骤 2: 分析变更**
```
对每个 changedFile:
  content = platform.readFile(changedFile)
  newAnalysis = 调用 analyzer/dependency-parser.md

  如果与现有头部不同:
    标记为需要更新
```

**步骤 3: 更新文件头**
```
对需要更新的文件:
  headerComment = 调用 generator/file-header-gen.md
  platform.editFile(file, 旧头部, headerComment)
```

**步骤 4: 更新 FOLDER_INDEX**
```
受影响的文件夹:
  indexContent = 调用 generator/folder-index-gen.md
  platform.editFile(folderIndexPath, 旧内容, 新内容)
```

**步骤 5: 更新 PROJECT_INDEX**
```
如果是结构性变更:
  indexContent = 调用 generator/project-index-gen.md
  platform.editFile(projectIndexPath, 旧内容, 新内容)
```

**步骤 6: 静默完成或通知用户**
```
如果是小规模更新:
  静默完成
否则:
  platform.showMessage("索引已更新", "info")
```
```

---

## 适配器实现指南

### 步骤 1: 创建适配器文件

在 `universal/adapters/{platform-name}/adapter.md` 创建适配器。

### 步骤 2: 实现所有接口方法

参考 `universal/adapters/claude-code/adapter.md` 作为示例。

### 步骤 3: 处理平台特殊情况

不同平台可能有不同的限制:
- **无文件引用能力**: 静态内联内容
- **无自动触发**: 依赖嵌入提醒
- **API 限制**: 批量操作、错误处理

### 步骤 4: 测试适配器

使用 `universal/adapters/_template/test-checklist.md` 验证:
- 所有接口方法正常工作
- 与核心引擎集成无误
- 用户体验符合预期

---

## 错误处理约定

### 1. 文件操作错误

```
如果 readFile 失败:
  返回 { error: "FileNotFound", message: "文件不存在" }

如果 writeFile 失败:
  返回 { error: "PermissionDenied", message: "无权限写入" }

如果 editFile 失败:
  返回 { error: "StringNotFound", message: "未找到匹配的字符串" }
```

### 2. 用户取消操作

```
如果用户在 askConfirmation 中选择 No:
  返回 { confirmed: false }
  核心引擎应优雅退出
```

### 3. 配置缺失

```
如果语言文件不存在:
  回退到默认语言 (zh-CN)
  记录警告但继续执行
```

---

## 性能优化建议

### 1. 批量操作

```
优先使用批量读取/写入:
- 不要: 循环调用 readFile 100 次
- 推荐: 使用 platform.readFiles([path1, path2, ...])
```

### 2. 并行执行

```
文件分析可以并行:
- 读取文件: 并行
- 分析依赖: 并行
- 写入文件: 串行 (避免冲突)
```

### 3. 增量更新

```
仅更新变化的部分:
- 检查文件是否真的需要更新
- 使用 editFile 而非 writeFile (保留内容)
- 跳过没有变化的 FOLDER_INDEX
```

---

## 总结

通过实现 PlatformInterface 定义的方法,任何平台都可以接入分形索引系统的核心引擎。

**关键原则**:
- 接口清晰,职责分离
- 核心逻辑平台无关
- 适配器处理平台特殊性
- 错误处理一致

**下一步**:
1. 阅读 `universal/adapters/claude-code/adapter.md` 查看完整实现
2. 阅读 `universal/core/generator/init-workflow.md` 了解核心流程
3. 参考 `universal/adapters/_template/` 创建新适配器
