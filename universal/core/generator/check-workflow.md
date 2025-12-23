# 检查工作流 (Check Workflow)

## 功能

验证分形索引系统的完整性和一致性,检测并报告问题。

## 输入参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `projectRoot` | string | 项目根目录 |
| `platform` | object | 平台适配器实例 |
| `language` | string | 语言代码 |
| `LANG` | object | 语言对象 |
| `options` | object | 检查选项 (可选) |

## 输出

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否通过检查 |
| `issues` | array | 发现的问题列表 |
| `stats` | object | 统计信息 |
| `report` | string | 检查报告 (Markdown格式) |

## 检查项目

### 1. 文件头完整性检查

**检查内容**:
- 所有代码文件是否有头部注释
- 头部注释是否包含必需字段 (Input/Output/Pos)
- 字段格式是否正确

**严重程度**: 高 (缺失头部) / 中 (字段不完整) / 低 (格式问题)

---

### 2. FOLDER_INDEX 一致性检查

**检查内容**:
- 每个包含代码的文件夹是否有 FOLDER_INDEX.md
- FOLDER_INDEX 中列出的文件是否与实际文件一致
- 文件信息 (Input/Output/Pos) 是否与文件头一致

**严重程度**: 高 (缺失索引) / 中 (文件列表不一致) / 低 (信息过时)

---

### 3. PROJECT_INDEX 准确性检查

**检查内容**:
- PROJECT_INDEX.md 是否存在
- 文件夹列表是否完整
- 统计信息是否准确

**严重程度**: 高 (缺失) / 中 (信息不准确)

---

### 4. 依赖关系验证

**检查内容**:
- 内部依赖的文件是否存在
- 是否存在循环依赖
- 依赖路径是否正确

**严重程度**: 高 (依赖不存在) / 中 (循环依赖) / 低 (路径规范问题)

---

### 5. 导出引用验证

**检查内容**:
- 导出的内容是否在代码中实际存在
- 是否有未导出的公共 API

**严重程度**: 中 (导出不存在) / 低 (遗漏导出)

---

### 6. 架构层级合理性检查

**检查内容**:
- Pos 推断是否合理
- 是否存在跨层级不当依赖 (如 UI 层直接依赖数据层)

**严重程度**: 低 (架构警告)

---

## 工作流程

### 阶段 1: 预检查

#### 步骤 1.1: 验证项目已初始化

```
projectIndexPath = projectRoot + "/PROJECT_INDEX.md"

如果不存在 PROJECT_INDEX.md:
  返回错误: {
    type: "NOT_INITIALIZED",
    message: LANG.messages.commands.checkIndex.notInitialized,
    severity: "CRITICAL"
  }

  建议: 先运行 /init-index

  退出
```

#### 步骤 1.2: 加载检查选项

```
defaultOptions = {
  checkHeaders: true,           // 检查文件头
  checkFolderIndices: true,     // 检查 FOLDER_INDEX
  checkProjectIndex: true,      // 检查 PROJECT_INDEX
  checkDependencies: true,      // 检查依赖关系
  checkExports: true,           // 检查导出
  checkArchitecture: false,     // 检查架构合理性 (可选)
  autoFix: false                // 自动修复 (可选)
}

options = { ...defaultOptions, ...options }
```

---

### 阶段 2: 扫描文件

#### 步骤 2.1: 扫描代码文件

```
codeFiles = platform.scanFiles(projectRoot, {
  include: 代码文件模式,
  exclude: 排除模式
})

totalFiles = codeFiles.length

platform.showMessage(
  LANG.messages.commands.checkIndex.scanningFiles
    .replace("{count}", totalFiles),
  "info"
)
```

#### 步骤 2.2: 扫描文件夹

```
folders = platform.scanFiles(projectRoot, {
  include: ["**/"],
  exclude: 排除模式
}).folders

// 过滤:仅包含代码文件的文件夹
codeFolders = folders.filter(folder => {
  filesInFolder = codeFiles.filter(file => file.startsWith(folder))
  return filesInFolder.length > 0
})
```

---

