# Kiro 平台适配器

## 平台信息

**平台名称**: Kiro

**官方网站**: https://kirocode.com

**自动化级别**: `semi_auto` (半自动化)

**触发机制**: `spec_driven + file_reference` (Spec 驱动 + 文件引用)

**配置位置**: `.kiro/`, `.kiro/specs/`, `.kiro/steering/`

**文件引用语法**: `#[[file:path/to/file]]` (强大的文件引用能力)

---

## 平台能力

### 优势特性

✅ **Spec 系统** - 强大的规范驱动开发能力

✅ **文件引用** - `#[[file:path]]` 语法可以引用和嵌入文件

✅ **Steering 文件** - `.kiro/steering/` 提供持久化指导

✅ **YAML Spec** - 结构化的规范文件支持

✅ **上下文理解** - AI 深度理解 Spec 内容

✅ **多文件操作** - 支持批量文件生成和编辑

### 限制

⚠️ **无 Hook 系统** - 不能自动监听文件变化

⚠️ **依赖 AI 理解** - 需要 AI 理解并执行 Spec

⚠️ **手动触发** - 用户需要提醒 AI 执行更新

⚠️ **相对小众** - 用户基数较小,社区资源有限

---

## 适配策略

### 方案: Spec + Steering + File Reference

```
.kiro/
├── specs/
│   ├── index-system.yml        ← Spec 定义索引系统规范
│   └── file-patterns.yml       ← 文件模式配置
└── steering/
    ├── doc-maintenance.md      ← 核心维护指导
    └── quick-reference.md      ← 快速参考卡片
```

**工作流程**:
1. 用户修改代码文件
2. AI 读取 `.kiro/specs/index-system.yml`
3. AI 读取 `.kiro/steering/doc-maintenance.md`
4. 通过 `#[[file:...]]` 引用 Universal 核心文件
5. AI 理解并执行索引更新

**优势**:
- Spec 提供结构化定义
- Steering 提供持久化指导
- File reference 避免重复,直接引用 Universal 核心

---

## 接口实现

此适配器实现 [platform-interface.md](../../core/platform-interface.md) 定义的接口方法。

---

### 1. 文件操作接口

#### readFile(path)

**实现方式**: 使用 Kiro 的文件引用能力

**Prompt 模板**:
```markdown
读取文件: #[[file:{path}]]

返回完整内容。
```

**Kiro 特性**: `#[[file:path]]` 会自动嵌入文件内容

**代码示例**:
```typescript
async function readFile(path: string): Promise<string> {
  // Kiro 环境下,使用文件引用语法
  const prompt = `读取文件: #[[file:${path}]]\n\n返回完整内容。`;
  return await askAI(prompt);
  // Kiro 会自动将 #[[file:...]] 替换为实际内容
}
```

---

#### writeFile(path, content)

**实现方式**: 使用 Kiro 的文件生成能力

**Prompt 模板**:
```markdown
创建文件: {path}

内容:
\`\`\`
{content}
\`\`\`

请生成此文件。
```

**代码示例**:
```typescript
async function writeFile(path: string, content: string): Promise<void> {
  const prompt = `创建文件: ${path}\n\n内容:\n\`\`\`\n${content}\n\`\`\`\n\n请生成此文件。`;
  await askAI(prompt);
}
```

---

#### editFile(path, oldString, newString)

**实现方式**: 结合文件引用和编辑指令

**Prompt 模板**:
```markdown
编辑文件: #[[file:{path}]]

将以下内容:
\`\`\`
{oldString}
\`\`\`

替换为:
\`\`\`
{newString}
\`\`\`

请执行替换。
```

**代码示例**:
```typescript
async function editFile(
  path: string,
  oldString: string,
  newString: string
): Promise<void> {
  const prompt = `编辑文件: #[[file:${path}]]\n\n` +
    `将以下内容:\n\`\`\`\n${oldString}\n\`\`\`\n\n` +
    `替换为:\n\`\`\`\n${newString}\n\`\`\`\n\n` +
    `请执行替换。`;
  await askAI(prompt);
}
```

---

### 2. 文件系统接口

#### scanFiles(rootPath, patterns)

**实现方式**: 通过 AI 执行文件系统扫描

**Prompt 模板**:
```markdown
扫描目录: {rootPath}

包含模式: {includePatterns}
排除模式: {excludePatterns}

