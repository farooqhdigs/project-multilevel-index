# Claude Code 平台适配器

## 平台信息

**平台名称**: Claude Code

**自动化级别**: `full` (完全自动化)

**触发机制**: `hooks` (PostToolUse Hook)

**配置位置**: `.claude-plugin/`, `hooks/`

**文件引用语法**: `@path/to/file` 或直接路径

---

## 平台能力

### 优势特性

✅ **完整的工具集** - Read, Write, Edit, Glob, Grep 等原生工具

✅ **Hooks 系统** - 可自动监听文件变化并触发更新

✅ **插件市场** - 可通过 Marketplace 分发

✅ **批量操作** - 支持并行读取和写入多个文件

✅ **文件引用** - Skills 可引用其他 Markdown 文件

✅ **多语言支持** - 通过 locales/ 目录实现国际化

### 限制

⚠️ **仅 Claude Code 可用** - 依赖 Claude Code CLI 特定功能

⚠️ **需要安装插件** - 用户需要手动安装或通过 Marketplace

---

## 接口实现

此适配器实现 [platform-interface.md](../../core/platform-interface.md) 定义的所有接口方法。

---

### 1. 文件操作接口

#### readFile(path)

**实现方式**: 使用 Claude Code 的 `Read` 工具

```markdown
**功能**: 读取文件内容

**调用示例**:
使用 Read 工具读取文件 {path}

**返回处理**:
- 成功: 返回文件内容字符串
- 失败: 返回错误对象 { error: "FileNotFound", message: "..." }

**错误处理**:
如果文件不存在:
  返回 { error: "FileNotFound", message: "文件不存在: {path}" }

如果权限不足:
  返回 { error: "PermissionDenied", message: "无权限读取: {path}" }
```

**伪代码实现**:
```javascript
function readFile(path) {
  try {
    // 调用 Read 工具
    content = 使用 Read 工具({ file_path: path })

    return { success: true, content }
  } catch (error) {
    return {
      success: false,
      error: error.type || "ReadError",
      message: error.message
    }
  }
}
```

---

#### writeFile(path, content)

**实现方式**: 使用 Claude Code 的 `Write` 工具

```markdown
**功能**: 写入新文件或覆盖现有文件

**调用示例**:
使用 Write 工具写入文件 {path}
内容: {content}

**自动创建目录**:
如果父目录不存在,Write 工具会自动创建

**返回处理**:
- 成功: 返回 { success: true }
- 失败: 返回 { success: false, error: "...", message: "..." }
```

**伪代码实现**:
```javascript
function writeFile(path, content) {
  try {
    使用 Write 工具({
      file_path: path,
      content: content
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.type || "WriteError",
      message: error.message
    }
  }
}
```

---

#### editFile(path, oldString, newString)

**实现方式**: 使用 Claude Code 的 `Edit` 工具

```markdown
**功能**: 精确替换文件中的字符串

**调用示例**:
使用 Edit 工具编辑文件 {path}
将: {oldString}
替换为: {newString}

**要求**:
- oldString 必须在文件中精确存在
- 保持文件其余部分不变

**返回处理**:
- 成功: 返回 { success: true }
- 失败 (字符串未找到): 返回 { error: "StringNotFound", ... }
```

**伪代码实现**:
```javascript
function editFile(path, oldString, newString) {
  try {
    使用 Edit 工具({
      file_path: path,
      old_string: oldString,
      new_string: newString
    })

    return { success: true }
  } catch (error) {
    if (error.type == "StringNotFound") {
      return {
        success: false,
        error: "StringNotFound",
        message: `未找到匹配的字符串: ${oldString.substring(0, 50)}...`
      }
    }

    return {
      success: false,
      error: error.type || "EditError",
      message: error.message
    }
  }
}
```

---

#### scanFiles(rootPath, patterns)

**实现方式**: 使用 Claude Code 的 `Glob` 工具

```markdown
**功能**: 扫描文件系统,获取匹配的文件列表

**输入参数**:
- rootPath: 扫描根目录
- patterns: { include: [...], exclude: [...] }

**调用示例**:
对每个 include 模式:
  使用 Glob 工具({ pattern: pattern, path: rootPath })

对每个 exclude 模式:
  从结果中移除匹配的文件

**返回**:
{ files: [...], folders: [...] }
```

