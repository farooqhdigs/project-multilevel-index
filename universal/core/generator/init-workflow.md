# 初始化工作流 (Initialization Workflow)

## 功能

为项目首次建立分形索引系统,生成以下内容:
- 所有代码文件的头部注释 (Input/Output/Pos)
- 每个文件夹的 FOLDER_INDEX.md
- 项目根目录的 PROJECT_INDEX.md

## 输入参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `projectRoot` | string | 项目根目录绝对路径 |
| `language` | string | 语言代码 (`zh-CN` / `en-US`) |
| `platform` | object | 平台适配器实例 |
| `LANG` | object | 语言对象 (来自 i18n) |

## 输出

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否成功 |
| `stats` | object | 统计信息 (文件数、文件夹数等) |
| `errors` | array | 错误列表 (如果有) |

## 工作流程

### 阶段 1: 预检查

#### 步骤 1.1: 验证项目根目录

```
projectRoot = platform.getProjectRoot()

如果 projectRoot 不存在:
  返回错误: "项目根目录不存在"
  退出

如果 projectRoot 不是目录:
  返回错误: "项目根目录必须是目录"
  退出
```

#### 步骤 1.2: 询问用户确认

```
message = LANG.messages.commands.initIndex.confirmDirectory
          .replace("{directory}", projectRoot)

confirmed = platform.askConfirmation(message)

如果未确认:
  platform.showMessage(LANG.messages.commands.initIndex.cancelled, "info")
  退出
```

#### 步骤 1.3: 检查是否已初始化

```
projectIndexPath = projectRoot + "/PROJECT_INDEX.md"

如果 platform.fileExists(projectIndexPath):
  message = LANG.messages.commands.initIndex.alreadyInitialized

  overwrite = platform.askConfirmation(LANG.messages.commands.initIndex.confirmOverwrite)

  如果不覆盖:
    platform.showMessage(LANG.messages.commands.initIndex.cancelled, "info")
    退出
```

---

### 阶段 2: 扫描项目文件

#### 步骤 2.1: 加载扫描配置

```
从 universal/.kiro/specs/index-system.yml 加载:
  - include_patterns (包含模式)
  - exclude_patterns (排除模式)
  - supported_languages (支持的语言)
```

#### 步骤 2.2: 扫描文件系统

```
scanResult = platform.scanFiles(projectRoot, {
  include: include_patterns,
  exclude: exclude_patterns
})

files = scanResult.files         // 所有代码文件
folders = scanResult.folders     // 所有包含代码的文件夹
```

**include_patterns 示例**:
```
**/*.js
**/*.jsx
**/*.ts
**/*.tsx
**/*.py
**/*.java
**/*.rs
**/*.go
**/*.cpp
**/*.c
**/*.h
**/*.cs
**/*.php
**/*.rb
**/*.swift
```

**exclude_patterns 示例**:
```
node_modules/**
dist/**
build/**
.git/**
coverage/**
*.test.js
*.spec.js
__tests__/**
```

#### 步骤 2.3: 过滤和分组

```
按文件夹分组:
  filesByFolder = {}

  对每个文件:
    folderPath = 获取文件所在文件夹路径

    如果 filesByFolder[folderPath] 不存在:
      filesByFolder[folderPath] = []

    filesByFolder[folderPath].push(file)

排序:
  folders.sort() // 字母顺序
  对每个 folder:
    filesByFolder[folder].sort() // 文件名排序
```

---

### 阶段 3: 分析文件

#### 步骤 3.1: 并行分析所有文件

```
analysisResults = {}

对每个文件 (并行执行):
  fileContent = platform.readFile(file)
  fileExtension = 获取文件扩展名(file)
  fileName = 获取文件名(file, 不含扩展名)

  // 调用分析器
  dependencies = 调用 analyzer/dependency-parser.md({
    fileContent,
    fileExtension,
    language
  })

  exports = 调用 analyzer/export-parser.md({
    fileContent,
    fileExtension,
    fileName
  })

  position = 调用 analyzer/position-inferrer.md({
    filePath: file,
    fileName,
    fileContent,
    exports: exports.exports,
    language
  })

  // 保存结果
  analysisResults[file] = {
    input: dependencies.dependencies,
    output: exports.exports,
    pos: position.position,
    layer: position.layer,
    responsibility: position.responsibility
  }
```

**性能优化**:
- 文件读取可并行
- 分析可并行
- 使用批量操作 (如果平台支持)

#### 步骤 3.2: 显示进度

```
totalFiles = files.length
processedFiles = 0

每分析 10 个文件:
  processedFiles += 10
  progress = (processedFiles / totalFiles * 100).toFixed(0)

  platform.showMessage(
    LANG.messages.commands.initIndex.progress
      .replace("{current}", processedFiles)
      .replace("{total}", totalFiles)
      .replace("{percent}", progress),
    "info"
  )
```

---

### 阶段 4: 生成文件头注释

#### 步骤 4.1: 对每个文件生成头部

