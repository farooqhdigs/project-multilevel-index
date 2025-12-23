# 位置推断器 (Position Inferrer)

## 功能

根据文件路径、文件名和代码特征,推断文件在系统架构中的**定位 (Pos)**。

## 输入参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `filePath` | string | 文件完整路径 |
| `fileName` | string | 文件名 (不含扩展名) |
| `fileContent` | string | 文件内容 (可选,用于深度分析) |
| `exports` | array | 导出列表 (来自 export-parser) |
| `language` | string | 语言代码 (`zh-CN` / `en-US`) |

## 输出

| 字段 | 类型 | 说明 |
|------|------|------|
| `layer` | string | 架构层级 (如 "API层", "业务层") |
| `responsibility` | string | 职责描述 (如 "用户管理") |
| `position` | string | 完整定位 (格式: "{层级}-{职责}") |

## 推断策略

### 策略 1: 路径模式匹配 (优先级最高)

根据目录名称推断架构层级。

#### 路径关键字映射表

| 路径包含 | 层级 (zh-CN) | 层级 (en-US) | 说明 |
|---------|-------------|-------------|------|
| `controller`, `controllers`, `ctrl` | API层 | API Layer | HTTP接口、路由处理 |
| `route`, `routes`, `router`, `api` | API层 | API Layer | 路由定义、API端点 |
| `service`, `services` | 业务层 | Business Layer | 业务逻辑、规则 |
| `business`, `biz`, `logic` | 业务层 | Business Layer | 核心业务处理 |
| `model`, `models`, `entity`, `entities` | 数据层 | Data Layer | 数据模型、实体 |
| `dao`, `repository`, `repositories` | 数据层 | Data Layer | 数据访问对象 |
| `database`, `db`, `persistence` | 数据层 | Data Layer | 数据库操作 |
| `component`, `components`, `comp` | UI层 | UI Layer | UI组件 |
| `view`, `views`, `page`, `pages` | UI层 | UI Layer | 视图、页面 |
| `ui`, `frontend`, `client` | UI层 | UI Layer | 前端界面 |
| `middleware`, `middlewares` | 中间件层 | Middleware Layer | 中间件、拦截器 |
| `plugin`, `plugins`, `extension` | 中间件层 | Middleware Layer | 插件、扩展 |
| `util`, `utils`, `helper`, `helpers` | 工具层 | Utility Layer | 工具函数、辅助方法 |
| `lib`, `library`, `common` | 工具层 | Utility Layer | 公共库 |
| `config`, `configuration`, `settings` | 配置层 | Config Layer | 配置文件、设置 |
| `constant`, `constants`, `enum`, `enums` | 配置层 | Config Layer | 常量、枚举 |
| `test`, `tests`, `__tests__`, `spec` | 测试层 | Test Layer | 测试代码 |
| `mock`, `mocks`, `fixture`, `fixtures` | 测试层 | Test Layer | 测试数据 |

**匹配逻辑**:
```
对每个路径段:
  如果路径包含关键字:
    返回对应层级
    break
```

**示例**:
```
src/controllers/userController.ts → API层
src/services/authService.ts → 业务层
src/models/User.ts → 数据层
src/components/Button.tsx → UI层
src/middlewares/auth.ts → 中间件层
src/utils/format.ts → 工具层
```

---

### 策略 2: 文件名模式识别 (次优先级)

根据文件名后缀或模式推断。

#### 文件名模式表

| 文件名模式 | 层级 | 说明 |
|-----------|------|------|
| `*.controller.*`, `*Controller.*` | API层 | 控制器 |
| `*.service.*`, `*Service.*` | 业务层 | 服务 |
| `*.model.*`, `*Model.*`, `*.entity.*` | 数据层 | 模型 |
| `*.component.*`, `*.vue`, `*.svelte` | UI层 | 组件 |
| `*.middleware.*`, `*Middleware.*` | 中间件层 | 中间件 |
| `*.util.*`, `*.helper.*`, `*Utils.*` | 工具层 | 工具 |
| `*.config.*`, `*.conf.*`, `config.*` | 配置层 | 配置 |
| `*.test.*`, `*.spec.*`, `*_test.*` | 测试层 | 测试 |

**示例**:
```
userController.ts → API层
authService.js → 业务层
User.model.ts → 数据层
Button.component.tsx → UI层
logger.middleware.ts → 中间件层
format.util.ts → 工具层
database.config.ts → 配置层
```

---

### 策略 3: 文件内容分析 (最低优先级)

当路径和文件名都无法推断时,分析文件内容。

#### 内容特征匹配

| 特征 | 层级 | 检测方法 |
|-----|------|---------|
| 包含 HTTP 方法注解 (`@Get`, `@Post`) | API层 | 正则匹配装饰器 |
| 继承自 `Controller`, `BaseController` | API层 | 分析继承关系 |
| 包含数据库操作 (`db.`, `query`, `execute`) | 数据层 | 关键字匹配 |
| 继承自 `Model`, `Entity`, `BaseModel` | 数据层 | 分析继承关系 |
| 包含 JSX/TSX 语法 (`<div>`, `<Component>`) | UI层 | 语法检测 |
| 导出 React 组件 | UI层 | 分析导出 |
| 仅包含纯函数,无状态 | 工具层 | 函数纯度分析 |

**示例**:
```typescript
// 检测到 @Get 装饰器 → API层
@Get('/users')
getUserList() {}

// 检测到 extends BaseModel → 数据层
class User extends BaseModel {}

// 检测到 JSX → UI层
function Button() {
  return <button>Click</button>
}
```

---

### 策略 4: 职责推断

