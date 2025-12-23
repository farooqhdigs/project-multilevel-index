# 依赖分析器 (Dependency Parser)

## 功能

分析代码文件的依赖关系,提取 **Input** (文件依赖的外部内容)。

## 输入参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileContent` | string | 文件完整内容 |
| `fileExtension` | string | 文件扩展名 (如 `.js`, `.py`) |
| `language` | string | 语言代码 (`zh-CN` / `en-US`) |

## 输出

| 字段 | 类型 | 说明 |
|------|------|------|
| `dependencies` | array | 依赖列表 (去重、排序) |
| `internalDeps` | array | 内部依赖 (相对路径引用) |
| `externalDeps` | array | 外部依赖 (第三方库) |

## 分析规则

### 语言特定的依赖关键字

#### JavaScript/TypeScript

**关键字**: `import`, `require`, `from`

**模式**:
```javascript
// ES6 import
import { foo, bar } from 'lodash'           → lodash
import React from 'react'                   → react
import utils from './utils'                 → ./utils
import type { User } from './types'         → ./types

// CommonJS require
const express = require('express')          → express
const helper = require('../helpers/auth')   → ../helpers/auth

// Dynamic import
const module = await import('moment')       → moment
```

**提取方法**:
1. 使用正则匹配: `/import\s+(?:.*?\s+from\s+)?['"](.+?)['"]/g`
2. 使用正则匹配: `/require\s*\(['"](.+?)['"]\)/g`
3. 去除引号,提取模块名

#### Python

**关键字**: `import`, `from`

**模式**:
```python
import os                                    → os
import numpy as np                          → numpy
from models import User, Post               → models
from .utils import helper                   → .utils
from django.conf import settings            → django.conf
```

**提取方法**:
1. 匹配: `/^import\s+(\S+)/gm`
2. 匹配: `/^from\s+(\S+)\s+import/gm`
3. 处理相对导入 (`.` 开头)

#### Java/Kotlin

**关键字**: `import`

**模式**:
```java
import java.util.List;                      → java.util.List
import com.example.model.User;              → com.example.model.User
import static org.junit.Assert.*;           → org.junit.Assert
```

**提取方法**:
1. 匹配: `/^import\s+(?:static\s+)?(.+?);/gm`
2. 保留完整包路径

#### Rust

**关键字**: `use`

**模式**:
```rust
use std::collections::HashMap;              → std::collections::HashMap
use crate::models::User;                    → crate::models::User
use super::utils;                           → super::utils
```

**提取方法**:
1. 匹配: `/^use\s+(.+?);/gm`
2. 处理路径: `crate`, `super`, `self`

#### Go

**关键字**: `import`

**模式**:
```go
import "fmt"                                → fmt
import "github.com/gin-gonic/gin"          → github.com/gin-gonic/gin
import (
    "os"                                   → os
    "net/http"                             → net/http
)
```

**提取方法**:
1. 匹配单行: `/^import\s+"(.+?)"/gm`
2. 匹配块: `/import\s*\(([\s\S]*?)\)/gm`

#### C/C++

**关键字**: `#include`

**模式**:
```cpp
#include <iostream>                         → iostream
#include <vector>                           → vector
#include "utils.h"                          → utils.h
#include "../common/types.h"                → ../common/types.h
```

**提取方法**:
1. 匹配: `/#include\s+[<"](.+?)[>"]/g`
2. 区分系统头文件 (`<>`) 和本地头文件 (`""`)

#### C#

**关键字**: `using`

**模式**:
```csharp
using System;                               → System
using System.Collections.Generic;           → System.Collections.Generic
using static System.Math;                   → System.Math
using Project.Models;                       → Project.Models
```

**提取方法**:
1. 匹配: `/^using\s+(?:static\s+)?(.+?);/gm`

#### PHP

**关键字**: `use`, `require`, `include`

**模式**:
```php
use Illuminate\Support\Facades\DB;          → Illuminate\Support\Facades\DB
use App\Models\User;                        → App\Models\User
require_once 'config.php';                  → config.php
include '../helpers/auth.php';              → ../helpers/auth.php
```

**提取方法**:
1. 匹配: `/^use\s+(.+?);/gm`
2. 匹配: `/(?:require|include)(?:_once)?\s+['"](.+?)['"]/g`

#### Ruby

**关键字**: `require`, `require_relative`

**模式**:
```ruby
require 'active_record'                     → active_record
require 'rails/all'                         → rails/all
require_relative '../models/user'           → ../models/user
```

**提取方法**:
1. 匹配: `/require(?:_relative)?\s+['"](.+?)['"]/g`

#### Swift

**关键字**: `import`

**模式**:
```swift
import Foundation                           → Foundation
import UIKit                                → UIKit
import SwiftUI                              → SwiftUI
```

**提取方法**:
1. 匹配: `/^import\s+(\S+)/gm`

---

## 分类策略

### 内部依赖 (Internal Dependencies)

**特征**: 相对路径或项目内路径

- 以 `.`, `..`, `@/` 开头
- 包含项目特定路径 (如 `src/`, `app/`)

**示例**:
```
./utils
../models/User
@/components/Button
src/services/auth
```

### 外部依赖 (External Dependencies)

**特征**: 第三方库或标准库

