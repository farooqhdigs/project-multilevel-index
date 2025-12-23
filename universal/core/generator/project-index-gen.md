# 项目索引生成器 (Project Index Generator)

## 功能

为项目根目录生成 `PROJECT_INDEX.md`,提供项目整体架构视图和导航入口。

## 输入参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `projectRoot` | string | 项目根目录路径 |
| `filesByLayer` | object | 按架构层级分组的文件 |
| `folders` | array | 所有包含代码的文件夹 |
| `stats` | object | 统计信息 |
| `language` | string | 语言代码 |
| `LANG` | object | 语言对象 |

## 输出

| 字段 | 类型 | 说明 |
|------|------|------|
| `indexContent` | string | 生成的 PROJECT_INDEX.md 内容 |

## 索引模板

### 中文模板 (zh-CN)

```markdown
# {projectName} - 项目索引

🔄 **自引用提醒**: 当项目结构变化时,更新此索引

> 此索引由 [project-multilevel-index](https://github.com/...) 自动生成和维护

---

## 📋 项目概览

**项目根目录**: `{projectRoot}`

**索引生成时间**: {timestamp}

**项目规模**:
- **代码文件总数**: {totalFiles}
- **文件夹总数**: {totalFolders}
- **主要编程语言**: {primaryLanguage}

---

## 🏗️ 架构层级视图

### {layer1} ({count1} 个文件)

**职责**: {layerDescription}

**关键文件**:
- [{fileName1}]({filePath1}) - {responsibility1}
- [{fileName2}]({filePath2}) - {responsibility2}
...

### {layer2} ({count2} 个文件)

...

---

## 📁 文件夹结构

### 根目录

```
{projectName}/
├── {folder1}/           ({fileCount1} files)  → [FOLDER_INDEX]({folder1}/FOLDER_INDEX.md)
│   ├── {file1}
│   └── {file2}
├── {folder2}/           ({fileCount2} files)  → [FOLDER_INDEX]({folder2}/FOLDER_INDEX.md)
│   ├── {file3}
│   └── {file4}
...
```

---

## 🔗 核心依赖关系

### 层级间依赖

```mermaid
graph TD
    A[{layer1}] --> B[{layer2}]
    B --> C[{layer3}]
    A --> D[{layer4}]
```

### 关键模块依赖

- `{module1}` ← {dependentCount1} 个文件依赖
- `{module2}` ← {dependentCount2} 个文件依赖

---

## 📊 统计信息

### 按编程语言

| 语言 | 文件数 | 占比 |
|------|--------|------|
| {lang1} | {count1} | {percent1}% |
| {lang2} | {count2} | {percent2}% |
...

### 按架构层级

| 层级 | 文件数 | 占比 |
|------|--------|------|
| {layer1} | {count1} | {percent1}% |
| {layer2} | {count2} | {percent2}% |
...

---

## 🧭 导航快捷方式

### 按功能模块

- [用户管理]({userModulePath}) - 用户相关功能
- [订单系统]({orderModulePath}) - 订单处理
- [支付集成]({paymentModulePath}) - 支付功能
...

### 按架构层级

- [API 层]({apiLayerPath})
- [业务层]({businessLayerPath})
- [数据层]({dataLayerPath})
...

---

## 📝 索引文件列表

{folderIndexList}

---

*最后更新: {timestamp}*
*由 project-multilevel-index v{version} 自动生成*
```

---

### 英文模板 (en-US)

```markdown
# {projectName} - Project Index

🔄 **Self-Reference Reminder**: Update this index when project structure changes

> This index is automatically generated and maintained by [project-multilevel-index](https://github.com/...)

---

## 📋 Project Overview

**Project Root**: `{projectRoot}`

**Index Generated**: {timestamp}

**Project Scale**:
- **Total Code Files**: {totalFiles}
- **Total Folders**: {totalFolders}
- **Primary Language**: {primaryLanguage}

---

## 🏗️ Architecture Layers

### {layer1} ({count1} files)

**Responsibility**: {layerDescription}

**Key Files**:
- [{fileName1}]({filePath1}) - {responsibility1}
- [{fileName2}]({filePath2}) - {responsibility2}
...

### {layer2} ({count2} files)

...

---

## 📁 Folder Structure

### Root Directory

```
{projectName}/
├── {folder1}/           ({fileCount1} files)  → [FOLDER_INDEX]({folder1}/FOLDER_INDEX.md)
│   ├── {file1}
│   └── {file2}
├── {folder2}/           ({fileCount2} files)  → [FOLDER_INDEX]({folder2}/FOLDER_INDEX.md)
│   ├── {file3}
│   └── {file4}
...
```

---

## 🔗 Core Dependencies

### Inter-Layer Dependencies

```mermaid
graph TD
    A[{layer1}] --> B[{layer2}]
    B --> C[{layer3}]
    A --> D[{layer4}]