根据文件名提取职责描述。

#### 提取方法

**1. 驼峰命名转换**

```
userController → User Controller → 用户控制器
authService → Auth Service → 认证服务
dataUtils → Data Utils → 数据工具
```

**2. 下划线/短横线分割**

```
user_controller → User Controller
auth-service → Auth Service
data_utils → Data Utils
```

**3. 去除通用后缀**

```
userController → user (去除 Controller)
authService → auth (去除 Service)
Button.component → Button (去除 .component)
```

**4. 领域词汇识别**

维护常见领域词汇表:

| 英文 | 中文 |
|------|------|
| user | 用户 |
| auth, authentication | 认证 |
| authorization | 授权 |
| product | 产品 |
| order | 订单 |
| payment | 支付 |
| notification | 通知 |
| email | 邮件 |
| file, upload | 文件 |
| search | 搜索 |
| analytics | 分析 |
| report | 报表 |
| dashboard | 仪表板 |
| settings | 设置 |

**职责格式化**:

- **zh-CN**: "{领域}管理" / "{领域}服务" / "{领域}组件"
- **en-US**: "{Domain} Service" / "{Domain} Component"

**示例**:
```
userController.ts → 用户管理控制器 / User Management Controller
authService.ts → 认证服务 / Authentication Service
Button.component.tsx → 按钮组件 / Button Component
formatUtils.ts → 格式化工具 / Format Utilities
```

---

## 组合策略

### 优先级顺序

```
1. 路径模式匹配 (最准确)
   ↓ 未匹配
2. 文件名模式识别
   ↓ 未匹配
3. 文件内容分析
   ↓ 未匹配
4. 默认定位 (通用层-{文件名})
```

### 完整推断流程

```
步骤 1: 分析文件路径
if 路径包含层级关键字:
  layer = 对应层级
  跳到步骤 4

步骤 2: 分析文件名
if 文件名匹配模式:
  layer = 对应层级
  跳到步骤 4

步骤 3: 分析文件内容 (可选)
if 内容包含特征:
  layer = 对应层级

步骤 4: 推断职责
responsibility = 从文件名提取

步骤 5: 组合定位
position = layer + "-" + responsibility
```

---

## 边界情况处理

### 1. 多层级文件夹

当路径包含多个层级关键字时,取最近的:

```
src/services/database/userRepository.ts
  包含: services (业务层), database (数据层)
  选择: 数据层 (更接近文件)
```

### 2. 混合职责文件

当文件同时具备多个层级特征时:

```
userServiceController.ts
  包含: service, controller
  选择: API层 (controller 权重更高)
```

### 3. 索引文件

`index.js`, `mod.rs`, `__init__.py` 等:

```
src/services/index.ts
  layer = 业务层 (继承自父目录)
  responsibility = 模块入口 / Module Entry
```

### 4. 测试文件

测试文件继承被测文件的层级:

```
userService.test.ts
  layer = 业务层 (userService) + 测试层
  position = 业务层-用户服务测试 / Business Layer-User Service Test
```

---

## 性能优化

### 1. 缓存正则表达式

预编译路径和文件名匹配模式。

### 2. 提前退出

一旦匹配到明确的层级,立即返回,不继续后续分析。

### 3. 跳过内容分析

仅在路径和文件名都无法推断时才分析内容,避免读取大文件。

---

## 多语言支持

### 中文输出 (zh-CN)

```
API层-用户管理
业务层-认证服务
数据层-用户模型
UI层-按钮组件
工具层-格式化工具
```

### 英文输出 (en-US)

```
API Layer-User Management
Business Layer-Authentication Service
Data Layer-User Model
UI Layer-Button Component
Utility Layer-Format Utilities
```

---

## 使用示例

### 示例 1: API 层文件

**输入**:
```
filePath: "src/controllers/userController.ts"
fileName: "userController"
language: "zh-CN"
```

**推断过程**:
1. 路径匹配: `controllers` → API层
2. 文件名: `userController` → 用户控制器
3. 组合: "API层-用户控制器"

**输出**:
```json
{
  "layer": "API层",
  "responsibility": "用户控制器",
  "position": "API层-用户控制器"
}
```

### 示例 2: 业务层文件

**输入**:
```
filePath: "src/services/auth/authService.ts"
fileName: "authService"
language: "en-US"
```

**推断过程**:
1. 路径匹配: `services` → Business Layer
2. 文件名: `authService` → Authentication Service
3. 组合: "Business Layer-Authentication Service"

**输出**:
```json
{
  "layer": "Business Layer",
  "responsibility": "Authentication Service",
  "position": "Business Layer-Authentication Service"
}
```

### 示例 3: UI 层文件

**输入**:
```
filePath: "src/components/Button/Button.tsx"
fileName: "Button"
language: "zh-CN"
```

**推断过程**:
1. 路径匹配: `components` → UI层
2. 文件名: `Button` → 按钮
3. 组合: "UI层-按钮组件"

**输出**:
```json
{
  "layer": "UI层",
  "responsibility": "按钮组件",
  "position": "UI层-按钮组件"
}
```

---

## 总结

位置推断器通过多策略组合,准确推断文件在系统架构中的位置。

**关键特性**:
- ✅ 三级推断策略 (路径 → 文件名 → 内容)
- ✅ 支持常见架构模式
- ✅ 多语言输出
- ✅ 边界情况处理
- ✅ 性能优化

**应用场景**:
- 自动生成文件头注释的 Pos 字段
- 项目架构可视化
- 代码组织合理性检查

**下一步**: 参见 [../generator/init-workflow.md](../generator/init-workflow.md) 了解如何使用分析器