### 阶段 3: 文件头完整性检查

```
issues = []

对每个代码文件:
  content = platform.readFile(file)

  header = 提取现有头部注释(content)

  如果 header 为 null:
    issues.push({
      type: "MISSING_HEADER",
      severity: "HIGH",
      file,
      message: LANG.messages.commands.checkIndex.missingHeader
        .replace("{file}", file),
      fix: "运行 /update-index 添加头部"
    })
    continue

  // 检查必需字段
  hasInput = header.includes("Input:")
  hasOutput = header.includes("Output:")
  hasPos = header.includes("Pos:")

  如果 !hasInput:
    issues.push({
      type: "MISSING_FIELD_INPUT",
      severity: "MEDIUM",
      file,
      message: "缺少 Input 字段",
      fix: "重新运行 /update-index"
    })

  如果 !hasOutput:
    issues.push({
      type: "MISSING_FIELD_OUTPUT",
      severity: "MEDIUM",
      file,
      message: "缺少 Output 字段",
      fix: "重新运行 /update-index"
    })

  如果 !hasPos:
    issues.push({
      type: "MISSING_FIELD_POS",
      severity: "MEDIUM",
      file,
      message: "缺少 Pos 字段",
      fix: "重新运行 /update-index"
    })

  // 检查字段格式
  inputValue = 从头部提取 Input
  if (inputValue && !isValidInputFormat(inputValue)):
    issues.push({
      type: "INVALID_INPUT_FORMAT",
      severity: "LOW",
      file,
      message: "Input 格式不正确",
      details: inputValue
    })
```

---

### 阶段 4: FOLDER_INDEX 一致性检查

```
对每个文件夹:
  folderIndexPath = folder + "/FOLDER_INDEX.md"

  如果不存在 FOLDER_INDEX.md:
    issues.push({
      type: "MISSING_FOLDER_INDEX",
      severity: "HIGH",
      folder,
      message: LANG.messages.commands.checkIndex.missingFolderIndex
        .replace("{folder}", folder),
      fix: "运行 /update-index"
    })
    continue

  // 读取 FOLDER_INDEX
  indexContent = platform.readFile(folderIndexPath)

  // 提取索引中列出的文件
  listedFiles = 从 FOLDER_INDEX 提取文件列表

  // 获取文件夹中实际文件
  actualFiles = codeFiles.filter(file => file.startsWith(folder))

  // 比较差异
  missingInIndex = actualFiles.filter(file => !listedFiles.includes(file))
  extraInIndex = listedFiles.filter(file => !actualFiles.includes(file))

  如果 missingInIndex.length > 0:
    issues.push({
      type: "FOLDER_INDEX_MISSING_FILES",
      severity: "MEDIUM",
      folder,
      message: "FOLDER_INDEX 缺少 ${missingInIndex.length} 个文件",
      details: missingInIndex,
      fix: "运行 /update-index"
    })

  如果 extraInIndex.length > 0:
    issues.push({
      type: "FOLDER_INDEX_EXTRA_FILES",
      severity: "MEDIUM",
      folder,
      message: "FOLDER_INDEX 包含 ${extraInIndex.length} 个不存在的文件",
      details: extraInIndex,
      fix: "运行 /update-index"
    })

  // 检查文件信息一致性
  对每个 listedFile:
    如果不存在于 actualFiles:
      continue

    // 从 FOLDER_INDEX 提取文件信息
    indexedInfo = 从索引提取(listedFile) // { input, output, pos }

    // 从文件头提取信息
    fileContent = platform.readFile(listedFile)
    header = 提取现有头部(fileContent)
    actualInfo = 从头部提取(header)

    如果 indexedInfo.input != actualInfo.input:
      issues.push({
        type: "FOLDER_INDEX_OUTDATED_INPUT",
        severity: "LOW",
        file: listedFile,
        folder,
        message: "FOLDER_INDEX 中的 Input 信息过时",
        expected: actualInfo.input,
        actual: indexedInfo.input,
        fix: "运行 /update-index"
      })

    // 同样检查 output 和 pos
    ...
```