**伪代码实现**:
```javascript
function scanFiles(rootPath, patterns) {
  let allFiles = []

  // 对每个 include 模式执行 Glob
  for (let pattern of patterns.include) {
    try {
      result = 使用 Glob 工具({
        pattern: pattern,
        path: rootPath
      })

      allFiles.push(...result.files)
    } catch (error) {
      // 记录错误但继续
      console.warn(`Glob 失败: ${pattern}`)
    }
  }

  // 去重
  allFiles = Array.from(new Set(allFiles))

  // 应用 exclude 模式
  if (patterns.exclude) {
    for (let excludePattern of patterns.exclude) {
      allFiles = allFiles.filter(file => {
        return !matchPattern(file, excludePattern)
      })
    }
  }

  // 提取文件夹列表
  folders = extractFolders(allFiles)

  return { files: allFiles, folders }
}
```

---

### 2. 用户交互接口

#### askConfirmation(message)

**实现方式**: 使用 Claude Code 的 `AskUserQuestion` 工具

```markdown
**功能**: 询问用户 Yes/No 问题

**调用示例**:
使用 AskUserQuestion 工具:
questions: [
  {
    question: "{message}",
    header: "确认",
    options: [
      { label: "是", description: "确认执行" },
      { label: "否", description: "取消操作" }
    ],
    multiSelect: false
  }
]

**返回处理**:
- 用户选择 "是": 返回 { confirmed: true }
- 用户选择 "否": 返回 { confirmed: false }
- 用户选择 "Other": 返回 { confirmed: false }
```

**伪代码实现**:
```javascript
function askConfirmation(message) {
  result = 使用 AskUserQuestion 工具({
    questions: [{
      question: message,
      header: "确认",
      options: [
        { label: "是", description: "确认执行" },
        { label: "否", description: "取消操作" }
      ],
      multiSelect: false
    }]
  })

  // 检查用户选择
  answer = result.answers[0]
  confirmed = answer == "是"

  return { confirmed }
}
```

---

#### showMessage(message, type)

**实现方式**: 直接输出文本 (Claude Code 会渲染)

```markdown
**功能**: 向用户显示消息

**type 映射**:
- "info": ℹ️ {message}
- "success": ✅ {message}
- "warning": ⚠️ {message}
- "error": ❌ {message}

**实现**:
根据 type 添加相应 emoji 前缀,然后直接输出文本

**支持 Markdown**:
Claude Code 会自动渲染 Markdown 格式
```

**伪代码实现**:
```javascript
function showMessage(message, type) {
  const icons = {
    "info": "ℹ️",
    "success": "✅",
    "warning": "⚠️",
    "error": "❌"
  }

  const icon = icons[type] || "•"
  const formattedMessage = `${icon} ${message}`

  // 直接输出 (Claude Code 会显示给用户)
  输出文本(formattedMessage)
}
```

---

### 3. 配置管理接口

#### getProjectRoot()

**实现方式**: 使用当前工作目录

```markdown
**功能**: 获取项目根目录

**实现**:
Claude Code 自动设置当前工作目录为项目根目录

**调用示例**:
使用 Bash 工具执行: pwd

**返回**:
当前工作目录的绝对路径
```

**伪代码实现**:
```javascript
function getProjectRoot() {
  // Claude Code 的环境变量或工作目录
  projectRoot = process.cwd()

  return projectRoot
}
```

---

#### getLanguage()

**实现方式**: 读取 `.claude/locale-config.json`

```markdown
**功能**: 获取用户语言设置

**配置文件路径**: .claude/locale-config.json

**配置格式**:
{
  "language": "zh-CN"  // or "en-US"
}

**默认值**: zh-CN

**实现步骤**:
1. 尝试读取 .claude/locale-config.json
2. 解析 JSON
3. 返回 language 字段
4. 如果文件不存在或解析失败,返回 "zh-CN"
```

**伪代码实现**:
```javascript
function getLanguage() {
  configPath = ".claude/locale-config.json"

  try {
    content = readFile(configPath)
    config = JSON.parse(content)

    return config.language || "zh-CN"
  } catch (error) {
    // 配置文件不存在或损坏,使用默认值
    return "zh-CN"
  }
}
```

---

#### loadLanguageFiles(language)

**实现方式**: 并行读取 4 个语言文件