返回匹配的文件路径列表(JSON 格式)。
```

**代码示例**:
```typescript
async function scanFiles(
  rootPath: string,
  patterns: {
    include: string[];
    exclude: string[];
  }
): Promise<string[]> {
  const prompt = `扫描目录: ${rootPath}\n\n` +
    `包含模式: ${patterns.include.join(', ')}\n` +
    `排除模式: ${patterns.exclude.join(', ')}\n\n` +
    `返回匹配的文件路径列表(JSON 格式)。`;
  const result = await askAI(prompt);
  return JSON.parse(result);
}
```

---

#### getProjectRoot()

**实现方式**: 读取 `.kiro` 目录位置

**代码示例**:
```typescript
function getProjectRoot(): string {
  // Kiro 项目根目录包含 .kiro/ 文件夹
  return findKiroRoot() || process.cwd();
}

function findKiroRoot(): string | null {
  let dir = process.cwd();
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, '.kiro'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}
```

---

### 3. 用户交互接口

#### askConfirmation(message)

**实现方式**: 通过对话请求用户确认

**Prompt 模板**:
```markdown
{message}

请回答 Yes 或 No。
```

**代码示例**:
```typescript
async function askConfirmation(message: string): Promise<boolean> {
  const prompt = `${message}\n\n请回答 Yes 或 No。`;
  const response = await askAI(prompt);
  return response.toLowerCase().includes('yes');
}
```

---

#### showMessage(message, type)

**实现方式**: 在输出中使用 Emoji 和格式化

**代码示例**:
```typescript
function showMessage(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
  const prefixes = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  const formattedMessage = `${prefixes[type]} ${message}`;
  console.log(formattedMessage);
  // 也可以通过 AI 输出给用户
}
```

---

### 4. 国际化接口

#### getLanguage()

**实现方式**: 读取配置文件

**优先级**:
1. `.kiro/locale-config.json`
2. `.claude/locale-config.json`
3. 环境变量 `KIRO_LOCALE`
4. 默认 `zh-CN`

**代码示例**:
```typescript
async function getLanguage(): Promise<string> {
  // 优先级 1: Kiro 配置
  try {
    const config = await readFile('.kiro/locale-config.json');
    const parsed = JSON.parse(config);
    return parsed.language || 'zh-CN';
  } catch {}

  // 优先级 2: Claude 配置
  try {
    const config = await readFile('.claude/locale-config.json');
    const parsed = JSON.parse(config);
    return parsed.language || 'zh-CN';
  } catch {}

  // 优先级 3: 环境变量
  return process.env.KIRO_LOCALE || 'zh-CN';
}
```

---

#### loadLanguageFiles(lang)

**实现方式**: 使用 `#[[file:...]]` 引用语言文件

**Prompt 模板**:
```markdown
加载语言文件:

消息: #[[file:universal/locales/{lang}/messages.md]]
模板: #[[file:universal/locales/{lang}/templates.md]]

解析为 JSON 对象。
```

**代码示例**:
```typescript
async function loadLanguageFiles(lang: string): Promise<LanguageData> {
  const prompt = `加载语言文件:\n\n` +
    `消息: #[[file:universal/locales/${lang}/messages.md]]\n` +
    `模板: #[[file:universal/locales/${lang}/templates.md]]\n\n` +
    `解析为 JSON 对象。`;

  const result = await askAI(prompt);
  return JSON.parse(result);
}
```

---

### 5. 平台特定接口

#### generatePlatformConfig(targetPath, language)

**功能**: 生成 Kiro Spec 和 Steering 文件

**实现方式**: 创建 `.kiro/` 配置结构

**代码示例**:
```typescript
async function generatePlatformConfig(
  targetPath: string,
  language: string
): Promise<void> {
  const kiroDir = path.join(targetPath, '.kiro');
  const specsDir = path.join(kiroDir, 'specs');
  const steeringDir = path.join(kiroDir, 'steering');

  // 创建目录
  await createDirectory(specsDir);
  await createDirectory(steeringDir);

  // 生成 Spec 文件
  const indexSpec = generateIndexSpec(language);
  await writeFile(
    path.join(specsDir, 'index-system.yml'),
    indexSpec
  );

  const filePatterns = generateFilePatterns();
  await writeFile(
    path.join(specsDir, 'file-patterns.yml'),
    filePatterns
  );

  // 生成 Steering 文件
  const docMaintenance = generateDocMaintenance(language);
  await writeFile(
    path.join(steeringDir, 'doc-maintenance.md'),
    docMaintenance
  );

  const quickRef = generateQuickReference(language);
  await writeFile(
    path.join(steeringDir, 'quick-reference.md'),
    quickRef
  );
}
```

---

#### enableAutoTrigger()

**功能**: 启用自动触发提醒

**实现方式**: 在 Steering 文件中添加强提醒

**代码示例**:
```typescript
async function enableAutoTrigger(): Promise<void> {
  const autoTriggerSteering = `
# 🔄 自动索引维护提醒

**重要约定**: 每次修改代码文件后，主动执行以下检查:

1. **读取规范**: #[[file:.kiro/specs/index-system.yml]]
2. **应用规则**: 判断是否为结构性变更
3. **执行更新**: 如果需要,调用更新流程
4. **保持静默**: 小改动不打断用户

**这是项目核心约定,请严格遵守!**
`;

  await writeFile('.kiro/steering/auto-trigger.md', autoTriggerSteering);

  showMessage(
    '已生成自动触发提醒。Kiro AI 应主动理解并执行。',
    'success'
  );
}
```

---

## 配置文件模板

### .kiro/specs/index-system.yml

Spec 文件定义索引系统的规范和行为。

**内容**:
```yaml
name: project-multilevel-index
version: 1.0.0
description: 分形多级索引系统 - 自动维护项目文档