```
对每个文件:
  analysis = analysisResults[file]
  fileContent = platform.readFile(file)

  // 调用文件头生成器
  headerComment = 调用 generator/file-header-gen.md({
    fileName: 获取文件名(file),
    input: analysis.input,
    output: analysis.output,
    pos: analysis.pos,
    language: language,
    fileExtension: 获取扩展名(file)
  })

  // 检查是否已有头部
  existingHeader = 检测现有头部注释(fileContent)

  如果存在旧头部:
    // 替换旧头部
    platform.editFile(file, existingHeader, headerComment)
  否则:
    // 插入新头部
    newContent = headerComment + "\n" + fileContent
    platform.writeFile(file, newContent)
```

**检测现有头部逻辑**:
```
根据文件类型匹配注释模式:
  JavaScript/TypeScript: /^\/\*[\s\S]*?\*\//
  Python: /^"""[\s\S]*?"""/
  Java/C++: /^\/\*[\s\S]*?\*\//
  Rust: /^\/\/![\s\S]*?\n\n/

如果匹配到包含 "Input:" 或 "Output:" 或 "Pos:":
  返回匹配的头部
否则:
  返回 null
```

---

### 阶段 5: 生成 FOLDER_INDEX.md

#### 步骤 5.1: 对每个文件夹生成索引

```
对每个文件夹 (按深度从深到浅):
  folderPath = folder
  filesInFolder = filesByFolder[folder]

  // 收集文件分析结果
  fileAnalyses = filesInFolder.map(file => ({
    fileName: 获取文件名(file),
    ...analysisResults[file]
  }))

  // 调用文件夹索引生成器
  indexContent = 调用 generator/folder-index-gen.md({
    folderPath,
    files: fileAnalyses,
    language,
    LANG
  })

  // 写入 FOLDER_INDEX.md
  indexFilePath = folderPath + "/FOLDER_INDEX.md"

  // 读取现有内容 (如果存在)
  existingContent = null
  如果 platform.fileExists(indexFilePath):
    existingContent = platform.readFile(indexFilePath)

  // 写入
  platform.writeFile(indexFilePath, indexContent)
```

**自引用提醒嵌入**:
```
每个 FOLDER_INDEX.md 顶部包含:

🔄 当文件夹内容变化时,更新此索引

(根据语言选择中文或英文)
```

---

### 阶段 6: 生成 PROJECT_INDEX.md

#### 步骤 6.1: 收集全局信息

```
// 按架构层级分组文件
filesByLayer = {}

对每个文件:
  analysis = analysisResults[file]
  layer = analysis.layer

  如果 filesByLayer[layer] 不存在:
    filesByLayer[layer] = []

  filesByLayer[layer].push({
    filePath: file,
    fileName: 获取文件名(file),
    ...analysis
  })

// 统计信息
stats = {
  totalFiles: files.length,
  totalFolders: folders.length,
  filesByLanguage: {}, // 按编程语言统计
  filesByLayer: {}     // 按架构层级统计
}
```

#### 步骤 6.2: 调用项目索引生成器

```
indexContent = 调用 generator/project-index-gen.md({
  projectRoot,
  filesByLayer,
  folders,
  stats,
  language,
  LANG
})
```

#### 步骤 6.3: 写入 PROJECT_INDEX.md

```
projectIndexPath = projectRoot + "/PROJECT_INDEX.md"

// 读取现有内容 (如果存在)
existingContent = null
如果 platform.fileExists(projectIndexPath):
  existingContent = platform.readFile(projectIndexPath)

// 写入
platform.writeFile(projectIndexPath, indexContent)
```

**自引用提醒嵌入**:
```
PROJECT_INDEX.md 顶部包含:

🔄 当项目结构变化时,更新此索引

(根据语言选择中文或英文)
```

---

### 阶段 7: 生成平台配置 (可选)

#### 步骤 7.1: 检测平台类型

```
platformType = platform.getPlatformCapabilities().name

如果 platformType 不是 "Claude Code":
  // 为其他平台生成配置文件

  configFiles = platform.generatePlatformConfig(projectRoot, language)

  platform.showMessage(
    LANG.messages.commands.initIndex.configGenerated
      .replace("{platform}", platformType)
      .replace("{files}", configFiles.join(", ")),
    "success"
  )
```

**示例配置文件**:
- Cursor: `.cursor/rules/doc-maintenance.md`
- Kiro: `.kiro/steering/index-system.md`
- Windsurf: `.windsurfrules`

---

### 阶段 8: 完成和报告

#### 步骤 8.1: 生成统计报告

```
stats = {
  totalFiles: files.length,
  totalFolders: folders.length,
  filesByLanguage: 统计各语言文件数,
  filesByLayer: 统计各层级文件数,
  generatedHeaders: files.length,
  generatedFolderIndices: folders.length,
  generatedProjectIndex: 1
}
```

#### 步骤 8.2: 显示成功消息

```
message = LANG.messages.commands.initIndex.complete
  .replace("{totalFiles}", stats.totalFiles)
  .replace("{totalFolders}", stats.totalFolders)

platform.showMessage(message, "success")
```

#### 步骤 8.3: 显示详细报告 (可选)