---

### 阶段 5: PROJECT_INDEX 准确性检查

```
projectIndexPath = projectRoot + "/PROJECT_INDEX.md"

如果不存在 PROJECT_INDEX.md:
  issues.push({
    type: "MISSING_PROJECT_INDEX",
    severity: "CRITICAL",
    message: "缺少 PROJECT_INDEX.md",
    fix: "运行 /init-index"
  })
否则:
  projectIndexContent = platform.readFile(projectIndexPath)

  // 提取索引中的统计信息
  indexedStats = 从 PROJECT_INDEX 提取统计信息

  // 计算实际统计
  actualStats = {
    totalFiles: codeFiles.length,
    totalFolders: codeFolders.length,
    filesByLanguage: 统计各语言文件数,
    filesByLayer: 统计各层级文件数
  }

  // 比较统计信息
  如果 indexedStats.totalFiles != actualStats.totalFiles:
    issues.push({
      type: "PROJECT_INDEX_OUTDATED_STATS",
      severity: "MEDIUM",
      message: "PROJECT_INDEX 统计信息过时",
      field: "totalFiles",
      expected: actualStats.totalFiles,
      actual: indexedStats.totalFiles,
      fix: "运行 /update-index"
    })

  // 同样检查其他统计字段
  ...

  // 提取索引中列出的文件夹
  listedFolders = 从 PROJECT_INDEX 提取文件夹列表

  // 比较文件夹列表
  missingFolders = codeFolders.filter(f => !listedFolders.includes(f))
  extraFolders = listedFolders.filter(f => !codeFolders.includes(f))

  如果 missingFolders.length > 0:
    issues.push({
      type: "PROJECT_INDEX_MISSING_FOLDERS",
      severity: "MEDIUM",
      message: "PROJECT_INDEX 缺少 ${missingFolders.length} 个文件夹",
      details: missingFolders,
      fix: "运行 /update-index"
    })

  如果 extraFolders.length > 0:
    issues.push({
      type: "PROJECT_INDEX_EXTRA_FOLDERS",
      severity: "MEDIUM",
      message: "PROJECT_INDEX 包含 ${extraFolders.length} 个不存在的文件夹",
      details: extraFolders,
      fix: "运行 /update-index"
    })
```

---

### 阶段 6: 依赖关系验证

```
如果 options.checkDependencies:
  dependencyGraph = {}

  对每个代码文件:
    content = platform.readFile(file)
    header = 提取现有头部(content)

    如果无头部:
      continue

    dependencies = 从头部提取 Input

    dependencyGraph[file] = {
      dependencies,
      resolved: [],
      unresolved: []
    }

    // 解析依赖路径
    对每个 dependency:
      如果是相对路径 (./xxx, ../xxx):
        // 解析为绝对路径
        resolvedPath = resolvePath(file, dependency)

        如果 resolvedPath 存在于 codeFiles:
          dependencyGraph[file].resolved.push(resolvedPath)
        否则:
          dependencyGraph[file].unresolved.push(dependency)

          issues.push({
            type: "DEPENDENCY_NOT_FOUND",
            severity: "HIGH",
            file,
            dependency,
            message: "依赖文件不存在: ${dependency}",
            fix: "检查导入路径或移除无效依赖"
          })
      否则:
        // 外部依赖,跳过验证
        dependencyGraph[file].resolved.push(dependency)

  // 检测循环依赖
  cycles = 检测循环依赖(dependencyGraph)

  对每个循环:
    issues.push({
      type: "CIRCULAR_DEPENDENCY",
      severity: "MEDIUM",
      cycle,
      message: "检测到循环依赖: ${cycle.join(' → ')}",
      fix: "重构代码以消除循环依赖"
    })
```

**循环依赖检测算法**:
```
function 检测循环依赖(graph):
  visited = {}
  stack = []
  cycles = []

  function dfs(node):
    if (node in stack):
      // 发现循环
      cycleStart = stack.indexOf(node)
      cycle = stack.slice(cycleStart).concat([node])
      cycles.push(cycle)
      return

    if (node in visited):
      return

    visited[node] = true
    stack.push(node)

    对每个 dependency in graph[node].resolved:
      如果 dependency 在 graph 中:
        dfs(dependency)

    stack.pop()

  对每个 node in graph:
    dfs(node)

  return cycles
```

