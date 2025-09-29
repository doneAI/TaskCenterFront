# 前端工程实现指南

## 项目初始化

### 1. 技术栈选择建议

#### React + TypeScript 方案（推荐）
```bash
# 创建项目
npx create-react-app task-scheduler-dashboard --template typescript
cd task-scheduler-dashboard

# 安装依赖
npm install @reduxjs/toolkit react-redux
npm install antd @ant-design/icons
npm install echarts echarts-for-react
npm install axios
npm install react-query
npm install dayjs
```

#### Vue 3 + TypeScript 方案
```bash
# 创建项目
npm create vue@latest task-scheduler-dashboard
cd task-scheduler-dashboard

# 安装依赖
npm install pinia
npm install element-plus
npm install echarts
npm install axios
npm install @vueuse/core
```

#### Angular 方案
```bash
# 创建项目
ng new task-scheduler-dashboard --routing --style=scss
cd task-scheduler-dashboard

# 安装依赖
ng add @ngrx/store
ng add @ngrx/effects
npm install ng-zorro-antd
npm install echarts
npm install axios
```

### 2. 项目结构配置

#### React 项目结构
```
src/
├── components/          # 通用组件
│   ├── Layout/         # 布局组件
│   ├── Charts/         # 图表组件
│   ├── Tables/         # 表格组件
│   └── Forms/          # 表单组件
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
│   ├── slices/        # Redux slices
│   └── middleware/    # 中间件
├── hooks/             # 自定义Hooks
├── utils/             # 工具函数
├── types/             # 类型定义
├── styles/            # 样式文件
└── assets/            # 静态资源
```

## 核心功能实现

### 1. API服务封装

#### API配置 (services/api.ts)
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v2';
const API_KEY = process.env.REACT_APP_API_KEY || 'xfsdfs3fsdfsdfasdfjoiojg';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### GPU相关API (services/gpu.ts)
```typescript
import apiClient from './api';
import { GpuNodeInfo, ApiResponse } from '../types';

export const gpuApi = {
  // 获取GPU列表
  getGpuList: (): Promise<ApiResponse<GpuNodeInfo[]>> => 
    apiClient.get('/gpus'),
  
  // 获取指定GPU信息
  getGpuById: (gpuId: string): Promise<ApiResponse<GpuNodeInfo>> => 
    apiClient.get(`/gpus/${gpuId}`),
  
  // 按任务类型获取GPU列表
  getGpusByTaskType: (taskType: number, priority?: string): Promise<ApiResponse<GpuNodeInfo[]>> => 
    apiClient.get(`/gpus/by-task-type/${taskType}`, { params: { priority } }),
  
  // 注册GPU
  registerGpu: (gpuInfo: Partial<GpuNodeInfo>): Promise<ApiResponse<string>> => 
    apiClient.post('/gpus/register', gpuInfo),
  
  // GPU心跳
  updateHeartbeat: (gpuId: string): Promise<ApiResponse<string>> => 
    apiClient.post(`/gpus/${gpuId}/heartbeat`),
  
  // 标记GPU为故障
  markGpuAsFaulty: (gpuId: string, reason: string): Promise<ApiResponse<string>> => 
    apiClient.post(`/gpus/${gpuId}/fault`, null, { params: { reason } }),
  
  // 恢复GPU
  recoverGpu: (gpuId: string): Promise<ApiResponse<string>> => 
    apiClient.post(`/gpus/${gpuId}/recover`),
  
  // 注销GPU
  unregisterGpu: (gpuId: string): Promise<ApiResponse<string>> => 
    apiClient.delete(`/gpus/${gpuId}`),
};
```

### 2. 状态管理实现

