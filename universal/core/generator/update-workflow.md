# 更新工作流 (Update Workflow)

## 功能

检测代码文件变化,智能更新相关索引文档。遵循 **"先读后写"** 原则,防止意外覆盖。

## 输入参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `changedFiles` | array | 变更的文件路径列表 |
| `changeType` | string | 变更类型 (可选,自动检测) |
| `platform` | object | 平台适配器实例 |
| `language` | string | 语言代码 (`zh-CN` / `en-US`) |
| `LANG` | object | 语言对象 |

## 输出

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否成功 |
| `updatedFiles` | array | 更新的文件列表 |
| `skippedFiles` | array | 跳过的文件列表 |
| `errors` | array | 错误列表 |

## 变更类型分类

### 类型 1: 结构性变更 (Structural Change)

**特征**: 影响文件对外接口或依赖关系

**关键字检测**:
```
import, export, require, from
class, interface, type, enum
function (顶层), def (顶层)
public class, public interface
pub fn, pub struct
```

**需要更新**:
- ✅ 文件头注释 (Input/Output)
- ✅ FOLDER_INDEX.md
- ✅ PROJECT_INDEX.md (如果是跨文件夹影响)

**示例**:
```javascript
// 变更前
import { User } from './models'
export function getUser() {}

// 变更后
import { User, Post } from './models'  // ← 新增依赖
import axios from 'axios'              // ← 新增依赖
export function getUser() {}
export function getPosts() {}          // ← 新增导出
```

---

### 类型 2: 头部信息变更 (Header Change)

**特征**: 仅影响文件头注释内容

**场景**:
- 修改现有函数签名 (不影响导出列表)
- 调整内部实现的依赖
- 重构但接口不变

**需要更新**:
- ✅ 文件头注释
- ⚠️ FOLDER_INDEX.md (可选)
- ❌ PROJECT_INDEX.md (不需要)

**示例**:
```javascript
// 变更前
export function createUser(name) {
  return { name }
}

// 变更后
export function createUser(name, age) {  // ← 签名变更
  return { name, age }
}
```

---

### 类型 3: 实现细节变更 (Implementation Change)

**特征**: 不影响接口和依赖

**场景**:
- 修复 bug
- 优化算法
- 添加注释
- 格式化代码

**需要更新**:
- ❌ 不需要更新任何索引

**示例**:
```javascript
// 变更前
export function add(a, b) {
  return a + b
}

// 变更后
export function add(a, b) {
  // 优化:添加类型检查
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('参数必须是数字')
  }
  return a + b
}
```

---

## 工作流程

### 阶段 1: 变更检测

#### 步骤 1.1: 获取变更文件

```
如果 changedFiles 未提供:
  // 通过平台获取 (如 Hook 传入)
  changedFiles = platform.getChangedFiles()

如果 changedFiles 为空:
  // 无变更,直接退出
  返回 { success: true, updatedFiles: [], skippedFiles: [] }
```

#### 步骤 1.2: 过滤索引文件自身

```
// 移除索引文件,避免递归更新
filteredFiles = changedFiles.filter(file => {
  fileName = 获取文件名(file)

  if (fileName == "PROJECT_INDEX.md") return false
  if (fileName == "FOLDER_INDEX.md") return false
  if (fileName.endsWith(".md") && isIndexFile(file)) return false

  return true
})

如果 filteredFiles 为空:
  // 仅索引文件变更,跳过
  返回 { success: true, skippedFiles: changedFiles }
```

#### 步骤 1.3: 过滤非代码文件

```
codeFiles = filteredFiles.filter(file => {
  extension = 获取扩展名(file)

  return isSupportedLanguage(extension)
})

如果 codeFiles 为空:
  // 无代码文件变更,跳过
  返回 { success: true, skippedFiles: filteredFiles }
```

---

### 阶段 2: 分析变更类型

#### 步骤 2.1: 读取文件内容

```
fileContents = {}

对每个文件:
  try {
    fileContents[file] = platform.readFile(file)
  } catch (error) {
    记录错误: "无法读取文件 ${file}"
    跳过此文件
  }
```

#### 步骤 2.2: 提取现有头部信息

```
existingHeaders = {}

对每个文件:
  content = fileContents[file]

  header = 提取现有头部注释(content)

  如果存在头部:
    existingHeaders[file] = {
      input: 从头部提取 Input,
      output: 从头部提取 Output,
      pos: 从头部提取 Pos
    }
  否则:
    existingHeaders[file] = null  // 新文件,无头部
```