- 不是相对路径
- 来自包管理器 (npm, pip, maven, cargo, etc.)

**示例**:
```
react
lodash
numpy
java.util.List
std::vector
```

---

## 处理逻辑

### 步骤 1: 语言识别

根据 `fileExtension` 映射到语言:

```
.js, .jsx, .mjs, .cjs → JavaScript
.ts, .tsx → TypeScript
.py → Python
.java → Java
.kt, .kts → Kotlin
.rs → Rust
.go → Go
.c, .cpp, .cc, .h, .hpp → C/C++
.cs → C#
.php → PHP
.rb → Ruby
.swift → Swift
```

### 步骤 2: 提取依赖

根据语言使用对应的正则表达式提取依赖语句。

**伪代码**:
```
根据语言选择关键字和模式
对每个匹配:
  提取依赖路径
  去除引号、分号等语法符号
  添加到依赖列表
```

### 步骤 3: 分类

遍历依赖列表,根据路径特征分类:

```
对每个依赖:
  如果是相对路径 (. / ..) → internalDeps
  如果是项目内路径 (src/, app/) → internalDeps
  否则 → externalDeps
```

### 步骤 4: 去重和排序

```
dependencies = internalDeps + externalDeps
去重 (Set)
排序 (字母顺序)
  - 内部依赖优先
  - 按路径长度排序 (短 → 长)
  - 字母顺序
```

### 步骤 5: 格式化输出

根据 `language` 参数格式化依赖列表:

**zh-CN**:
```
内部依赖: ./utils, ../models/User
外部依赖: react, lodash, express
```

**en-US**:
```
Internal: ./utils, ../models/User
External: react, lodash, express
```

---

## 边界情况处理

### 1. 动态导入

```javascript
// 字符串变量导入 - 跳过
const moduleName = 'lodash'
const module = require(moduleName)

// 条件导入 - 提取
if (process.env.NODE_ENV === 'production') {
  const analytics = require('analytics')    → analytics
}
```

### 2. 注释中的导入语句

**忽略注释中的代码**:

```javascript
// import React from 'react'  ← 忽略
/*
import Vue from 'vue'         ← 忽略
*/
import lodash from 'lodash'   ← 提取
```

**处理方法**: 先删除注释再分析

### 3. 多行导入

```javascript
import {
  Button,
  Input,
  Select
} from 'antd'                 → antd
```

**处理方法**: 使用多行模式正则

### 4. 别名导入

```typescript
import * as utils from './utils'             → ./utils
import type { User as UserType } from './types' → ./types
```

**处理方法**: 提取 `from` 后的路径

---

## 性能优化

### 1. 缓存正则表达式

预编译常用正则,避免重复创建:

```
const PATTERNS = {
  js: {
    import: /import\s+(?:.*?\s+from\s+)?['"](.+?)['"]/g,
    require: /require\s*\(['"](.+?)['"]\)/g
  },
  py: {
    import: /^import\s+(\S+)/gm,
    from: /^from\s+(\S+)\s+import/gm
  },
  ...
}
```

### 2. 提前退出

如果文件不包含依赖关键字,提前返回空列表:

```
if (!fileContent.includes('import') &&
    !fileContent.includes('require') &&
    !fileContent.includes('from')) {
  return { dependencies: [], internalDeps: [], externalDeps: [] }
}
```

### 3. 限制扫描范围

仅扫描文件前 N 行 (大部分依赖在文件顶部):

```
const topLines = fileContent.split('\n').slice(0, 100).join('\n')
// 仅分析前100行
```

---

## 错误处理

### 1. 无法识别的语言

```
if (!supportedLanguages.includes(language)) {
  返回警告: "不支持的语言: {language}"
  返回空依赖列表
}
```

### 2. 损坏的导入语句

```
try {
  提取依赖
} catch (error) {
  记录错误但继续处理其他依赖
  返回部分结果
}
```

### 3. 超大文件

```
if (fileContent.length > 1MB) {
  仅分析前 100KB
  添加警告: "文件过大,仅分析部分内容"
}
```

---

## 使用示例

### 示例 1: JavaScript 文件

**输入**:
```javascript
import React from 'react'
import { Button } from 'antd'
import utils from './utils'
import type { User } from '../types/user'

const express = require('express')
```

**输出**:
```json
{
  "dependencies": ["./utils", "../types/user", "react", "antd", "express"],
  "internalDeps": ["./utils", "../types/user"],
  "externalDeps": ["react", "antd", "express"]
}
```

### 示例 2: Python 文件

**输入**:
```python
import os
import sys
from models import User, Post
from .utils import helper
from django.conf import settings
```

**输出**:
```json
{
  "dependencies": [".utils", "models", "os", "sys", "django.conf"],
  "internalDeps": [".utils", "models"],
  "externalDeps": ["os", "sys", "django.conf"]
}
```

---

## 总结

依赖分析器通过识别不同编程语言的导入语法,提取文件的依赖关系。

**关键特性**:
- ✅ 支持 10+ 种编程语言
- ✅ 区分内部/外部依赖
- ✅ 去重和排序
- ✅ 边界情况处理
- ✅ 性能优化

**下一步**: 参见 [export-parser.md](./export-parser.md) 了解导出分析
