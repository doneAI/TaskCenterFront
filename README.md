# 分布式任务调度系统管理后台

基于React + TypeScript + Ant Design构建的现代化Web管理后台，提供直观的系统监控和管理界面。

## 功能特性

### 🎯 核心功能
- **系统概览仪表板**: 实时显示关键指标和图表
- **GPU管理**: 完整的GPU节点管理和监控
- **任务监控**: 任务状态跟踪和进度监控
- **健康检查**: 系统健康状态监控
- **告警管理**: 告警信息展示和处理
- **系统设置**: API配置和显示设置

### 🚀 技术特性
- **现代化技术栈**: React 18 + TypeScript + Ant Design
- **状态管理**: Redux Toolkit
- **图表可视化**: ECharts
- **响应式设计**: 支持桌面和移动设备
- **实时更新**: 自动数据刷新
- **主题切换**: 深色/浅色主题

## 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env.example` 为 `.env` 并修改配置：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# API配置
REACT_APP_API_BASE_URL=http://localhost:8080/api/v2
REACT_APP_API_KEY=your-api-key

# 应用配置
REACT_APP_TITLE=分布式任务调度系统管理后台
REACT_APP_VERSION=1.0.0

# 开发配置
REACT_APP_DEBUG=true
REACT_APP_AUTO_REFRESH=true
REACT_APP_REFRESH_INTERVAL=30000
```

### 启动开发服务器
```bash
npm start
```

访问 http://localhost:3000 查看应用。

### 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── components/          # 通用组件
│   ├── Layout/         # 布局组件
│   └── Charts/         # 图表组件
├── pages/              # 页面组件
│   ├── Dashboard/      # 仪表板
│   ├── GpuManagement/ # GPU管理
│   ├── TaskMonitoring/ # 任务监控
│   ├── HealthCheck/    # 健康检查
│   ├── AlertManagement/ # 告警管理
│   └── Settings/       # 系统设置
├── services/          # API服务
│   ├── api.ts         # API配置
│   ├── gpu.ts         # GPU相关API
│   ├── task.ts        # 任务相关API
│   ├── monitoring.ts  # 监控相关API
│   └── alert.ts       # 告警相关API
├── store/             # 状态管理
│   ├── index.ts       # Store配置
│   └── slices/        # Redux slices
├── hooks/             # 自定义Hooks
├── types/             # 类型定义
└── styles/            # 样式文件
```

## 功能模块

### 1. 系统概览仪表板
- 关键指标展示（活跃GPU、总任务数、队列长度、失败任务数）
- 实时图表（任务执行趋势、GPU状态分布、任务状态分布）
- 系统健康状态监控

### 2. GPU管理
- GPU节点列表展示
- GPU状态管理（活跃、离线、故障）
- GPU操作（心跳、故障标记、恢复）
- 按任务类型和优先级查询GPU
- 添加新GPU节点

### 3. 任务监控
- 任务列表展示
- 任务状态筛选和搜索
- 任务详情查看
- 任务进度跟踪
- 任务结果查看

### 4. 健康检查
- 整体健康状态监控
- 组件健康详情
- 系统资源使用率
- 集群状态信息

### 5. 告警管理
- 告警列表展示
- 告警级别筛选
- 告警确认处理
- 告警统计信息

### 6. 系统设置
- API配置管理
- 显示设置（刷新间隔、主题、语言）
- 系统信息展示
- 设置重置功能

## API接口

项目基于RESTful API设计，主要接口包括：

### 监控相关
- `GET /monitoring/overview` - 获取监控概览
- `GET /monitoring/health` - 获取健康状态
- `GET /monitoring/metrics` - 获取监控指标

### GPU管理
- `GET /gpus` - 获取GPU列表
- `POST /gpus/register` - 注册GPU
- `POST /gpus/{gpuId}/heartbeat` - GPU心跳
- `POST /gpus/{gpuId}/fault` - 标记GPU故障
- `POST /gpus/{gpuId}/recover` - 恢复GPU

### 任务管理
- `GET /tasks` - 获取任务列表
- `GET /tasks/{taskId}` - 获取任务详情
- `GET /tasks/{taskId}/progress` - 获取任务进度
- `POST /tasks` - 创建任务

### 告警管理
- `GET /monitoring/alerts` - 获取告警列表
- `POST /monitoring/alerts/{alertId}/acknowledge` - 确认告警
- `GET /monitoring/alerts/stats` - 获取告警统计

## 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 使用Prettier进行代码格式化

### 组件开发
- 使用函数式组件和Hooks
- 遵循单一职责原则
- 保持组件的可复用性

### 状态管理
- 使用Redux Toolkit进行状态管理
- 异步操作使用createAsyncThunk
- 保持状态的不可变性

### 样式规范
- 使用Ant Design组件库
- 自定义样式使用CSS模块
- 响应式设计优先

## 部署指南

### 构建配置
```bash
# 开发环境
npm start

# 生产构建
npm run build

# 测试
npm test
```

### Docker部署
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 环境变量
生产环境需要配置以下环境变量：
- `REACT_APP_API_BASE_URL`: API服务地址
- `REACT_APP_API_KEY`: API认证密钥

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 项目讨论区

---

**注意**: 这是一个演示项目，实际使用时请根据具体需求进行调整和优化。