**提取逻辑示例** (JavaScript):
```
匹配: /\/\*\*([\s\S]*?)\*\//

从匹配内容中提取:
  Input: /\* Input:\s*(.+)/
  Output: /\* Output:\s*(.+)/
  Pos: /\* Pos:\s*(.+)/
```

#### 步骤 2.3: 重新分析文件

```
newAnalyses = {}

对每个文件:
  content = fileContents[file]
  extension = 获取扩展名(file)
  fileName = 获取文件名(file, 不含扩展名)

  // 调用分析器
  dependencies = 调用 analyzer/dependency-parser.md({
    fileContent: content,
    fileExtension: extension,
    language
  })

  exports = 调用 analyzer/export-parser.md({
    fileContent: content,
    fileExtension: extension,
    fileName
  })

  position = 调用 analyzer/position-inferrer.md({
    filePath: file,
    fileName,
    fileContent: content,
    exports: exports.exports,
    language
  })

  newAnalyses[file] = {
    input: dependencies.dependencies,
    output: exports.exports,
    pos: position.position
  }
```

#### 步骤 2.4: 比较差异

```
changeDetails = {}

对每个文件:
  oldHeader = existingHeaders[file]
  newAnalysis = newAnalyses[file]

  如果 oldHeader 为 null:
    // 新文件,需要添加头部
    changeDetails[file] = {
      type: "NEW_FILE",
      needsUpdate: true,
      updateScope: ["header", "folderIndex", "projectIndex"]
    }
    continue

  // 比较 Input
  inputChanged = !arraysEqual(oldHeader.input, newAnalysis.input)

  // 比较 Output
  outputChanged = !arraysEqual(oldHeader.output, newAnalysis.output)

  // 比较 Pos
  posChanged = oldHeader.pos != newAnalysis.pos

  如果 inputChanged 或 outputChanged 或 posChanged:
    changeDetails[file] = {
      type: "STRUCTURAL",
      needsUpdate: true,
      updateScope: ["header", "folderIndex"],
      inputChanged,
      outputChanged,
      posChanged
    }

    // 如果跨文件夹影响,需要更新 PROJECT_INDEX
    如果影响其他文件夹的依赖:
      changeDetails[file].updateScope.push("projectIndex")
  否则:
    // 无结构性变更
    changeDetails[file] = {
      type: "IMPLEMENTATION",
      needsUpdate: false,
      updateScope: []
    }
```

---

### 阶段 3: 更新文件头

#### 步骤 3.1: 生成新头部

```
对每个需要更新的文件:
  if (!changeDetails[file].needsUpdate) continue

  newAnalysis = newAnalyses[file]

  // 调用文件头生成器
  newHeader = 调用 generator/file-header-gen.md({
    fileName: 获取文件名(file),
    input: newAnalysis.input,
    output: newAnalysis.output,
    pos: newAnalysis.pos,
    language,
    fileExtension: 获取扩展名(file)
  })

  // 保存新头部
  newHeaders[file] = newHeader
```

#### 步骤 3.2: 替换头部 (先读后写)

```
对每个需要更新的文件:
  // 重新读取文件 (防止其他进程修改)
  currentContent = platform.readFile(file)

  // 提取当前头部
  currentHeader = 提取现有头部注释(currentContent)

  如果 currentHeader 存在:
    // 替换旧头部
    newContent = currentContent.replace(currentHeader, newHeaders[file])

    platform.editFile(file, currentHeader, newHeaders[file])
  否则:
    // 插入新头部
    newContent = newHeaders[file] + "\n" + currentContent

    platform.writeFile(file, newContent)

  记录: 文件 ${file} 头部已更新
```

---

### 阶段 4: 更新 FOLDER_INDEX.md

#### 步骤 4.1: 确定受影响的文件夹

```
affectedFolders = new Set()

对每个更新的文件:
  folderPath = 获取文件所在文件夹(file)

  affectedFolders.add(folderPath)
```

#### 步骤 4.2: 重新扫描文件夹

```
对每个受影响的文件夹:
  // 获取文件夹内所有文件
  filesInFolder = platform.scanFiles(folderPath, {
    include: ["**/*"],
    exclude: 索引文件排除模式
  })

  // 收集文件分析结果
  fileAnalyses = []

  对每个文件:
    如果文件在 newAnalyses 中:
      // 使用新分析结果
      fileAnalyses.push({
        fileName: 获取文件名(file),
        ...newAnalyses[file]
      })
    否则:
      // 重新分析 (或从缓存获取)
      content = platform.readFile(file)
      header = 提取现有头部(content)

      fileAnalyses.push({
        fileName: 获取文件名(file),
        input: 从头部提取 Input,
        output: 从头部提取 Output,
        pos: 从头部提取 Pos
      })
```