```

### Key Module Dependencies

- `{module1}` ← {dependentCount1} files depend on this
- `{module2}` ← {dependentCount2} files depend on this

---

## 📊 Statistics

### By Programming Language

| Language | Files | Percentage |
|----------|-------|------------|
| {lang1} | {count1} | {percent1}% |
| {lang2} | {count2} | {percent2}% |
...

### By Architecture Layer

| Layer | Files | Percentage |
|-------|-------|------------|
| {layer1} | {count1} | {percent1}% |
| {layer2} | {count2} | {percent2}% |
...

---

## 🧭 Navigation Shortcuts

### By Feature Module

- [User Management]({userModulePath}) - User-related features
- [Order System]({orderModulePath}) - Order processing
- [Payment Integration]({paymentModulePath}) - Payment features
...

### By Architecture Layer

- [API Layer]({apiLayerPath})
- [Business Layer]({businessLayerPath})
- [Data Layer]({dataLayerPath})
...

---

## 📝 Index File List

{folderIndexList}

---

*Last Updated: {timestamp}*
*Auto-generated by project-multilevel-index v{version}*
```

---

## 生成逻辑

### 步骤 1: 提取项目信息

```
function extractProjectInfo(projectRoot, stats):
  projectName = 获取项目名(projectRoot)
  // 如: /path/to/my-project → "my-project"

  timestamp = new Date().toISOString()

  primaryLanguage = getMostCommonLanguage(stats.filesByLanguage)

  return {
    projectName,
    projectRoot,
    timestamp,
    totalFiles: stats.totalFiles,
    totalFolders: stats.totalFolders,
    primaryLanguage
  }
```

---

### 步骤 2: 生成架构层级视图

```
function generateArchitectureView(filesByLayer, language):
  sections = []

  // 按层级重要性排序
  layerOrder = ["API层", "业务层", "数据层", "UI层", "工具层", "配置层", ...]

  对每个层级 in layerOrder:
    如果 filesByLayer[层级] 不存在:
      continue

    files = filesByLayer[层级]
    count = files.length

    // 生成层级描述
    layerDescription = getLayerDescription(层级, language)

    section = `### ${层级} (${count} ${language == "zh-CN" ? "个文件" : "files"})\n\n`
    section += `**${language == "zh-CN" ? "职责" : "Responsibility"}**: ${layerDescription}\n\n`
    section += `**${language == "zh-CN" ? "关键文件" : "Key Files"}**:\n`

    // 选择关键文件 (最多5个)
    keyFiles = selectKeyFiles(files, 5)

    对每个文件 in keyFiles:
      relativePath = 相对于项目根的路径(file.filePath)
      responsibility = extractResponsibility(file.pos)

      section += `- [${file.fileName}](${relativePath}) - ${responsibility}\n`

    sections.push(section)

  return sections.join("\n")
```

**层级描述映射**:
```
function getLayerDescription(layer, language):
  描述 = {
    "API层": {
      zh: "HTTP接口、路由处理、请求响应",
      en: "HTTP endpoints, routing, request/response handling"
    },
    "业务层": {
      zh: "核心业务逻辑、规则处理",
      en: "Core business logic and rules"
    },
    "数据层": {
      zh: "数据访问、模型定义、数据库操作",
      en: "Data access, model definitions, database operations"
    },
    ...
  }

  return 描述[layer][language == "zh-CN" ? "zh" : "en"]