#### Redux Store配置 (store/index.ts)
```typescript
import { configureStore } from '@reduxjs/toolkit';
import gpuSlice from './slices/gpuSlice';
import taskSlice from './slices/taskSlice';
import monitoringSlice from './slices/monitoringSlice';
import alertSlice from './slices/alertSlice';

export const store = configureStore({
  reducer: {
    gpu: gpuSlice,
    task: taskSlice,
    monitoring: monitoringSlice,
    alert: alertSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### GPU状态管理 (store/slices/gpuSlice.ts)
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { gpuApi } from '../../services/gpu';
import { GpuNodeInfo } from '../../types';

interface GpuState {
  gpuList: GpuNodeInfo[];
  loading: boolean;
  error: string | null;
  selectedGpu: GpuNodeInfo | null;
  filters: {
    status?: string;
    taskType?: number;
    priority?: string;
  };
}

const initialState: GpuState = {
  gpuList: [],
  loading: false,
  error: null,
  selectedGpu: null,
  filters: {},
};

// 异步actions
export const fetchGpuList = createAsyncThunk(
  'gpu/fetchGpuList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gpuApi.getGpuList();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGpusByTaskType = createAsyncThunk(
  'gpu/fetchGpusByTaskType',
  async ({ taskType, priority }: { taskType: number; priority?: string }, { rejectWithValue }) => {
    try {
      const response = await gpuApi.getGpusByTaskType(taskType, priority);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGpuHeartbeat = createAsyncThunk(
  'gpu/updateHeartbeat',
  async (gpuId: string, { rejectWithValue }) => {
    try {
      const response = await gpuApi.updateHeartbeat(gpuId);
      return { gpuId, response: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const gpuSlice = createSlice({
  name: 'gpu',
  initialState,
  reducers: {
    setSelectedGpu: (state, action: PayloadAction<GpuNodeInfo | null>) => {
      state.selectedGpu = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<GpuState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGpuList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGpuList.fulfilled, (state, action) => {
        state.loading = false;
        state.gpuList = action.payload;
      })
      .addCase(fetchGpuList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateGpuHeartbeat.fulfilled, (state, action) => {
        const { gpuId } = action.payload;
        const gpu = state.gpuList.find(g => g.gpuId === gpuId);
        if (gpu) {
          gpu.lastHeartbeat = Date.now();
        }
      });
  },
});

export const { setSelectedGpu, setFilters, clearError } = gpuSlice.actions;
export default gpuSlice.reducer;
```

### 3. 组件实现示例

#### GPU管理页面 (pages/GpuManagement/index.tsx)
```typescript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Button, Tag, Space, Input, Select, message } from 'antd';
import { 
  HeartOutlined, 
  ExclamationCircleOutlined, 
  ReloadOutlined,
  PlusOutlined 
} from '@ant-design/icons';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchGpuList, 
  updateGpuHeartbeat, 
  markGpuAsFaulty, 
  recoverGpu,
  setFilters 
} from '../../store/slices/gpuSlice';
import { GpuNodeInfo } from '../../types';

const GpuManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { gpuList, loading, error, filters } = useSelector((state: RootState) => state.gpu);

  useEffect(() => {
    dispatch(fetchGpuList());
  }, [dispatch]);

  const handleHeartbeat = async (gpuId: string) => {
    try {
      await dispatch(updateGpuHeartbeat(gpuId)).unwrap();
      message.success('心跳更新成功');
    } catch (error) {
      message.error('心跳更新失败');
    }
  };

  const handleMarkFaulty = async (gpuId: string) => {
    try {
      await dispatch(markGpuAsFaulty({ gpuId, reason: '手动标记' })).unwrap();
      message.success('GPU已标记为故障');
    } catch (error) {
      message.error('标记失败');
    }
  };

  const handleRecover = async (gpuId: string) => {
    try {
      await dispatch(recoverGpu(gpuId)).unwrap();
      message.success('GPU恢复成功');
    } catch (error) {
      message.error('恢复失败');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      ACTIVE: { color: 'green', text: '活跃' },
      OFFLINE: { color: 'orange', text: '离线' },
      FAULTY: { color: 'red', text: '故障' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns = [
    {
      title: 'GPU ID',
      dataIndex: 'gpuId',
      key: 'gpuId',
    },
    {
      title: '主机名',
      dataIndex: 'hostname',
      key: 'hostname',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '支持任务类型',
      dataIndex: 'supportedTaskTypes',
      key: 'supportedTaskTypes',
      render: (types: number[]) => types?.join(', ') || '-',
    },
    {
      title: '当前任务',
      key: 'currentTasks',
      render: (record: GpuNodeInfo) => 
        `${record.currentTasks || 0}/${record.maxConcurrentTasks || 0}`,
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      render: (timestamp: number) => 
        new Date(timestamp).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: GpuNodeInfo) => (
        <Space>
          <Button 
            size="small" 
            icon={<HeartOutlined />}
            onClick={() => handleHeartbeat(record.gpuId)}
          >
            心跳
          </Button>
          <Button 
            size="small" 
            danger
            icon={<ExclamationCircleOutlined />}
            onClick={() => handleMarkFaulty(record.gpuId)}
          >
            故障
          </Button>
          <Button 
            size="small" 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => handleRecover(record.gpuId)}
          >
            恢复
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="GPU管理" extra={
        <Space>
          <Button icon={<PlusOutlined />}>添加GPU</Button>
          <Button icon={<ReloadOutlined />} onClick={() => dispatch(fetchGpuList())}>
            刷新
          </Button>
        </Space>
      }>
        <Table
          columns={columns}
          dataSource={gpuList}
          loading={loading}
          rowKey="gpuId"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};

export default GpuManagement;
```