#### 步骤 4.3: 生成新 FOLDER_INDEX

```
对每个受影响的文件夹:
  // 调用文件夹索引生成器
  newIndexContent = 调用 generator/folder-index-gen.md({
    folderPath,
    files: fileAnalyses,
    language,
    LANG
  })

  indexFilePath = folderPath + "/FOLDER_INDEX.md"

  // 先读后写
  如果 platform.fileExists(indexFilePath):
    oldIndexContent = platform.readFile(indexFilePath)

    如果 oldIndexContent != newIndexContent:
      platform.editFile(indexFilePath, oldIndexContent, newIndexContent)
      记录: FOLDER_INDEX ${folderPath} 已更新
    否则:
      记录: FOLDER_INDEX ${folderPath} 无变化,跳过
  否则:
    platform.writeFile(indexFilePath, newIndexContent)
    记录: 新建 FOLDER_INDEX ${folderPath}
```

---

### 阶段 5: 更新 PROJECT_INDEX.md (可选)

#### 步骤 5.1: 判断是否需要更新

```
needsProjectIndexUpdate = false

对每个变更:
  if (changeDetails[file].updateScope.includes("projectIndex")) {
    needsProjectIndexUpdate = true
    break
  }

如果不需要更新:
  跳到阶段 6
```

#### 步骤 5.2: 重新扫描整个项目

```
// 获取所有代码文件
allFiles = platform.scanFiles(projectRoot, {
  include: 代码文件模式,
  exclude: 排除模式
})

// 收集所有文件分析结果
allAnalyses = {}

对每个文件:
  如果文件在 newAnalyses 中:
    allAnalyses[file] = newAnalyses[file]
  否则:
    // 从头部提取
    content = platform.readFile(file)
    header = 提取现有头部(content)

    allAnalyses[file] = {
      input: 从头部提取 Input,
      output: 从头部提取 Output,
      pos: 从头部提取 Pos
    }

// 按架构层级分组
filesByLayer = 按 pos.layer 分组(allAnalyses)

// 统计信息
stats = {
  totalFiles: allFiles.length,
  filesByLanguage: 统计各语言文件数,
  filesByLayer: 统计各层级文件数
}
```

#### 步骤 5.3: 生成新 PROJECT_INDEX

```
// 调用项目索引生成器
newProjectIndex = 调用 generator/project-index-gen.md({
  projectRoot,
  filesByLayer,
  folders: affectedFolders,
  stats,
  language,
  LANG
})

projectIndexPath = projectRoot + "/PROJECT_INDEX.md"

// 先读后写
如果 platform.fileExists(projectIndexPath):
  oldProjectIndex = platform.readFile(projectIndexPath)

  如果 oldProjectIndex != newProjectIndex:
    platform.editFile(projectIndexPath, oldProjectIndex, newProjectIndex)
    记录: PROJECT_INDEX 已更新
  否则:
    记录: PROJECT_INDEX 无变化,跳过
否则:
  platform.writeFile(projectIndexPath, newProjectIndex)
  记录: 新建 PROJECT_INDEX
```

---

### 阶段 6: 完成和报告

#### 步骤 6.1: 统计更新结果

```
updatedFiles = 收集所有更新的文件
skippedFiles = 收集所有跳过的文件

result = {
  success: true,
  updatedFiles,
  skippedFiles,
  stats: {
    totalChanged: changedFiles.length,
    totalUpdated: updatedFiles.length,
    totalSkipped: skippedFiles.length,
    structuralChanges: 统计结构性变更数量,
    implementationChanges: 统计实现细节变更数量
  },
  errors: 收集所有错误
}
```

#### 步骤 6.2: 显示消息 (静默模式可选)

```
如果不是静默模式:
  如果 updatedFiles.length > 0:
    message = LANG.messages.commands.updateIndex.complete
      .replace("{count}", updatedFiles.length)

    platform.showMessage(message, "success")
  否则:
    message = LANG.messages.commands.updateIndex.noChanges

    platform.showMessage(message, "info")
```

---

## 触发机制

### 1. Hook 触发 (Claude Code)

```
// hooks/PostToolUse.md

当工具调用完成:
  如果工具是 Edit 或 Write:
    changedFiles = [工具操作的文件]

    调用 universal/core/generator/update-workflow.md({
      changedFiles,
      platform: ClaudeCodeAdapter,
      language: 当前语言,
      LANG: 加载语言对象
    })
```

### 2. 嵌入提醒触发 (Cursor, Kiro)