```markdown
**功能**: 加载语言配置文件

**语言文件路径**:
- locales/{language}/messages.json
- locales/{language}/skill.json
- locales/{language}/templates.json
- locales/{language}/hooks.json

**实现步骤**:
1. 并行读取 4 个文件 (使用 Read 工具)
2. 解析 JSON
3. 组合为 LANG 对象

**返回格式**:
{
  messages: { ... },
  skill: { ... },
  templates: { ... },
  hooks: { ... }
}
```

**伪代码实现**:
```javascript
function loadLanguageFiles(language) {
  const basePath = `locales/${language}`

  const files = [
    `${basePath}/messages.json`,
    `${basePath}/skill.json`,
    `${basePath}/templates.json`,
    `${basePath}/hooks.json`
  ]

  // 并行读取
  const results = await Promise.all(
    files.map(file => readFile(file))
  )

  // 解析 JSON
  const [messages, skill, templates, hooks] = results.map(r =>
    JSON.parse(r.content)
  )

  return { messages, skill, templates, hooks }
}
```

---

### 4. 平台能力查询接口

#### getPlatformCapabilities()

**实现方式**: 返回 Claude Code 能力对象

```markdown
**功能**: 查询平台能力

**返回**:
{
  name: "Claude Code",
  fileReference: true,       // 支持文件引用
  autoTrigger: true,         // 支持自动触发 (Hooks)
  hookSystem: true,          // 有 Hook 系统
  batchOperations: true,     // 支持批量操作
  automationLevel: "full"    // 完全自动化
}
```

**伪代码实现**:
```javascript
function getPlatformCapabilities() {
  return {
    name: "Claude Code",
    fileReference: true,
    autoTrigger: true,
    hookSystem: true,
    batchOperations: true,
    automationLevel: "full"
  }
}
```

---

#### generatePlatformConfig(targetPath, language)

**实现方式**: 跳过 (Claude Code 插件已有配置)

```markdown
**功能**: 生成平台特定配置

**对于 Claude Code**:
插件已通过 plugin.json 和 hooks.json 配置,无需额外生成

**实现**:
直接返回空数组

**说明**:
Claude Code 的配置已在 .claude-plugin/ 目录中:
- plugin.json - 插件清单
- hooks.json - Hooks 配置

用户安装插件时自动应用这些配置
```

**伪代码实现**:
```javascript
function generatePlatformConfig(targetPath, language) {
  // Claude Code 插件模式不需要额外配置
  return {
    configFiles: [],
    message: "Claude Code 插件已预配置,无需生成额外配置"
  }
}
```

---

## 自动触发机制

### Hook 配置

Claude Code 通过 `hooks/PostToolUse.json` 配置自动触发:

```json
{
  "description": "Automatically update index when files are modified",
  "commands": [
    {
      "command": "/update-index-auto",
      "trigger": {
        "toolNames": ["Edit", "Write"]
      }
    }
  ]
}
```

### 触发流程

```
用户修改代码文件 (使用 Edit/Write 工具)
    ↓
PostToolUse Hook 触发
    ↓
执行 /update-index-auto 命令
    ↓
调用 universal/core/generator/update-workflow.md
    ↓
使用 ClaudeCodeAdapter 执行更新
    ↓
静默完成或显示更新消息
```

### 自动更新命令

在 `skills/project-multilevel-index/commands_impl/update-index-auto.md`:

```markdown
# 自动更新命令 (Auto Update Command)

此命令由 Hook 自动触发,无需用户手动调用。

**执行流程**:

1. 从 Hook 上下文获取变更文件列表
2. 调用 universal/core/generator/update-workflow.md
3. 传入 ClaudeCodeAdapter
4. 静默模式执行 (不显示冗余消息)
5. 仅在发现重要变更时通知用户

**示例**:

用户修改 src/services/userService.js
    ↓
Hook 触发 /update-index-auto
    ↓
检测到结构性变更 (新增导出)
    ↓
更新文件头、FOLDER_INDEX、PROJECT_INDEX
    ↓
显示: ✅ 索引已自动更新 (1 个文件)
```

---

## 使用示例

### 示例 1: 初始化项目

**用户操作**:
```
/init-index
```

