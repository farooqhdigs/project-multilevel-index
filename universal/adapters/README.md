# 平台适配器开发指南

欢迎贡献新平台的适配器!本指南将帮助您为分形索引系统添加新平台支持。

## 📖 目录

1. [什么是适配器](#什么是适配器)
2. [快速开始](#快速开始)
3. [接口规范](#接口规范)
4. [开发流程](#开发流程)
5. [测试清单](#测试清单)
6. [提交 PR](#提交-pr)

---

## 什么是适配器?

适配器是连接**分形索引系统核心引擎**与**特定 AI 编辑器平台**的桥梁。

```
┌─────────────────┐
│  核心引擎       │  ← 平台无关,所有平台共享
│  (Core Engine)  │
└────────┬────────┘
         │
         │ 通过接口调用
         │
┌────────▼────────┐
│  适配器         │  ← 平台特定,处理平台差异
│  (Adapter)      │
└────────┬────────┘
         │
┌────────▼────────┐
│  平台 API       │  ← Claude Code / Cursor / Kiro 等
│  (Platform)     │
└─────────────────┘
```

**适配器的职责**:
- 实现 [平台接口](../core/platform-interface.md) 定义的方法
- 处理平台特定的 API 调用
- 生成平台特定的配置文件
- 适配不同的触发机制

---

## 快速开始

### 步骤 1: 复制模板

```bash
cd universal/adapters/
cp -r _template/ your-platform/
cd your-platform/
```

### 步骤 2: 编辑 adapter.md

打开 `your-platform/adapter.md`,按照注释填写:

```markdown
# 平台名称: YourPlatform

## 平台信息
name: YourPlatform
automation_level: semi_auto  # full | semi_auto | manual
...

## 接口实现
### readFile(path)
实现细节...
```

### 步骤 3: 添加平台配置

编辑 `universal/.kiro/specs/platforms.yml`,添加您的平台:

```yaml
your_platform:
  name: YourPlatform
  config_location: .yourplatform/
  trigger_mechanism: embedded_reminders
  ...
```

### 步骤 4: 创建示例项目

在 `examples/your-platform-example/` 创建一个完整的示例。

### 步骤 5: 测试

按照 [测试清单](#测试清单) 验证所有功能。

---

## 接口规范

适配器必须实现以下接口方法。详细规范见 [platform-interface.md](../core/platform-interface.md)

### 必需接口 (Required)

| 方法 | 功能 | 优先级 |
|-----|------|--------|
| `readFile(path)` | 读取文件内容 | P0 |
| `writeFile(path, content)` | 写入新文件 | P0 |
| `editFile(path, old, new)` | 编辑现有文件 | P0 |
| `scanFiles(root, patterns)` | 扫描文件系统 | P0 |
| `getProjectRoot()` | 获取项目根目录 | P0 |
| `getLanguage()` | 获取用户语言设置 | P0 |

### 推荐接口 (Recommended)

| 方法 | 功能 | 优先级 |
|-----|------|--------|
| `askConfirmation(message)` | 询问用户确认 | P1 |
| `showMessage(message, type)` | 显示消息 | P1 |
| `loadLanguageFiles(lang)` | 加载语言文件 | P1 |
| `getPlatformCapabilities()` | 查询平台能力 | P2 |

### 可选接口 (Optional)

| 方法 | 功能 | 优先级 |
|-----|------|--------|
| `generatePlatformConfig()` | 生成平台配置 | P2 |
| `enableAutoTrigger()` | 启用自动触发 | P3 |

---

## 开发流程

### 阶段 1: 调研平台特性

回答以下问题:

1. **文件操作 API**:
   - 如何读取文件?
   - 如何写入文件?
   - 是否支持批量操作?

2. **触发机制**:
   - 是否有 Hook 系统?
   - 是否支持文件监听?
   - 是否依赖 AI 理解嵌入提醒?

3. **配置方式**:
   - 配置文件存放在哪里?
   - 配置文件格式是什么? (JSON / YAML / Markdown)
   - 是否支持文件引用? (如 `@filename`, `#[[file:path]]`)

4. **用户交互**:
   - 如何显示消息?
   - 如何询问用户?
   - 是否支持进度条?

### 阶段 2: 实现核心接口

**优先级顺序**:

#### P0 - 基础功能 (必须实现)

1. **文件读写**
   ```markdown
   ### readFile(path)
   调用平台的文件读取 API
   返回文件内容字符串

   ### writeFile(path, content)
   调用平台的文件写入 API
   如果目录不存在,自动创建
   ```

2. **文件扫描**
   ```markdown
   ### scanFiles(rootPath, patterns)
   递归扫描目录
   应用 include/exclude 模式
   返回文件路径列表
   ```

#### P1 - 用户体验 (推荐实现)

3. **用户交互**
   ```markdown
   ### askConfirmation(message)
   显示 Yes/No 问题
   等待用户回答

   ### showMessage(message, type)
   根据 type 使用不同样式:
   - info: 蓝色/普通
   - success: 绿色/✅
   - warning: 黄色/⚠️
   - error: 红色/❌
   ```

#### P2 - 平台集成 (可选实现)

4. **配置生成**
   ```markdown
   ### generatePlatformConfig(targetPath, language)
   生成平台特定配置文件
   例如:
   - Cursor: .cursor/rules/doc-maintenance.md
   - Kiro: .kiro/steering/index-system.md
   - Windsurf: .windsurf/config.json
   ```

### 阶段 3: 处理平台差异

#### 情况 A: 完全自动化平台 (如 Claude Code)

```markdown
**特点**: 有 Hook 系统,可自动监听文件变化

**实现策略**:
1. 在 hooks.json 配置 PostToolUse Hook
2. Hook 触发 → 调用 universal/core/generator/update-workflow.md
3. 自动更新,无需用户干预

**自动化级别**: full
```

#### 情况 B: 半自动化平台 (如 Cursor, Kiro)

```markdown
**特点**: 支持规则文件或 Spec,但需 AI 理解提醒

**实现策略**:
1. 生成规则文件/Spec 文件
2. 在文档中嵌入自引用提醒:
   "🔄 当你修改代码文件时,检测结构性变化并调用 universal/core/generator/update-workflow.md"
3. 依赖 AI 理解并执行

**自动化级别**: semi_auto
```

#### 情况 C: 手动触发平台 (如 Windsurf, Copilot)

```markdown
**特点**: 无 Hook 系统,无文件引用能力

**实现策略**:
1. 生成指令文件 (静态内联核心指令)
2. 提供明确的命令列表:
   - "运行初始化: <详细步骤>"
   - "运行更新: <详细步骤>"
3. 用户手动执行

**自动化级别**: manual
```

### 阶段 4: 测试验证

使用 [_template/test-checklist.md](./_template/test-checklist.md) 测试:

- ✅ 初始化功能正常
- ✅ 更新功能正常
- ✅ 检查功能正常
- ✅ 国际化支持
- ✅ 错误处理

---

## 测试清单

### 功能测试

#### 1. 初始化测试

- [ ] 在空项目中运行初始化
- [ ] 生成 PROJECT_INDEX.md
- [ ] 生成 FOLDER_INDEX.md (每个代码文件夹)
- [ ] 生成文件头注释 (每个代码文件)
- [ ] 支持至少 3 种编程语言 (如 JS, Python, Java)

#### 2. 更新测试

- [ ] 修改文件的 import/export 语句
- [ ] 触发结构性更新 (文件头 + FOLDER_INDEX + PROJECT_INDEX)
- [ ] 仅修改实现细节
- [ ] 正确跳过更新

#### 3. 检查测试

- [ ] 检测文件缺失头部注释
- [ ] 检测 FOLDER_INDEX 与实际文件不一致
- [ ] 检测循环依赖
- [ ] 生成检查报告

#### 4. 国际化测试

- [ ] 切换到中文 (zh-CN)
- [ ] 切换到英文 (en-US)
- [ ] 所有消息正确显示
- [ ] 模板正确应用

### 性能测试

- [ ] 小项目 (<50 文件): 初始化 < 30 秒
- [ ] 中型项目 (100-500 文件): 初始化 < 2 分钟
- [ ] 大型项目 (1000+ 文件): 不崩溃,提供进度反馈

### 兼容性测试

- [ ] Windows
- [ ] macOS
- [ ] Linux
- [ ] 不与现有工具链冲突
- [ ] 尊重 .gitignore 规则

### 错误处理测试

- [ ] 文件权限不足
- [ ] 文件不存在
- [ ] 配置文件损坏
- [ ] 用户取消操作

---

## 提交 PR

### 准备工作

1. **完成开发**
   - 所有接口方法已实现
   - 通过测试清单
   - 代码注释清晰

2. **准备文档**
   - 编写 `your-platform/README.md`
   - 说明安装和使用方法
   - 提供示例项目

3. **更新主文档**
   - 在 `universal/docs/PLATFORM_GUIDE.md` 添加您的平台
   - 在 `README.md` 的平台对比表中添加一行

### PR 清单

- [ ] 代码通过所有测试
- [ ] 文档完整清晰
- [ ] 遵循代码风格
- [ ] 提供示例项目
- [ ] 更新 CHANGELOG.md

### PR 标题格式

```
feat(adapter): Add {Platform Name} adapter
```

### PR 描述模板

```markdown
## 平台信息
- **平台名称**: YourPlatform
- **自动化级别**: semi_auto
- **触发机制**: embedded_reminders

## 实现特性
- [x] 文件读写
- [x] 文件扫描
- [x] 用户交互
- [x] 配置生成

## 测试情况
- [x] 功能测试通过
- [x] 性能测试通过
- [x] 兼容性测试通过

## 示例项目
见 `examples/your-platform-example/`

## 截图/演示
(可选) 添加演示 GIF 或截图
```

---

## 现有适配器参考

### 最佳实践示例

1. **Claude Code 适配器** (`claude-code/adapter.md`)
   - 完整实现所有接口
   - 使用 Hooks 系统自动触发
   - 完全自动化,零配置

2. **Cursor 适配器** (`cursor/adapter.md`)
   - 使用 `.cursor/rules` 配置
   - 嵌入式提醒触发更新
   - 半自动化,依赖 AI 理解

3. **Kiro 适配器** (`kiro/adapter.md`)
   - 使用 Spec 驱动生成
   - `#[[file:path]]` 文件引用
   - 半自动化,最强文件引用能力

---

## 常见问题

### Q: 我的平台不支持文件引用,怎么办?

**A**: 使用静态内联方式。将核心指令直接嵌入配置文件中,而非引用外部文件。

示例:
```markdown
# .yourplatform/config.md

## 索引系统维护规则

当修改代码文件时:
1. 检测 import/export 变化
2. 更新文件头注释
3. 更新 FOLDER_INDEX.md
...

(内联完整的维护逻辑)
```

### Q: 我的平台无法自动触发更新,怎么办?

**A**: 提供清晰的手动命令指南。在配置文件中明确列出:

```markdown
## 使用方法

### 初始化索引系统
<详细步骤...>

### 更新索引
<详细步骤...>

请在修改代码后手动运行更新命令。
```

### Q: 如何处理平台特有的限制?

**A**: 在适配器中添加限制说明和变通方案:

```markdown
## 平台限制

1. **不支持批量文件操作**
   - 影响: 初始化速度较慢
   - 变通: 提供进度提示,每 10 个文件输出一次

2. **不支持文件监听**
   - 影响: 无法自动触发
   - 变通: 提供手动命令和提醒
```

---

## 社区支持

- **GitHub Discussions**: 讨论设计思路
- **Issues**: 报告问题和 Bug
- **Wiki**: 分享最佳实践和经验

---

## 致谢

感谢您为分形索引系统的多平台支持做出贡献!您的工作将帮助更多开发者受益于自动化文档维护。

---

**下一步**:
1. 阅读 [平台接口文档](../core/platform-interface.md)
2. 查看 [Claude Code 适配器](./claude-code/adapter.md) 示例
3. 复制 [_template](./_template/) 开始开发