# 核心概念
concepts:
  - name: 三级索引结构
    description: PROJECT_INDEX → FOLDER_INDEX → File Header
    reference: "#[[file:universal/core/concepts.md]]"

  - name: 自相似性
    description: 每个层级都有相同的索引结构
    inspired_by: 哥德尔、埃舍尔、巴赫 (GEB)

  - name: 自指性
    description: 每个文档都声明"当我变化时,更新我"

# 触发条件
triggers:
  - event: file_created
    action: full_update
  - event: file_modified
    condition: structural_change
    action: full_update
  - event: file_modified
    condition: implementation_change
    action: none
  - event: file_deleted
    action: full_update

# 结构性变更判断
structural_change_keywords:
  dependencies:
    - import
    - require
    - use
    - from
    - "#include"
    - using
  exports:
    - export
    - public
    - class
    - interface
    - function
    - def
    - fn
    - async
    - struct

# 文件过滤规则
filters:
  exclude_files:
    - PROJECT_INDEX.md
    - FOLDER_INDEX.md
  exclude_dirs:
    - node_modules
    - .git
    - dist
    - build
    - .next
    - target
    - vendor
    - __pycache__
    - .cache
    - coverage
  allowed_extensions:
    - .js
    - .jsx
    - .ts
    - .tsx
    - .py
    - .java
    - .kt
    - .rs
    - .go
    - .cpp
    - .c
    - .h
    - .php
    - .rb
    - .swift
    - .cs
  max_file_size: 524288 # 500KB

# 更新流程
workflows:
  init:
    reference: "#[[file:universal/core/generator/init-workflow.md]]"
    steps:
      - scan_files
      - analyze_dependencies
      - generate_file_headers
      - generate_folder_indexes
      - generate_project_index
      - generate_mermaid_graph

  update:
    reference: "#[[file:universal/core/generator/update-workflow.md]]"
    steps:
      - detect_changes
      - analyze_dependencies
      - update_file_header
      - update_folder_index
      - update_project_index

  check:
    reference: "#[[file:universal/core/generator/check-workflow.md]]"
    steps:
      - verify_file_headers
      - verify_folder_indexes
      - verify_project_index
      - detect_circular_dependencies
      - generate_report

# 分析器引用
analyzers:
  dependency_parser:
    reference: "#[[file:universal/core/analyzer/dependency-parser.md]]"
  export_parser:
    reference: "#[[file:universal/core/analyzer/export-parser.md]]"
  position_inferrer:
    reference: "#[[file:universal/core/analyzer/position-inferrer.md]]"

# 国际化
i18n:
  default_language: zh-CN
  supported_languages:
    - zh-CN
    - en-US
  language_files:
    zh-CN:
      messages: "#[[file:universal/locales/zh-CN/messages.md]]"
      templates: "#[[file:universal/locales/zh-CN/templates.md]]"
    en-US:
      messages: "#[[file:universal/locales/en-US/messages.md]]"
      templates: "#[[file:universal/locales/en-US/templates.md]]"