### 4. 图表组件实现

#### 任务趋势图表组件 (components/Charts/TaskTrendChart.tsx)
```typescript
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface TaskTrendChartProps {
  data: {
    completed: number[];
    failed: number[];
    labels: string[];
  };
}

const TaskTrendChart: React.FC<TaskTrendChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstance.current) {
      const option = {
        title: {
          text: '任务执行趋势',
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['完成任务', '失败任务'],
          top: 30,
        },
        xAxis: {
          type: 'category',
          data: data.labels,
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '完成任务',
            type: 'line',
            data: data.completed,
            smooth: true,
            itemStyle: {
              color: '#52c41a',
            },
          },
          {
            name: '失败任务',
            type: 'line',
            data: data.failed,
            smooth: true,
            itemStyle: {
              color: '#ff4d4f',
            },
          },
        ],
      };

      chartInstance.current.setOption(option);
    }
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default TaskTrendChart;
```

### 5. 自定义Hooks实现

#### 数据刷新Hook (hooks/useAutoRefresh.ts)
```typescript
import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  interval: number;
  enabled: boolean;
  onRefresh: () => void;
}

export const useAutoRefresh = ({ 
  interval, 
  enabled, 
  onRefresh 
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(onRefresh, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled, onRefresh]);
};
```

#### API调用Hook (hooks/useApi.ts)
```typescript
import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  apiCall: () => Promise<T>;
  dependencies?: any[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useApi = <T>({
  apiCall,
  dependencies = [],
  autoRefresh = false,
  refreshInterval = 30000,
}: UseApiOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};
```

## 部署配置

### 1. 环境变量配置

#### .env文件
```bash
# API配置
REACT_APP_API_BASE_URL=http://localhost:8080/api/v2
REACT_APP_API_KEY=xfsdfs3fsdfsdfasdfjoiojg

# 应用配置
REACT_APP_TITLE=分布式任务调度系统管理后台
REACT_APP_VERSION=1.0.0

# 开发配置
REACT_APP_DEBUG=true
REACT_APP_AUTO_REFRESH=true
REACT_APP_REFRESH_INTERVAL=30000
```

### 2. Docker配置

#### Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. 构建脚本

#### package.json
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "build:prod": "NODE_ENV=production npm run build",
    "docker:build": "docker build -t task-scheduler-dashboard .",
    "docker:run": "docker run -p 80:80 task-scheduler-dashboard"
  }
}
```

## 测试配置

### 1. 单元测试示例

#### components/Charts/TaskTrendChart.test.tsx
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskTrendChart from './TaskTrendChart';

const mockData = {
  completed: [10, 20, 30, 40, 50],
  failed: [1, 2, 3, 4, 5],
  labels: ['00:00', '04:00', '08:00', '12:00', '16:00'],
};

describe('TaskTrendChart', () => {
  it('renders chart with data', () => {
    render(<TaskTrendChart data={mockData} />);
    expect(screen.getByText('任务执行趋势')).toBeInTheDocument();
  });
});
```

### 2. E2E测试配置

#### cypress/integration/gpu-management.spec.ts
```typescript
describe('GPU Management', () => {
  beforeEach(() => {
    cy.visit('/gpu-management');
  });

  it('displays GPU list', () => {
    cy.get('[data-testid="gpu-table"]').should('be.visible');
    cy.get('[data-testid="gpu-row"]').should('have.length.greaterThan', 0);
  });

  it('can refresh GPU list', () => {
    cy.get('[data-testid="refresh-button"]').click();
    cy.get('[data-testid="loading"]').should('be.visible');
  });

  it('can perform GPU operations', () => {
    cy.get('[data-testid="heartbeat-button"]').first().click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

## 性能优化建议

### 1. 代码分割
```typescript
// 路由懒加载
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const GpuManagement = React.lazy(() => import('./pages/GpuManagement'));

// 组件懒加载
const TaskTrendChart = React.lazy(() => import('./components/Charts/TaskTrendChart'));
```

### 2. 数据缓存
```typescript
// 使用React Query进行数据缓存
import { useQuery } from 'react-query';

const useGpuList = () => {
  return useQuery('gpuList', gpuApi.getGpuList, {
    staleTime: 30000, // 30秒内数据被认为是新鲜的
    cacheTime: 300000, // 5分钟后清除缓存
    refetchInterval: 30000, // 30秒自动刷新
  });
};
```

### 3. 虚拟滚动
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedTable = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style}>
        {/* 渲染行内容 */}
      </div>
    )}
  </List>
);
```

这个实现指南提供了完整的前端工程开发方案，包括技术栈选择、项目结构、核心功能实现、部署配置等。开发者可以根据这个指南快速搭建一个功能完整的管理后台系统。