```
// .cursor/rules/doc-maintenance.md

🔄 当你修改代码文件时:

1. 检测结构性变化 (import/export/class/function)
2. 如果发现变化,调用 update-workflow
3. 更新文件头 → FOLDER_INDEX → PROJECT_INDEX

请在修改代码后自动执行此流程。
```

### 3. 手动触发 (Windsurf, 通用)

```
用户执行命令: /update-index

系统调用 update-workflow({
  changedFiles: 用户指定的文件 或 最近修改的文件,
  platform: 当前平台适配器,
  language: 用户语言,
  LANG: 加载语言对象
})
```

---

## 性能优化

### 1. 增量分析

```
// 仅分析变更文件,不重新分析整个项目
对每个变更文件:
  重新分析

对其他文件:
  从现有头部提取信息 (无需重新分析)
```

### 2. 缓存优化

```
// 缓存文件内容
contentCache = {}

function getCachedContent(file) {
  if (!contentCache[file]) {
    contentCache[file] = platform.readFile(file)
  }
  return contentCache[file]
}
```

### 3. 批量操作

```
// 批量更新文件头
如果平台支持批量编辑:
  platform.editFiles([
    { file: file1, oldString: oldHeader1, newString: newHeader1 },
    { file: file2, oldString: oldHeader2, newString: newHeader2 },
    ...
  ])
```

### 4. 智能跳过

```
// 跳过不需要更新的文件
对每个文件:
  如果 changeType == "IMPLEMENTATION":
    跳过更新,直接返回

  如果新旧头部完全相同:
    跳过更新
```

---

## 错误处理

### 1. 文件并发修改

```
try {
  platform.editFile(file, oldHeader, newHeader)
} catch (error) {
  if (error.type == "StringNotFound") {
    // 文件已被其他进程修改
    警告: "文件 ${file} 已被修改,跳过更新"

    // 重新读取并尝试
    currentContent = platform.readFile(file)
    currentHeader = 提取现有头部(currentContent)

    if (currentHeader) {
      platform.editFile(file, currentHeader, newHeader)
    }
  }
}
```

### 2. 分析失败降级

```
try {
  dependencies = 调用 dependency-parser
} catch (error) {
  警告: "无法分析文件 ${file} 的依赖,使用现有信息"

  dependencies = existingHeaders[file]?.input || []
}
```

### 3. 写入冲突

```
如果多个文件同时修改同一个 FOLDER_INDEX:
  使用锁机制:
    获取锁(folderPath)

    更新 FOLDER_INDEX

    释放锁(folderPath)
```

---

## 使用示例

### 示例 1: 单文件更新

**输入**:
```
changedFiles: ["src/services/userService.js"]
```

**检测结果**:
```
changeDetails: {
  "src/services/userService.js": {
    type: "STRUCTURAL",
    needsUpdate: true,
    updateScope: ["header", "folderIndex"],
    inputChanged: true,    // 新增 axios 依赖
    outputChanged: false,
    posChanged: false
  }
}
```

**更新操作**:
1. 更新 `src/services/userService.js` 头部
2. 更新 `src/services/FOLDER_INDEX.md`
3. 跳过 `PROJECT_INDEX.md` (无跨文件夹影响)

---

### 示例 2: 多文件批量更新

**输入**:
```
changedFiles: [
  "src/controllers/userController.js",
  "src/services/userService.js",
  "src/models/User.js"
]
```

**检测结果**:
```
changeDetails: {
  "src/controllers/userController.js": {
    type: "STRUCTURAL",
    needsUpdate: true,
    updateScope: ["header", "folderIndex", "projectIndex"]
  },
  "src/services/userService.js": {
    type: "IMPLEMENTATION",
    needsUpdate: false,
    updateScope: []
  },
  "src/models/User.js": {
    type: "STRUCTURAL",
    needsUpdate: true,
    updateScope: ["header", "folderIndex"]
  }
}
```

**更新操作**:
1. 更新 2 个文件头部 (跳过 userService.js)
2. 更新 3 个 FOLDER_INDEX.md (controllers/, services/, models/)
3. 更新 PROJECT_INDEX.md (因为 userController 影响跨层级)

---

## 总结

更新工作流是分形索引系统的核心,负责增量维护索引的一致性。

**关键特性**:
- ✅ 智能检测变更类型
- ✅ 先读后写,防止覆盖
- ✅ 增量更新,高性能
- ✅ 多触发机制支持
- ✅ 完善的错误处理
- ✅ 静默模式可选

**更新范围**:
- 文件头注释 (变更文件)
- FOLDER_INDEX.md (受影响文件夹)
- PROJECT_INDEX.md (结构性变更时)

**下一步**: 参见 [check-workflow.md](./check-workflow.md) 了解索引验证流程
