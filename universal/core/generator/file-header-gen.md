# 文件头生成器 (File Header Generator)

## 功能

根据文件分析结果,生成符合语言规范的头部注释,包含 Input/Output/Pos 三个核心字段。

## 输入参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileName` | string | 文件名 (不含路径) |
| `input` | array | 依赖列表 (来自 dependency-parser) |
| `output` | array | 导出列表 (来自 export-parser) |
| `pos` | string | 架构定位 (来自 position-inferrer) |
| `language` | string | 语言代码 (`zh-CN` / `en-US`) |
| `fileExtension` | string | 文件扩展名 (如 `.js`, `.py`) |

## 输出

| 字段 | 类型 | 说明 |
|------|------|------|
| `headerComment` | string | 生成的头部注释文本 |

## 注释风格映射

### JavaScript/TypeScript

**注释语法**: JSDoc 风格的块注释

**模板**:
```javascript
/**
 * @file {fileName}
 * Input: {input}
 * Output: {output}
 * Pos: {pos}
 */
```

**示例**:
```javascript
/**
 * @file userService.js
 * Input: axios, ./models/User, lodash
 * Output: createUser(), getUser(), updateUser()
 * Pos: Business Layer-User Service
 */
```

---

### Python

**注释语法**: 三引号文档字符串

**模板**:
```python
"""
{fileName}

Input: {input}
Output: {output}
Pos: {pos}
"""
```

**示例**:
```python
"""
user_service.py

Input: models.User, utils.validator, requests
Output: create_user(), get_user(), update_user()
Pos: 业务层-用户服务
"""
```

---

### Java/Kotlin

**注释语法**: Javadoc 风格

**模板**:
```java
/**
 * {fileName}
 *
 * Input: {input}
 * Output: {output}
 * Pos: {pos}
 */
```

**示例**:
```java
/**
 * UserService.java
 *
 * Input: com.example.model.User, java.util.List, org.springframework.stereotype.Service
 * Output: UserService, createUser(), getUser()
 * Pos: Business Layer-User Service
 */
```

---

### Rust

**注释语法**: 模块级文档注释

**模板**:
```rust
//! {fileName}
//!
//! Input: {input}
//! Output: {output}
//! Pos: {pos}
```

**示例**:
```rust
//! user_service.rs
//!
//! Input: crate::models::User, std::collections::HashMap, serde::Serialize
//! Output: UserService, create_user(), get_user()
//! Pos: Business Layer-User Service
```

---

### Go

**注释语法**: 包级注释

**模板**:
```go
// Package {packageName}
//
// Input: {input}
// Output: {output}
// Pos: {pos}
package {packageName}
```

**示例**:
```go
// Package userservice
//
// Input: github.com/example/models, database/sql, github.com/gin-gonic/gin
// Output: UserService, CreateUser(), GetUser()
// Pos: Business Layer-User Service
package userservice
```

---

### C/C++

**注释语法**: Doxygen 风格

**模板**:
```cpp
/**
 * @file {fileName}
 * @brief {简短描述}
 *
 * Input: {input}
 * Output: {output}
 * Pos: {pos}
 */
```

**示例**:
```cpp
/**
 * @file UserService.h
 * @brief User management service
 *
 * Input: User.h, <vector>, <string>
 * Output: UserService, createUser(), getUser()
 * Pos: Business Layer-User Service
 */
```

---

### C#

**注释语法**: XML 文档注释

**模板**:
```csharp
/// <summary>
/// {fileName}
/// </summary>
/// <remarks>
/// Input: {input}
/// Output: {output}
/// Pos: {pos}
/// </remarks>
```

**示例**:
```csharp
/// <summary>
/// UserService.cs
/// </summary>
/// <remarks>
/// Input: Example.Models.User, System.Collections.Generic.List, System.Linq
/// Output: UserService, CreateUser(), GetUser()
/// Pos: Business Layer-User Service
/// </remarks>
```

---

### PHP

**注释语法**: PHPDoc

**模板**:
```php
/**
 * {fileName}
 *
 * Input: {input}
 * Output: {output}
 * Pos: {pos}
 */
```

**示例**:
```php
/**
 * UserService.php
 *
 * Input: App\Models\User, Illuminate\Support\Facades\DB
 * Output: UserService, createUser(), getUser()
 * Pos: Business Layer-User Service
 */
```

---

### Ruby

**注释语法**: RDoc 风格

**模板**:
```ruby
##
# {fileName}
#
# Input: {input}
# Output: {output}
# Pos: {pos}
```