```
如果用户请求详细报告:
  报告内容:
    - 文件统计 (按语言)
    - 文件统计 (按层级)
    - 生成的索引文件列表
    - 处理时间
    - 警告和错误 (如果有)
```

---

## 错误处理

### 1. 文件访问错误

```
try {
  fileContent = platform.readFile(file)
} catch (error) {
  记录错误: {
    file,
    error: "无法读取文件",
    details: error.message
  }

  跳过此文件
  继续处理下一个文件
}
```

### 2. 分析错误

```
try {
  dependencies = 调用 dependency-parser
} catch (error) {
  记录警告: {
    file,
    analyzer: "dependency-parser",
    error: error.message
  }

  使用空依赖列表
  继续处理
}
```

### 3. 写入错误

```
try {
  platform.writeFile(path, content)
} catch (error) {
  记录错误: {
    path,
    error: "无法写入文件",
    details: error.message
  }

  如果是关键文件 (PROJECT_INDEX):
    返回失败
  否则:
    继续处理
}
```

### 4. 用户取消

```
如果用户在任何确认步骤选择 No:
  platform.showMessage(LANG.messages.commands.initIndex.cancelled, "info")

  清理已生成的文件 (可选)

  优雅退出
```

---

## 性能优化

### 1. 并行处理

```
// 文件读取并行
fileContents = await Promise.all(
  files.map(file => platform.readFile(file))
)

// 分析并行
analyses = await Promise.all(
  files.map(file => analyzeFile(file))
)
```

### 2. 批量操作

```
如果平台支持批量写入:
  platform.writeFiles([
    { path: file1, content: content1 },
    { path: file2, content: content2 },
    ...
  ])
否则:
  对每个文件单独写入
```

### 3. 缓存优化

```
// 缓存语言配置
langCache = {}

function getLanguageConfig(lang) {
  if (!langCache[lang]) {
    langCache[lang] = platform.loadLanguageFiles(lang)
  }
  return langCache[lang]
}
```

### 4. 增量处理

```
每处理 50 个文件:
  刷新缓冲区
  释放内存
  更新进度
```

---

## 使用示例

### 示例 1: Claude Code 平台初始化

**调用**:
```
platform = ClaudeCodeAdapter
language = "zh-CN"
projectRoot = "/path/to/project"

result = 调用 init-workflow({
  projectRoot,
  language,
  platform,
  LANG: platform.loadLanguageFiles(language)
})
```

**输出**:
```json
{
  "success": true,
  "stats": {
    "totalFiles": 156,
    "totalFolders": 23,
    "filesByLanguage": {
      "JavaScript": 89,
      "TypeScript": 45,
      "Python": 22
    },
    "filesByLayer": {
      "API层": 34,
      "业务层": 56,
      "数据层": 23,
      "UI层": 43
    },
    "generatedHeaders": 156,
    "generatedFolderIndices": 23,
    "generatedProjectIndex": 1
  },
  "errors": []
}
```

### 示例 2: Cursor 平台初始化

**调用**:
```
platform = CursorAdapter
language = "en-US"
projectRoot = "/path/to/project"

result = 调用 init-workflow({
  projectRoot,
  language,
  platform,
  LANG: platform.loadLanguageFiles(language)
})
```

**额外生成**:
```
.cursor/rules/doc-maintenance.md  (平台配置文件)
```

---

## 边界情况

### 1. 空项目

```
如果 files.length == 0:
  platform.showMessage(
    LANG.messages.commands.initIndex.noFiles,
    "warning"
  )

  仅生成空的 PROJECT_INDEX.md
  退出
```

### 2. 超大项目

```
如果 files.length > 1000:
  platform.showMessage(
    LANG.messages.commands.initIndex.largeProject
      .replace("{count}", files.length),
    "warning"
  )

  confirmed = platform.askConfirmation(
    LANG.messages.commands.initIndex.confirmLargeProject
  )

  如果未确认:
    退出

  启用分批处理模式 (每批 100 个文件)
```

### 3. 混合语言项目

```
如果检测到多种编程语言:
  自动支持所有检测到的语言

  在 PROJECT_INDEX.md 中按语言分组显示
```

### 4. 已有部分索引

```
如果检测到部分文件已有头部注释:
  askOverwrite = platform.askConfirmation(
    LANG.messages.commands.initIndex.confirmPartialOverwrite
  )

  如果确认:
    覆盖所有现有头部
  否则:
    仅更新缺失的头部
    保留现有头部
```

---

## 总结

初始化工作流是分形索引系统的入口,负责为整个项目建立索引结构。

**关键特性**:
- ✅ 全自动分析和生成
- ✅ 支持 10+ 种编程语言
- ✅ 双语输出 (zh-CN / en-US)
- ✅ 平台无关 (通过适配器)
- ✅ 并行处理优化
- ✅ 完善的错误处理
- ✅ 用户友好的进度提示

**生成的文件**:
- 文件头注释 (每个代码文件)
- FOLDER_INDEX.md (每个文件夹)
- PROJECT_INDEX.md (项目根目录)
- 平台配置文件 (如果需要)

**下一步**: 参见 [update-workflow.md](./update-workflow.md) 了解增量更新流程