```

**关键文件选择**:
```
function selectKeyFiles(files, limit):
  // 优先选择:
  // 1. 导出多的文件 (公共 API)
  // 2. 被依赖多的文件 (核心模块)
  // 3. 文件名包含 "index", "main", "core" 的文件

  scored = files.map(file => ({
    file,
    score: calculateImportance(file)
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(s => s.file)
```

---

### 步骤 3: 生成文件夹结构树

```
function generateFolderTree(folders, projectRoot, stats):
  projectName = 获取项目名(projectRoot)

  // 构建树形结构
  tree = buildTree(folders)

  // 渲染为 ASCII 树
  treeText = renderTree(tree, projectRoot, stats)

  return treeText
```

**树形结构渲染**:
```
function renderTree(tree, currentPath, stats, indent = ""):
  lines = []

  folders = tree[currentPath] || []

  folders.forEach((folder, index) => {
    isLast = index == folders.length - 1
    prefix = isLast ? "└── " : "├── "
    folderName = 获取文件夹名(folder)

    fileCount = stats.filesByFolder[folder] || 0
    indexLink = `${folder}/FOLDER_INDEX.md`

    line = `${indent}${prefix}${folderName}/`
    line += `           (${fileCount} files)  → [FOLDER_INDEX](${indexLink})`

    lines.push(line)

    // 递归渲染子文件夹
    childIndent = indent + (isLast ? "    " : "│   ")
    childLines = renderTree(tree, folder, stats, childIndent)

    lines.push(...childLines)
  })

  return lines
}
```

**示例输出**:
```
my-project/
├── src/                 (45 files)  → [FOLDER_INDEX](src/FOLDER_INDEX.md)
│   ├── controllers/     (12 files)  → [FOLDER_INDEX](src/controllers/FOLDER_INDEX.md)
│   ├── services/        (18 files)  → [FOLDER_INDEX](src/services/FOLDER_INDEX.md)
│   └── models/          (15 files)  → [FOLDER_INDEX](src/models/FOLDER_INDEX.md)
├── tests/               (23 files)  → [FOLDER_INDEX](tests/FOLDER_INDEX.md)
└── utils/               (8 files)   → [FOLDER_INDEX](utils/FOLDER_INDEX.md)
```

---

### 步骤 4: 生成依赖关系图

```
function generateDependencyDiagram(filesByLayer, language):
  // 分析层级间依赖
  layerDeps = analyzeInterLayerDependencies(filesByLayer)

  // 生成 Mermaid 图
  mermaid = "```mermaid\ngraph TD\n"

  对每个依赖关系 in layerDeps:
    from = 依赖关系.from
    to = 依赖关系.to

    mermaid += `    ${from} --> ${to}\n`

  mermaid += "```"

  return mermaid
```

**层级间依赖分析**:
```
function analyzeInterLayerDependencies(filesByLayer):
  layerDeps = []

  对每个层级:
    对该层级的每个文件:
      对文件的每个依赖:
        depLayer = 查找依赖所属层级(依赖)

        如果 depLayer 且 depLayer != 当前层级:
          添加依赖关系: 当前层级 → depLayer

  // 去重
  uniqueDeps = Array.from(new Set(layerDeps))

  return uniqueDeps
```

---

### 步骤 5: 生成统计表格

```
function generateStatistics(stats, language):
  // 按编程语言统计
  langTable = generateLanguageTable(stats.filesByLanguage, stats.totalFiles, language)

  // 按架构层级统计
  layerTable = generateLayerTable(stats.filesByLayer, stats.totalFiles, language)

  return { langTable, layerTable }
}

function generateLanguageTable(filesByLanguage, totalFiles, language):
  header = language == "zh-CN" ?
    "| 语言 | 文件数 | 占比 |\n|------|--------|------|" :
    "| Language | Files | Percentage |\n|----------|-------|------------|"

  rows = []

  对每个语言 in filesByLanguage:
    count = filesByLanguage[语言]
    percent = (count / totalFiles * 100).toFixed(1)

    rows.push(`| ${语言} | ${count} | ${percent}% |`)

  return header + "\n" + rows.join("\n")
}
```

**示例输出**:
```markdown
### 按编程语言

| 语言 | 文件数 | 占比 |
|------|--------|------|
| JavaScript | 89 | 57.1% |
| TypeScript | 45 | 28.8% |
| Python | 22 | 14.1% |
```

---

### 步骤 6: 生成导航快捷方式

```
function generateNavigationShortcuts(filesByLayer, folders, language):
  shortcuts = []

  // 按功能模块
  modules = inferFunctionalModules(folders)

  if (modules.length > 0):
    shortcuts.push(language == "zh-CN" ? "### 按功能模块\n" : "### By Feature Module\n")

    对每个模块 in modules:
      modulePath = 模块.path
      moduleDesc = 模块.description

      shortcuts.push(`- [${模块.name}](${modulePath}) - ${moduleDesc}`)

    shortcuts.push("")

  // 按架构层级
  shortcuts.push(language == "zh-CN" ? "### 按架构层级\n" : "### By Architecture Layer\n")

  对每个层级 in filesByLayer:
    // 找到该层级的第一个文件夹
    firstFolder = findFirstFolderByLayer(层级, folders)

    if (firstFolder):
      shortcuts.push(`- [${层级}](${firstFolder}/FOLDER_INDEX.md)`)

  return shortcuts.join("\n")
}
```

**功能模块推断**:
```
function inferFunctionalModules(folders):
  modules = []

  常见模块名 = ["user", "auth", "order", "payment", "product", "notification", ...]

  对每个文件夹 in folders:
    folderName = 获取文件夹名(folder).toLowerCase()

    if (常见模块名.includes(folderName)):
      modules.push({
        name: capitalize(folderName),
        path: folder,
        description: getModuleDescription(folderName)
      })

  return modules
}
```

---

### 步骤 7: 生成索引文件列表

```
function generateIndexFileList(folders):
  list = []

  对每个文件夹 in folders:
    relativePath = 相对路径(文件夹)
    indexPath = `${relativePath}/FOLDER_INDEX.md`

    list.push(`- [${relativePath}/FOLDER_INDEX.md](${indexPath})`)

  return list.join("\n")
}
```

**示例输出**:
```markdown
## 📝 索引文件列表