**示例**:
```ruby
##
# user_service.rb
#
# Input: models/user, active_record, json
# Output: UserService, create_user, get_user
# Pos: Business Layer-User Service
```

---

### Swift

**注释语法**: Swift 文档注释

**模板**:
```swift
/**
 {fileName}

 Input: {input}
 Output: {output}
 Pos: {pos}
 */
```

**示例**:
```swift
/**
 UserService.swift

 Input: Foundation, Models.User, Alamofire
 Output: UserService, createUser(), getUser()
 Pos: Business Layer-User Service
 */
```

---

## 生成逻辑

### 步骤 1: 格式化 Input

```
function formatInput(input, language):
  如果 input.length == 0:
    return language == "zh-CN" ? "无" : "None"

  如果 input.length <= 5:
    // 直接列出所有依赖
    return input.join(", ")
  否则:
    // 显示前 5 个 + 省略
    显示 = input.slice(0, 5).join(", ")
    剩余 = input.length - 5

    if (language == "zh-CN"):
      return 显示 + `, ...(+${剩余}项)`
    else:
      return 显示 + `, ...(+${剩余} more)`
```

**示例**:
```
input = ["axios", "lodash", "react", "vue", "express", "moment", "uuid"]

formatInput(input, "zh-CN") →
"axios, lodash, react, vue, express, ...(+2项)"
```

---

### 步骤 2: 格式化 Output

```
function formatOutput(output, language):
  如果 output.length == 0:
    return language == "zh-CN" ? "无" : "None"

  // 分类导出类型
  classes = output.filter(e => isClass(e))
  functions = output.filter(e => isFunction(e))
  others = output.filter(e => !isClass(e) && !isFunction(e))

  // 优先显示类和函数
  prioritized = [...classes, ...functions, ...others]

  如果 prioritized.length <= 5:
    return prioritized.join(", ")
  否则:
    显示 = prioritized.slice(0, 5).join(", ")
    剩余 = prioritized.length - 5

    if (language == "zh-CN"):
      return 显示 + `, ...(+${剩余}项)`
    else:
      return 显示 + `, ...(+${剩余} more)`
```

**函数识别**:
```
function isFunction(name):
  return name.endsWith("()") ||
         name.includes("(") ||
         name.match(/^[a-z_][a-zA-Z0-9_]*$/)  // 小写开头,可能是函数
```

**类识别**:
```
function isClass(name):
  return name.match(/^[A-Z][a-zA-Z0-9_]*$/)  // 大写开头
```

---

### 步骤 3: 选择注释模板

```
function getCommentTemplate(fileExtension):
  根据扩展名映射:
    .js, .jsx, .mjs, .cjs → JavaScript 模板
    .ts, .tsx → TypeScript 模板 (同 JavaScript)
    .py → Python 模板
    .java → Java 模板
    .kt, .kts → Kotlin 模板 (同 Java)
    .rs → Rust 模板
    .go → Go 模板
    .c, .cpp, .cc, .h, .hpp → C/C++ 模板
    .cs → C# 模板
    .php → PHP 模板
    .rb → Ruby 模板
    .swift → Swift 模板

    默认 → JavaScript 模板 (通用回退)
```

---

### 步骤 4: 填充模板

```
function generateHeader(params):
  template = getCommentTemplate(params.fileExtension)

  formattedInput = formatInput(params.input, params.language)
  formattedOutput = formatOutput(params.output, params.language)

  // 替换占位符
  header = template
    .replace("{fileName}", params.fileName)
    .replace("{input}", formattedInput)
    .replace("{output}", formattedOutput)
    .replace("{pos}", params.pos)

  return header
```

---

### 步骤 5: 处理特殊情况

#### 情况 1: Go 语言包名推断

```
如果 fileExtension == ".go":
  packageName = 从文件名推断包名(fileName)

  // 示例: userService.go → userservice
  packageName = fileName
    .replace(".go", "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")

  template = template.replace("{packageName}", packageName)
```

#### 情况 2: C# 命名空间

```
如果 fileExtension == ".cs":
  如果文件内容包含 namespace:
    从文件内容提取 namespace

    添加到注释:
    /// <remarks>
    /// Namespace: {namespace}
    /// ...
    /// </remarks>
```

#### 情况 3: 索引文件

```
如果 fileName 是 "index", "mod", "__init__":
  添加说明:
    JavaScript: "// Module re-exports"
    Python: "# Package initialization"
    Rust: "//! Module exports"
```

---

## 完整生成流程示例

### 示例 1: JavaScript 文件