---

### 阶段 7: 导出引用验证

```
如果 options.checkExports:
  对每个代码文件:
    content = platform.readFile(file)
    header = 提取现有头部(content)

    如果无头部:
      continue

    // 从头部提取导出列表
    declaredExports = 从头部提取 Output

    // 重新分析文件导出
    actualExports = 调用 analyzer/export-parser.md({
      fileContent: content,
      fileExtension: 获取扩展名(file),
      fileName: 获取文件名(file)
    })

    // 比较差异
    missingExports = actualExports.filter(e => !declaredExports.includes(e))
    extraExports = declaredExports.filter(e => !actualExports.includes(e))

    如果 missingExports.length > 0:
      issues.push({
        type: "HEADER_MISSING_EXPORTS",
        severity: "LOW",
        file,
        message: "头部缺少 ${missingExports.length} 个导出",
        details: missingExports,
        fix: "运行 /update-index"
      })

    如果 extraExports.length > 0:
      issues.push({
        type: "HEADER_EXTRA_EXPORTS",
        severity: "MEDIUM",
        file,
        message: "头部包含 ${extraExports.length} 个不存在的导出",
        details: extraExports,
        fix: "运行 /update-index"
      })
```

---

### 阶段 8: 架构层级合理性检查 (可选)

```
如果 options.checkArchitecture:
  // 定义合理的依赖方向
  validDependencies = {
    "API层": ["业务层", "工具层"],
    "业务层": ["数据层", "工具层"],
    "数据层": ["工具层"],
    "UI层": ["业务层", "工具层"],
    "工具层": []  // 不应依赖其他层
  }

  对每个代码文件:
    header = 提取现有头部(file)
    pos = 从头部提取 Pos
    layer = 提取层级(pos)  // 如 "API层"

    dependencies = 从头部提取 Input

    对每个内部依赖:
      depFile = 解析依赖路径(dependency)
      depHeader = 提取现有头部(depFile)
      depPos = 从头部提取 Pos
      depLayer = 提取层级(depPos)

      如果 depLayer 不在 validDependencies[layer]:
        issues.push({
          type: "ARCHITECTURE_VIOLATION",
          severity: "LOW",
          file,
          dependency: depFile,
          message: "${layer} 不应直接依赖 ${depLayer}",
          suggestion: "考虑通过业务层或工具层间接访问"
        })
```

---

### 阶段 9: 生成报告

#### 步骤 9.1: 统计结果

```
stats = {
  totalFiles: codeFiles.length,
  totalFolders: codeFolders.length,
  totalIssues: issues.length,
  issuesBySeverity: {
    CRITICAL: issues.filter(i => i.severity == "CRITICAL").length,
    HIGH: issues.filter(i => i.severity == "HIGH").length,
    MEDIUM: issues.filter(i => i.severity == "MEDIUM").length,
    LOW: issues.filter(i => i.severity == "LOW").length
  },
  issuesByType: 按类型分组统计(issues)
}
```

#### 步骤 9.2: 生成 Markdown 报告

```
report = 生成报告模板({
  language,
  LANG,
  stats,
  issues
})
```

**报告模板** (中文):
```markdown
# 索引系统检查报告

生成时间: {timestamp}
项目: {projectRoot}

## 概览

- 总文件数: {totalFiles}
- 总文件夹数: {totalFolders}
- 发现问题: {totalIssues}

## 问题统计

| 严重程度 | 数量 |
|---------|-----|
| 🔴 严重  | {CRITICAL} |
| 🟠 高    | {HIGH} |
| 🟡 中    | {MEDIUM} |
| 🔵 低    | {LOW} |

## 详细问题

### 🔴 严重问题

{列出所有 CRITICAL 问题}

### 🟠 高优先级问题

{列出所有 HIGH 问题}

### 🟡 中优先级问题

{列出所有 MEDIUM 问题}

### 🔵 低优先级问题

{列出所有 LOW 问题}

## 修复建议

{汇总修复建议}

---

✅ 检查完成
```