- [src/FOLDER_INDEX.md](src/FOLDER_INDEX.md)
- [src/controllers/FOLDER_INDEX.md](src/controllers/FOLDER_INDEX.md)
- [src/services/FOLDER_INDEX.md](src/services/FOLDER_INDEX.md)
- [src/models/FOLDER_INDEX.md](src/models/FOLDER_INDEX.md)
- [tests/FOLDER_INDEX.md](tests/FOLDER_INDEX.md)
```

---

### 步骤 8: 组装完整索引

```
function generateProjectIndex(params):
  { projectRoot, filesByLayer, folders, stats, language, LANG } = params

  // 提取项目信息
  projectInfo = extractProjectInfo(projectRoot, stats)

  // 生成各部分
  architectureView = generateArchitectureView(filesByLayer, language)
  folderTree = generateFolderTree(folders, projectRoot, stats)
  dependencyDiagram = generateDependencyDiagram(filesByLayer, language)
  { langTable, layerTable } = generateStatistics(stats, language)
  navigationShortcuts = generateNavigationShortcuts(filesByLayer, folders, language)
  indexFileList = generateIndexFileList(folders)

  // 选择模板
  template = language == "zh-CN" ? 中文模板 : 英文模板

  // 填充模板
  indexContent = template
    .replace("{projectName}", projectInfo.projectName)
    .replace("{projectRoot}", projectInfo.projectRoot)
    .replace("{timestamp}", projectInfo.timestamp)
    .replace("{totalFiles}", projectInfo.totalFiles)
    .replace("{totalFolders}", projectInfo.totalFolders)
    .replace("{primaryLanguage}", projectInfo.primaryLanguage)
    .replace("{architectureView}", architectureView)
    .replace("{folderTree}", folderTree)
    .replace("{dependencyDiagram}", dependencyDiagram)
    .replace("{langTable}", langTable)
    .replace("{layerTable}", layerTable)
    .replace("{navigationShortcuts}", navigationShortcuts)
    .replace("{folderIndexList}", indexFileList)
    .replace("{version}", "2.1.0")

  return indexContent
}
```

---

## 完整生成示例

### 示例输入

```json
{
  "projectRoot": "/path/to/my-app",
  "filesByLayer": {
    "API层": [ ... ],
    "业务层": [ ... ],
    "数据层": [ ... ]
  },
  "folders": [
    "src",
    "src/controllers",
    "src/services",
    "src/models",
    "tests"
  ],
  "stats": {
    "totalFiles": 156,
    "totalFolders": 15,
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
    }
  },
  "language": "zh-CN",
  "LANG": { ... }
}
```

### 示例输出

参见完整的中文模板输出 (在模板部分已展示)。

---

## 边界情况处理

### 1. 小型项目

```
如果 totalFiles < 10:
  简化视图:
    - 跳过依赖关系图
    - 直接列出所有文件
    - 不按层级分组
```

---

### 2. 超大项目

```
如果 totalFiles > 1000:
  限制显示:
    - 每个层级最多显示 5 个关键文件
    - 文件夹树最多显示 3 层
    - 依赖关系图仅显示层级间依赖
```

---

### 3. 单语言项目

```
如果只有一种编程语言:
  语言统计表简化为:

  **主要语言**: JavaScript (100%)
```

---

### 4. 扁平结构项目

```
如果所有文件都在根目录:
  跳过文件夹结构树

  直接显示文件列表
```

---

## 总结

项目索引生成器为项目创建顶层导航和架构视图。

**关键特性**:
- ✅ 项目整体概览
- ✅ 架构层级分组
- ✅ 文件夹结构树
- ✅ 依赖关系可视化
- ✅ 统计信息表格
- ✅ 导航快捷方式
- ✅ 嵌入自引用提醒
- ✅ 双语支持

**生成的索引包含**:
1. 项目概览
2. 架构层级视图
3. 文件夹结构
4. 核心依赖关系
5. 统计信息
6. 导航快捷方式
7. 索引文件列表

**应用场景**:
- 新成员快速了解项目结构
- 代码审查时理解架构
- 重构时把握全局影响
- 文档驱动的开发

---

*此生成器是分形索引系统的顶层汇总*