# 输出设置
output:
  silent_mode: true
  only_notify_on:
    - initialization
    - major_changes # 10+ files
    - errors
  log_level: info
```

---

### .kiro/specs/file-patterns.yml

定义文件模式和分类。

**内容**:
```yaml
# 编程语言配置
languages:
  javascript:
    extensions: [.js, .jsx]
    comment_style: //
    layer_detection:
      - pattern: "controller"
        layer: "Controller Layer"
      - pattern: "service"
        layer: "Service Layer"
      - pattern: "model"
        layer: "Model Layer"

  typescript:
    extensions: [.ts, .tsx]
    comment_style: //
    layer_detection:
      - pattern: "controller"
        layer: "Controller Layer"
      - pattern: "service"
        layer: "Service Layer"
      - pattern: "model"
        layer: "Model Layer"

  python:
    extensions: [.py]
    comment_style: "#"
    layer_detection:
      - pattern: "view"
        layer: "View Layer"
      - pattern: "service"
        layer: "Service Layer"
      - pattern: "model"
        layer: "Model Layer"

  java:
    extensions: [.java]
    comment_style: //
    layer_detection:
      - pattern: "controller"
        layer: "Controller Layer"
      - pattern: "service"
        layer: "Service Layer"
      - pattern: "repository"
        layer: "Repository Layer"

# 目录模式
directory_patterns:
  - pattern: "**/controllers/**"
    layer: "Controller Layer"
    description: "处理 HTTP 请求和响应"

  - pattern: "**/services/**"
    layer: "Service Layer"
    description: "业务逻辑层"

  - pattern: "**/models/**"
    layer: "Model Layer"
    description: "数据模型定义"

  - pattern: "**/utils/**"
    layer: "Utility Layer"
    description: "通用工具函数"

  - pattern: "**/api/**"
    layer: "API Layer"
    description: "API 端点定义"
```

---

### .kiro/steering/doc-maintenance.md

持久化指导文件,告诉 Kiro AI 如何维护索引。

**内容**:
```markdown
# 文档自动维护指导 (Kiro)

## 🎯 你的职责

作为 Kiro AI,你负责在用户修改代码时,**主动维护**项目的分形索引系统。

---

## 📖 理解系统

首先,读取并理解索引系统的规范:

#[[file:.kiro/specs/index-system.yml]]

关键点:
- **三级索引**: PROJECT_INDEX → FOLDER_INDEX → File Header
- **自指性**: 每个文档声明"当我变化时,更新我"
- **结构性变更**: import/export 变化才触发更新

---

## 🔄 执行流程

### 当用户修改代码文件时

1. **应用过滤规则** (参考 Spec 中的 `filters`)
   - 跳过索引文件自身
   - 跳过非代码文件
   - 跳过排除目录

2. **判断变更类型** (参考 Spec 中的 `structural_change_keywords`)
   - 包含 import/export → Structural Change → 执行更新
   - 仅实现细节变化 → Implementation Change → 跳过

3. **执行更新** (如果是 Structural Change)
   - 调用更新工作流: #[[file:universal/core/generator/update-workflow.md]]
   - 使用分析器:
     - #[[file:universal/core/analyzer/dependency-parser.md]]
     - #[[file:universal/core/analyzer/export-parser.md]]
     - #[[file:universal/core/analyzer/position-inferrer.md]]

4. **静默处理**
   - 小改动: 不打断用户
   - 重大变更 (10+ 文件): 输出一行提示

---

## 🌍 国际化

读取用户语言设置:
- 配置文件: `.kiro/locale-config.json` 或 `.claude/locale-config.json`
- 加载对应语言文件 (参考 Spec 中的 `i18n`)

---

## 🎨 输出风格

- ✅ 简洁明了
- ✅ 使用 Emoji (✅ ❌ ⚠️ ℹ️)
- ✅ 静默处理小改动
- ❌ 不输出冗长日志
- ❌ 不打断用户工作流

---

## 📦 完整示例

用户修改了 `src/services/user.service.ts`:
```diff
+ import { EmailService } from './email.service';
```

**你的执行流程**:

1. **检测**: 包含 `import` 关键字 → Structural Change
2. **分析**:
   - 读取文件: #[[file:src/services/user.service.ts]]
   - 分析依赖: User, Logger, EmailService
   - 分析导出: UserService, createUser, findById
