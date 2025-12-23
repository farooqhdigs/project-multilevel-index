# 导出分析器 (Export Parser)

## 功能

分析代码文件的导出内容,提取 **Output** (文件对外提供的接口)。

## 输入参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `fileContent` | string | 文件完整内容 |
| `fileExtension` | string | 文件扩展名 |
| `fileName` | string | 文件名 (不含路径) |

## 输出

| 字段 | 类型 | 说明 |
|------|------|------|
| `exports` | array | 导出列表 |
| `defaultExport` | string | 默认导出 (如果有) |
| `namedExports` | array | 命名导出列表 |

## 分析规则

### 语言特定的导出模式

#### JavaScript/TypeScript

**导出类型**:

1. **命名导出** (Named Exports)
```javascript
export function createUser() {}              → createUser
export const API_URL = 'https://...'        → API_URL
export class UserService {}                  → UserService
export { foo, bar }                          → foo, bar
export { foo as newName }                    → newName
```

2. **默认导出** (Default Export)
```javascript
export default class App {}                  → App (default)
export default function handler() {}         → handler (default)
export default { name: 'config' }            → config (default)
```

3. **重导出** (Re-export)
```javascript
export * from './utils'                      → *
export { User } from './models'              → User
```

**提取方法**:
- 匹配: `/export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)\s+(\w+)/g`
- 匹配: `/export\s+\{([^}]+)\}/g`
- 处理 `as` 别名重命名

#### Python

**导出模式**: 顶层定义 + `__all__`

1. **顶层函数和类**
```python
def create_user():                           → create_user
class User:                                  → User
async def fetch_data():                      → fetch_data
```

2. **显式导出列表**
```python
__all__ = ['User', 'create_user']           → User, create_user
```

**提取方法**:
- 优先使用 `__all__` 列表
- 否则提取顶层 `def`, `class`
- 忽略以 `_` 开头的私有定义

#### Java/Kotlin

**导出模式**: `public` 类和接口

```java
public class UserService {}                  → UserService
public interface IUserRepository {}          → IUserRepository
public enum UserRole {}                      → UserRole
public record User(String name) {}           → User
```

**Kotlin**:
```kotlin
class UserService {}                         → UserService (默认public)
interface UserRepository {}                  → UserRepository
data class User(val name: String)           → User
object Config {}                             → Config
```

**提取方法**:
- Java: 匹配 `public class/interface/enum/record`
- Kotlin: 匹配 `class/interface/data class/object` (默认public)

#### Rust

**导出模式**: `pub` 修饰符

```rust
pub fn create_user() {}                      → create_user
pub struct User {}                           → User
pub enum UserRole {}                         → UserRole
pub trait UserRepository {}                  → UserRepository
```

**提取方法**:
- 匹配: `/pub\s+(?:fn|struct|enum|trait|const|static)\s+(\w+)/g`

#### Go

**导出模式**: 大写开头的标识符

```go
func CreateUser() {}                         → CreateUser
type User struct {}                          → User
const MaxRetries = 3                         → MaxRetries
var GlobalConfig Config                      → GlobalConfig
```

**提取方法**:
- 匹配: `/^func\s+([A-Z]\w*)/gm`
- 匹配: `/^type\s+([A-Z]\w*)/gm`
- 匹配: `/^(?:const|var)\s+([A-Z]\w*)/gm`

#### C/C++

**头文件导出**: 声明即导出

```cpp
// .h / .hpp文件
class UserService {};                        → UserService
void createUser();                           → createUser
struct Config {};                            → Config
```

**实现文件**: 不分析导出 (由头文件决定)

**提取方法**:
- 仅分析 `.h`, `.hpp` 文件
- 匹配: `class`, `struct`, 函数声明

#### C#

**导出模式**: `public` 类和成员

```csharp
public class UserService {}                  → UserService
public interface IUserRepository {}          → IUserRepository
public enum UserRole {}                      → UserRole
public struct Point {}                       → Point
```

**提取方法**:
- 匹配: `/public\s+(?:class|interface|enum|struct)\s+(\w+)/g`

#### PHP

**导出模式**: 类和顶层函数

```php
class UserService {}                         → UserService
interface UserRepository {}                  → UserRepository
trait Loggable {}                            → Loggable
function createUser() {}                     → createUser
```

**提取方法**:
- 匹配: `/(?:class|interface|trait)\s+(\w+)/g`
- 匹配: `/function\s+(\w+)\s*\(/g` (顶层函数)

#### Ruby

**导出模式**: 类、模块、顶层方法

```ruby
class User                                   → User
module Authentication                        → Authentication
def create_user                              → create_user
```

**提取方法**:
- 匹配: `/^class\s+(\w+)/gm`
- 匹配: `/^module\s+(\w+)/gm`
- 匹配: `/^def\s+(\w+)/gm`

#### Swift

**导出模式**: `public`/`open` 修饰符

```swift
public class UserService {}                  → UserService
open class BaseViewController {}             → BaseViewController
public func createUser() {}                  → createUser
public struct User {}                        → User
```

**提取方法**:
- 匹配: `/(?:public|open)\s+(?:class|struct|func|var|let)\s+(\w+)/g`