#### 步骤 9.3: 显示报告

```
如果 issues.length == 0:
  platform.showMessage(
    LANG.messages.commands.checkIndex.allGood,
    "success"
  )
否则:
  platform.showMessage(
    LANG.messages.commands.checkIndex.issuesFound
      .replace("{count}", issues.length),
    "warning"
  )

  // 显示报告
  platform.showMessage(report, "info")
```

---

### 阶段 10: 自动修复 (可选)

```
如果 options.autoFix 且 issues.length > 0:
  confirmed = platform.askConfirmation(
    LANG.messages.commands.checkIndex.confirmAutoFix
      .replace("{count}", issues.length)
  )

  如果确认:
    // 尝试自动修复可修复的问题
    fixableIssues = issues.filter(i => i.fix && isAutoFixable(i.type))

    对每个可修复问题:
      try {
        根据问题类型执行修复:
          - MISSING_HEADER → 调用 update-workflow
          - MISSING_FOLDER_INDEX → 调用 update-workflow
          - FOLDER_INDEX_OUTDATED → 调用 update-workflow
          - ...

        记录: 已修复 ${issue.type}
      } catch (error) {
        记录: 修复失败 ${issue.type}: ${error.message}
      }

    platform.showMessage(
      LANG.messages.commands.checkIndex.autoFixComplete
        .replace("{fixed}", 修复成功数量),
      "success"
    )
```

---

## 返回结果

```
return {
  success: issues.length == 0 或 仅有 LOW 严重度问题,
  issues,
  stats,
  report
}
```

---

## 使用示例

### 示例 1: 基础检查

**调用**:
```
result = 调用 check-workflow({
  projectRoot: "/path/to/project",
  platform: ClaudeCodeAdapter,
  language: "zh-CN",
  LANG: 语言对象
})
```

**输出**:
```json
{
  "success": false,
  "issues": [
    {
      "type": "MISSING_HEADER",
      "severity": "HIGH",
      "file": "src/utils/helper.js",
      "message": "文件缺少头部注释",
      "fix": "运行 /update-index"
    },
    {
      "type": "FOLDER_INDEX_OUTDATED_INPUT",
      "severity": "LOW",
      "file": "src/services/authService.js",
      "folder": "src/services",
      "message": "FOLDER_INDEX 中的 Input 信息过时"
    }
  ],
  "stats": {
    "totalFiles": 120,
    "totalFolders": 15,
    "totalIssues": 2,
    "issuesBySeverity": {
      "CRITICAL": 0,
      "HIGH": 1,
      "MEDIUM": 0,
      "LOW": 1
    }
  },
  "report": "# 索引系统检查报告\n..."
}
```

---

### 示例 2: 带自动修复的检查

**调用**:
```
result = 调用 check-workflow({
  projectRoot: "/path/to/project",
  platform: ClaudeCodeAdapter,
  language: "en-US",
  LANG: 语言对象,
  options: {
    autoFix: true
  }
})
```

**过程**:
1. 执行所有检查
2. 发现 5 个问题
3. 询问用户是否自动修复
4. 用户确认
5. 自动修复 3 个问题
6. 报告剩余 2 个问题需要手动处理

---

## 总结

检查工作流是分形索引系统的质量保证工具,确保索引系统的完整性和一致性。

**关键特性**:
- ✅ 6 大检查项目
- ✅ 4 级严重程度分类
- ✅ 详细的问题报告
- ✅ 可选的自动修复
- ✅ 依赖关系和循环依赖检测
- ✅ 架构合理性验证

**检查项目**:
1. 文件头完整性
2. FOLDER_INDEX 一致性
3. PROJECT_INDEX 准确性
4. 依赖关系验证
5. 导出引用验证
6. 架构层级合理性

**下一步**: 参见 [file-header-gen.md](./file-header-gen.md) 了解文件头生成逻辑