**输入**:
```json
{
  "fileName": "userService.js",
  "input": ["axios", "./models/User", "lodash/merge"],
  "output": ["createUser()", "getUser()", "updateUser()", "UserService"],
  "pos": "Business Layer-User Service",
  "language": "zh-CN",
  "fileExtension": ".js"
}
```

**处理步骤**:
```
1. 格式化 Input:
   "axios, ./models/User, lodash/merge"

2. 格式化 Output:
   "UserService, createUser(), getUser(), updateUser()"
   (类优先,然后函数)

3. 选择模板: JavaScript

4. 填充模板:
   /**
    * @file userService.js
    * Input: axios, ./models/User, lodash/merge
    * Output: UserService, createUser(), getUser(), updateUser()
    * Pos: 业务层-用户服务
    */
```

**输出**:
```javascript
/**
 * @file userService.js
 * Input: axios, ./models/User, lodash/merge
 * Output: UserService, createUser(), getUser(), updateUser()
 * Pos: 业务层-用户服务
 */
```

---

### 示例 2: Python 文件

**输入**:
```json
{
  "fileName": "user_service.py",
  "input": ["models.User", "utils.validator", "requests", "json", "logging", "typing.List"],
  "output": ["UserService", "create_user()", "get_user()"],
  "pos": "Business Layer-User Service",
  "language": "en-US",
  "fileExtension": ".py"
}
```

**处理步骤**:
```
1. 格式化 Input (超过 5 个):
   "models.User, utils.validator, requests, json, logging, ...(+1 more)"

2. 格式化 Output:
   "UserService, create_user(), get_user()"

3. 选择模板: Python

4. 填充模板
```

**输出**:
```python
"""
user_service.py

Input: models.User, utils.validator, requests, json, logging, ...(+1 more)
Output: UserService, create_user(), get_user()
Pos: Business Layer-User Service
"""
```

---

### 示例 3: Rust 文件

**输入**:
```json
{
  "fileName": "user_service.rs",
  "input": ["crate::models::User", "std::collections::HashMap", "serde::Serialize"],
  "output": ["UserService", "create_user()", "get_user()"],
  "pos": "业务层-用户服务",
  "language": "zh-CN",
  "fileExtension": ".rs"
}
```

**输出**:
```rust
//! user_service.rs
//!
//! Input: crate::models::User, std::collections::HashMap, serde::Serialize
//! Output: UserService, create_user(), get_user()
//! Pos: 业务层-用户服务
```

---

## 边界情况处理

### 1. 无依赖无导出

```
input = []
output = []

formatInput(input, "zh-CN") → "无"
formatOutput(output, "zh-CN") → "无"

生成:
/**
 * @file helper.js
 * Input: 无
 * Output: 无
 * Pos: 工具层-辅助函数
 */
```

---

### 2. 极长依赖列表

```
input = [100个依赖...]

formatInput(input, "en-US") →
"dep1, dep2, dep3, dep4, dep5, ...(+95 more)"

避免头部过长,保持可读性
```

---

### 3. 特殊字符处理

```
如果 pos 包含特殊字符:
  pos = "API层-用户管理 (CRUD)"

  直接保留,不转义:
  Pos: API层-用户管理 (CRUD)
```

---

### 4. 多语言混合项目

```
同一文件在不同语言设置下:

zh-CN:
  Pos: API层-用户管理

en-US:
  Pos: API Layer-User Management

根据 language 参数动态切换
```

---

## 性能优化

### 1. 模板缓存

```
templateCache = {}

function getCommentTemplate(fileExtension):
  if (!templateCache[fileExtension]):
    templateCache[fileExtension] = loadTemplate(fileExtension)

  return templateCache[fileExtension]
```

### 2. 格式化缓存

```
// 对于相同的 input/output 数组,缓存格式化结果
formattedCache = new Map()

function formatInput(input, language):
  key = input.join(",") + ":" + language

  if (formattedCache.has(key)):
    return formattedCache.get(key)

  result = doFormat(input, language)
  formattedCache.set(key, result)

  return result
```

---

## 总结

文件头生成器根据分析结果生成符合各语言规范的头部注释。

**关键特性**:
- ✅ 支持 10+ 种编程语言
- ✅ 符合各语言注释规范
- ✅ 双语输出 (zh-CN / en-US)
- ✅ 智能格式化 (长列表省略)
- ✅ 边界情况处理
- ✅ 性能优化 (模板缓存)

**生成的头部包含**:
- 文件名
- Input (依赖列表)
- Output (导出列表)
- Pos (架构定位)

**下一步**: 参见 [folder-index-gen.md](./folder-index-gen.md) 了解文件夹索引生成逻辑
