# Windsurf 示例项目

这是一个演示如何在 Windsurf 中使用分形多级索引系统的完整示例项目。

## 项目结构

```
windsurf-example/
├── .windsurf/
│   ├── rules/
│   │   ├── doc-maintenance.md       # 主规则文件
│   │   └── index-system-prompt.md   # 索引系统说明
│   └── index-config.json            # 配置文件
├── .windsurfrules                    # 全局规则
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── utils/
├── PROJECT_INDEX.md
└── README.md
```

## 快速开始

### 1. 打开项目

在 Windsurf 中打开此示例项目:

```bash
windsurf examples/windsurf-example
```

### 2. 查看配置

Windsurf 会自动读取以下配置:

- [.windsurfrules](.windsurfrules) - 全局规则
- [.windsurf/rules/doc-maintenance.md](.windsurf/rules/doc-maintenance.md) - 文档维护规则

### 3. 测试流程

在 Windsurf Chat 中尝试:

```
请在 src/services/user.service.ts 中添加一个新的导入:
import { EmailService } from './email.service';
```

**期望结果**: AI 应该自动更新索引系统。

### 4. 手动触发

如果需要手动更新:

```
请检查并更新索引系统
```

## 与 Cursor 的差异

Windsurf 和 Cursor 在索引系统使用上基本相同,主要差异:

1. **配置目录**: `.windsurf/` 代替 `.cursor/`
2. **全局规则**: `.windsurfrules` 代替 `.cursorrules`
3. **AI 模型**: Windsurf 使用不同的 AI 模型,理解能力可能不同

## 常见问题

### Q: Windsurf 支持自动更新吗?

**A**: 与 Cursor 类似,Windsurf 也需要 AI 主动理解规则。建议:
- 在对话开始时提醒 AI 遵守规则
- 定期手动触发更新
- 使用明确的提示词

### Q: 如何优化 Windsurf 的自动化?

**A**:
1. 在 `.windsurfrules` 中明确声明规则
2. 使用 Windsurf 的 Flow 模式进行复杂操作
3. 定期检查一致性

## 更多信息

参考 [Cursor 示例](../cursor-example/README.md) 了解详细使用方法,两者操作基本一致。