**适配器调用序列**:
```
1. getProjectRoot() → "/path/to/project"
2. getLanguage() → "zh-CN"
3. loadLanguageFiles("zh-CN") → { messages, skill, ... }
4. askConfirmation("是否在 /path/to/project 初始化索引系统?")
   → user: "是"
5. scanFiles("/path/to/project", { include: ["**/*.js"], exclude: [...] })
   → { files: [...], folders: [...] }
6. 对每个文件:
   - readFile(file) → content
   - (分析逻辑...)
   - editFile(file, oldHeader, newHeader) 或 writeFile(...)
7. 对每个文件夹:
   - writeFile(folder + "/FOLDER_INDEX.md", indexContent)
8. writeFile(projectRoot + "/PROJECT_INDEX.md", projectIndexContent)
9. showMessage("✅ 索引系统初始化完成! 共处理 156 个文件", "success")
```

---

### 示例 2: 自动更新 (Hook 触发)

**用户操作**:
```
(用户使用 Edit 工具修改 src/services/userService.js)
```

**Hook 自动触发**:
```
1. PostToolUse Hook 检测到 Edit 工具调用
2. 提取变更文件: ["src/services/userService.js"]
3. 调用 /update-index-auto
```

**适配器调用序列**:
```
1. readFile("src/services/userService.js") → 新内容
2. (分析变更类型...)
3. 检测到结构性变更 (新增导出)
4. editFile("src/services/userService.js", oldHeader, newHeader)
5. readFile("src/services/FOLDER_INDEX.md") → 现有索引
6. editFile("src/services/FOLDER_INDEX.md", oldContent, newContent)
7. showMessage("ℹ️ 索引已自动更新", "info")
```

---

### 示例 3: 检查索引

**用户操作**:
```
/check-index
```

**适配器调用序列**:
```
1. getProjectRoot() → "/path/to/project"
2. scanFiles(...) → { files: [...], folders: [...] }
3. 对每个文件:
   - readFile(file) → content
   - (检查头部完整性...)
4. 对每个文件夹:
   - readFile(folder + "/FOLDER_INDEX.md") → indexContent
   - (检查一致性...)
5. 生成报告
6. showMessage(reportMarkdown, "info")
7. 如果有问题:
   - showMessage("⚠️ 发现 5 个问题", "warning")
   - askConfirmation("是否自动修复?")
   → 根据用户选择执行修复
```

---

## 错误处理

### 1. 文件读取失败

```
如果 readFile 返回错误:
  记录警告: "无法读取 {file}: {error.message}"
  跳过此文件
  继续处理其他文件
```

### 2. 编辑冲突

```
如果 editFile 返回 StringNotFound:
  // 文件可能被其他进程修改
  重新读取文件
  重新提取头部
  再次尝试编辑

  如果仍然失败:
    警告用户: "文件 {file} 已被修改,请手动检查"
```

### 3. Hook 未配置

```
如果用户未启用 PostToolUse Hook:
  在 /init-index 完成时:
    showMessage(
      "💡 提示: 启用 PostToolUse Hook 可实现自动更新\n" +
      "在 .claude/settings.json 中配置 hooks",
      "info"
    )
```

---

## 性能优化

### 1. 批量读取 (如果可能)

```
// 理论上可并行读取多个文件
const contents = await Promise.all(
  files.map(file => readFile(file))
)

// 但 Claude Code 可能不支持真正的并行
// 实际执行可能是串行
```

### 2. 缓存机制

```
// 缓存语言文件,避免重复读取
const langCache = {}

function getCachedLanguage(lang) {
  if (!langCache[lang]) {
    langCache[lang] = loadLanguageFiles(lang)
  }
  return langCache[lang]
}
```

### 3. 增量更新

```
// 仅更新变更的文件,不重新处理整个项目
// update-workflow 已实现增量逻辑
```

---

## 总结

Claude Code 适配器是功能最完整的参考实现。

**关键特性**:
- ✅ 完整的工具集 (Read/Write/Edit/Glob)
- ✅ Hooks 自动触发
- ✅ 用户交互 (AskUserQuestion)
- ✅ 批量操作能力
- ✅ 文件引用支持
- ✅ 完全自动化

**实现方式**:
- 所有接口方法都通过 Claude Code 原生工具实现
- 无需额外配置生成
- 通过 Hooks 实现零用户干预的自动更新

**适用场景**:
- Claude Code CLI 环境
- 需要完全自动化的项目
- 希望通过 Marketplace 分发的插件

**下一步**:
- 修改 `skills/SKILL.md` 调用 universal/core/ 逻辑
- 测试确保所有功能正常

---

*此适配器是其他平台适配器的参考实现*