3. **更新**:
   - 更新文件头注释
   - 更新 `src/services/FOLDER_INDEX.md`
   - 更新 `PROJECT_INDEX.md`
4. **输出**: `✅ 索引已更新: user.service.ts`

---

## 🔗 关键文件引用

**核心工作流**:
- 初始化: #[[file:universal/core/generator/init-workflow.md]]
- 更新: #[[file:universal/core/generator/update-workflow.md]]
- 检查: #[[file:universal/core/generator/check-workflow.md]]

**分析器**:
- 依赖分析: #[[file:universal/core/analyzer/dependency-parser.md]]
- 导出分析: #[[file:universal/core/analyzer/export-parser.md]]
- 位置推断: #[[file:universal/core/analyzer/position-inferrer.md]]

**语言文件** (根据配置加载):
- 中文: #[[file:universal/locales/zh-CN/messages.md]]
- 英文: #[[file:universal/locales/en-US/messages.md]]

---

**记住**: 这是一个持久化约定,每次会话都要遵守!
```

---

### .kiro/steering/quick-reference.md

快速参考卡片,方便 AI 快速查阅。

**内容**:
```markdown
# 索引系统快速参考 (Kiro)

## 🚦 变更判断

### Structural Change (需更新)
关键字: `import`, `require`, `export`, `class`, `function`, `def`

### Implementation Change (跳过)
仅修改函数体、注释、格式

## 🎯 更新范围

### Full Update
- 文件头注释
- FOLDER_INDEX.md
- PROJECT_INDEX.md

### None
- 跳过更新

## 📁 文件引用

- Spec: `#[[file:.kiro/specs/index-system.yml]]`
- 更新流程: `#[[file:universal/core/generator/update-workflow.md]]`
- 依赖分析: `#[[file:universal/core/analyzer/dependency-parser.md]]`

## 🌍 语言切换

- 配置: `.kiro/locale-config.json`
- 中文: `#[[file:universal/locales/zh-CN/messages.md]]`
- 英文: `#[[file:universal/locales/en-US/messages.md]]`

## 🎨 输出

- 小改动: 静默处理
- 大改动: `✅ 索引已更新: 12 个文件`
- 错误: `❌ 更新失败: 权限不足`
```

---

## 使用指南

### 安装步骤

#### 1. 生成 Kiro 配置

在 Kiro 中执行:
```
用户: "请为本项目生成索引系统配置"
```

AI 将:
1. 调用 `universal/adapters/kiro/adapter.md`
2. 生成 `.kiro/specs/` Spec 文件
3. 生成 `.kiro/steering/` Steering 文件

#### 2. 验证配置

```bash
# 检查生成的文件
ls -la .kiro/specs/
ls -la .kiro/steering/

# 应该看到:
# .kiro/specs/index-system.yml
# .kiro/specs/file-patterns.yml
# .kiro/steering/doc-maintenance.md
# .kiro/steering/quick-reference.md
```

---

### 初始化索引

**方法 1: 直接请求**
```
用户: "请初始化项目索引系统"
```

**方法 2: 引用 Spec**
```
用户: "按照 Spec #[[file:.kiro/specs/index-system.yml]] 初始化索引"
```

**执行流程**:
```
AI 读取 .kiro/specs/index-system.yml
  ↓
引用 workflows.init 中的流程
  ↓
调用 #[[file:universal/core/generator/init-workflow.md]]
  ↓
执行初始化...
```

---

### 日常使用

#### 自动触发 (理想情况)

```
用户修改代码文件 (添加 import)
  ↓
AI 读取 .kiro/steering/doc-maintenance.md
  ↓
AI 理解持久化约定
  ↓
AI 主动检测变更
  ↓
AI 调用更新流程
  ↓
静默完成更新
```

#### 手动提醒 (实际情况)

```
用户: "我改了 user.service.ts, 请更新索引"
```

或使用 Spec 引用:
```
用户: "按照 Spec 更新索引"
```

---

### 更新索引

**触发方式**:

1. **AI 主动** (Kiro 的强项)
   - Steering 文件提供持久化指导
   - AI 在每次会话都会理解约定
   - 主动执行更新

2. **用户提醒**
   ```
   "请更新索引"
   "按照 Spec 检查并更新文档"
   "我修改了代码,维护一下索引系统"
   ```

**执行流程**:
```
读取 Steering 文件
  ↓
