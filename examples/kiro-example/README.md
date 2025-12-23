# Kiro 示例项目

这是一个演示如何在 Kiro 中使用分形多级索引系统的完整示例项目。

## 项目结构

```
kiro-example/
├── .kiro/
│   ├── rules/
│   │   ├── doc-maintenance.md       # 主规则文件
│   │   └── index-system-prompt.md   # 索引系统说明
│   └── index-config.json            # 配置文件
├── .kirorules                        # 全局规则
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

在 Kiro 中打开此示例项目:

```bash
kiro examples/kiro-example
```

### 2. 查看配置

Kiro 会自动读取以下配置:

- [.kirorules](.kirorules) - 全局规则
- [.kiro/rules/doc-maintenance.md](.kiro/rules/doc-maintenance.md) - 文档维护规则

### 3. 测试流程

在 Kiro Chat 中尝试:

```
请在 src/services/user.service.ts 中添加一个新的导入:
import { EmailService } from './email.service';
```

**期望结果**: AI 应该自动更新索引系统。

## 与 Cursor/Windsurf 的差异

Kiro 的使用方式与 Cursor/Windsurf 基本相同:

1. **配置目录**: `.kiro/` 代替 `.cursor/`
2. **全局规则**: `.kirorules` 代替 `.cursorrules`
3. **规则文件**: 内容和格式相同

## 常见问题

### Q: Kiro 支持自动更新吗?

**A**: 与 Cursor/Windsurf 类似,Kiro 也需要 AI 主动理解规则。建议:
- 在对话开始时提醒 AI 遵守规则
- 定期手动触发更新
- 使用明确的提示词

## 更多信息

参考 [Cursor 示例](../cursor-example/README.md) 了解详细使用方法。