---

## 分类策略

### 默认导出 (Default Export)

**特征**: 模块的主要导出

- JavaScript/TypeScript: `export default`
- Python: 如果只有一个类,视为默认导出
- 其他语言: 与文件名同名的类/函数

**示例**:
```javascript
// User.js
export default class User {}    → User (default)

// index.js
export { User } from './User'   → User (named)
```

### 命名导出 (Named Exports)

**特征**: 明确命名的导出项

- 可以有多个
- 需要通过名称引用
- 可以重命名

---

## 处理逻辑

### 步骤 1: 语言识别

根据 `fileExtension` 映射语言 (同 dependency-parser)

### 步骤 2: 提取导出

根据语言应用对应的模式提取导出项。

**伪代码**:
```
根据语言选择导出模式
对每个匹配:
  提取导出名称
  判断是否为默认导出
  添加到导出列表
```

### 步骤 3: 去重

移除重复的导出名称:

```
exports = [...new Set(exports)]
```

### 步骤 4: 排序

按类型和名称排序:

```
1. 默认导出 (如果有)
2. 类 (Class)
3. 接口/Trait (Interface/Trait)
4. 函数 (Function)
5. 常量/变量 (Const/Var)
```

### 步骤 5: 格式化输出

根据数量和类型格式化:

**单个导出**:
```
User
```

**多个导出 (≤5个)**:
```
createUser(), User, API_URL
```

**多个导出 (>5个)**:
```
createUser(), updateUser(), deleteUser(), User, ...(+3 more)
```

---

## 特殊情况处理

### 1. 文件扩展名推断

如果文件名与导出匹配,标记为默认导出:

```
// User.ts
class User {}              → User (默认,因为匹配文件名)
class UserService {}       → UserService (命名)
```

### 2. 索引文件 (Index Files)

`index.js`, `__init__.py`, `mod.rs` 通常重导出其他模块:

```javascript
// index.js
export { User } from './User'
export { Post } from './Post'
→ 导出: User, Post (重导出)
```

### 3. 类型导出 (TypeScript)

```typescript
export type User = { name: string }         → User (type)
export interface IUser { name: string }     → IUser (interface)
```

**处理**: 标记类型导出,但仍然列入导出列表

### 4. 私有导出

忽略明确标记为私有的导出:

- Python: `_private_func`
- JavaScript: 未 `export` 的内容
- Java: `private`, `protected`

---

## 性能优化

### 1. 快速扫描

检查文件是否包含导出关键字:

```
if (!fileContent.includes('export') &&
    !fileContent.includes('public') &&
    !fileContent.includes('pub')) {
  // 可能无导出,快速分析顶层定义
}
```

### 2. 限制扫描深度

导出通常在文件顶层,不分析嵌套定义:

```
// 提取
export function foo() {
  // 不提取
  function bar() {}
}
```

### 3. 缓存解析结果

对于大型文件,缓存已解析的导出列表。

---

## 错误处理

### 1. 语法错误

```
try {
  解析导出
} catch (error) {
  返回警告: "无法解析导出,可能存在语法错误"
  返回空列表
}
```

### 2. 复杂表达式

跳过难以静态分析的导出:

```javascript
// 跳过
const exports = getExports()
export { exports }
```

### 3. 动态导出

记录警告但尝试提取:

```javascript
// 提取部分
export const dynamic = process.env.NODE_ENV === 'prod' ? A : B
→ 导出: dynamic (+ 警告)
```

---

## 使用示例

### 示例 1: JavaScript/TypeScript

**输入**:
```typescript
export function createUser(name: string): User {
  return new User(name)
}

export class User {
  constructor(public name: string) {}
}

export const API_URL = 'https://api.example.com'

export default UserService
```

**输出**:
```json
{
  "exports": ["UserService", "createUser", "User", "API_URL"],
  "defaultExport": "UserService",
  "namedExports": ["createUser", "User", "API_URL"]
}
```

### 示例 2: Python

**输入**:
```python
__all__ = ['User', 'create_user']

class User:
    def __init__(self, name):
        self.name = name

def create_user(name):
    return User(name)

def _private_helper():
    pass
```

**输出**:
```json
{
  "exports": ["User", "create_user"],
  "defaultExport": null,
  "namedExports": ["User", "create_user"]
}
```

### 示例 3: Rust

**输入**:
```rust
pub struct User {
    pub name: String,
}

pub fn create_user(name: String) -> User {
    User { name }
}

pub enum UserRole {
    Admin,
    User,
}

fn private_helper() {}
```

**输出**:
```json
{
  "exports": ["User", "create_user", "UserRole"],
  "defaultExport": null,
  "namedExports": ["User", "create_user", "UserRole"]
}
```

---

## 总结

导出分析器识别文件对外提供的接口,帮助理解模块的公开 API。

**关键特性**:
- ✅ 支持 10+ 种编程语言
- ✅ 区分默认/命名导出
- ✅ 处理重导出
- ✅ 忽略私有成员
- ✅ 性能优化

**下一步**: 参见 [position-inferrer.md](./position-inferrer.md) 了解定位推断