读取 Spec 文件
  ↓
通过 #[[file:...]] 引用 Universal 核心
  ↓
执行更新工作流
  ↓
输出结果
```

---

### 检查索引一致性

**命令**:
```
用户: "检查索引系统的一致性"
```

或引用 Spec:
```
用户: "执行 Spec 中定义的 check 工作流"
```

**执行**:
```
AI 读取 #[[file:.kiro/specs/index-system.yml]]
  ↓
找到 workflows.check
  ↓
调用 #[[file:universal/core/generator/check-workflow.md]]
  ↓
生成检查报告
```

---

## 平台优势

### 优势 1: 文件引用能力强大

**示例**:
```markdown
# 在 Steering 文件中引用核心逻辑
更新流程: #[[file:universal/core/generator/update-workflow.md]]

Kiro 会自动嵌入文件内容,无需手动复制!
```

**好处**:
- 避免重复
- 保持同步
- 简化维护

---

### 优势 2: Spec 提供结构化定义

**示例**:
```yaml
# .kiro/specs/index-system.yml
triggers:
  - event: file_modified
    condition: structural_change
    action: full_update
```

**好处**:
- 清晰的规范
- 易于理解
- 便于维护

---

### 优势 3: Steering 提供持久化指导

**特点**:
- Steering 文件在每次会话都会被读取
- AI 会"记住"项目约定
- 减少用户提醒次数

---

## 平台限制与变通

### 限制 1: 无法真正自动触发

**影响**: 仍需 AI 理解或用户提醒

**变通方案**:
1. **强 Steering**: 明确的持久化指导
2. **Spec 驱动**: 结构化的规范定义
3. **文件引用**: 减少手动维护

---

### 限制 2: 用户基数较小

**影响**: 社区资源和示例较少

**变通方案**:
1. **详细文档**: 提供完整的使用指南
2. **示例项目**: 创建参考实现
3. **模板齐全**: Spec 和 Steering 模板完整

---

## 测试清单

### 功能测试
- [ ] 生成 Spec 和 Steering 文件
- [ ] 初始化索引成功
- [ ] 手动更新成功
- [ ] AI 主动更新 (如果可能)
- [ ] 文件引用 `#[[file:...]]` 正常工作
- [ ] 检查功能正常
- [ ] 国际化切换正常

### Kiro 特性测试
- [ ] Spec YAML 格式正确
- [ ] Steering 文件被 AI 理解
- [ ] 文件引用语法有效
- [ ] 持久化约定生效

---

## 常见问题

### Q: #[[file:...]] 语法失效怎么办?

**A**:
1. 检查路径是否正确 (相对于项目根目录)
2. 尝试使用绝对路径
3. 如果仍失效,回退到静态内联方式

---

### Q: AI 没有理解 Steering 文件怎么办?

**A**:
1. 在对话开始时明确引用: "请读取 .kiro/steering/doc-maintenance.md"
2. 使用更明确的 Spec 引用
3. 手动提醒 AI 执行约定

---

### Q: Kiro 与 Cursor 哪个更好?

**A**:
- **Kiro 优势**: 文件引用强大,Spec 系统结构化,Steering 持久化
- **Cursor 优势**: 用户基数大,社区活跃,兼容 VSCode
- **建议**: 根据团队使用的平台选择

---

## 最佳实践

### 1. 充分利用文件引用
```yaml
# Spec 文件中引用 Universal 核心
workflows:
  update:
    reference: "#[[file:universal/core/generator/update-workflow.md]]"
```

### 2. Spec 和 Steering 配合使用
- Spec: 定义"是什么"
- Steering: 指导"怎么做"

### 3. 持久化约定
- 将关键约定写入 Steering
- AI 每次会话都会读取
- 减少重复提醒

---

## 示例项目

参考: `examples/kiro-example/`

包含:
- 完整的 `.kiro/specs/` 配置
- 完整的 `.kiro/steering/` 指导
- 示例代码文件
- 使用演示

---

## 版本历史

### v1.0.0 (2025-12-23)
- ✅ Kiro 适配器实现
- ✅ Spec + Steering 架构
- ✅ 文件引用支持
- ✅ 国际化支持

### 未来计划
- 🔧 优化 Spec 结构
- 🔧 增强 Steering 指导
- 🔧 更多示例项目

---

**下一步**: 参考 [使用指南](#使用指南) 开始使用
