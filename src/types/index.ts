// API响应基础类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// GPU节点信息
export interface GpuNodeInfo {
  gpuId: string;
  hostname: string;
  vastInsId?: string;
  ip: string;
  port: number;
  supportedTaskTypes: number[];
  supportedTaskPriority: string;
  status: 'ACTIVE' | 'OFFLINE' | 'FAULTY';
  lastHeartbeat: number;
  failureCount: number;
  taskFailureCount: number;
  version: string;
  currentTasks: number;
  maxConcurrentTasks: number;
  metadata?: {
    gpuModel?: string;
    memory?: string;
    cudaVersion?: string;
    [key: string]: any;
  };
}

// 任务信息
export interface TaskInfo {
  taskId: string;
  displayId: number;
  taskType: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
  userId: string;
  app: string;
  priority: number;
  gpuId?: string;
  payload: string;
  result?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  timeout: number;
  estimatedWaitTime: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  updatedAt: number;
}

// 任务进度信息
export interface TaskProgress {
  taskId: string;
  status: string;
  progress: number;
  estimatedRemainingTime: number;
  gpuId?: string;
  startTime?: number;
  updateTime: number;
  queuePosition: number;
}

// 告警信息
export interface AlertInfo {
  id: string;
  title: string;
  message: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'ACTIVE' | 'ACKNOWLEDGED';
  source: string;
  timestamp: number;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
}

// 监控概览信息
export interface MonitoringOverview {
  timestamp: number;
  instance_id: string;
  is_leader: boolean;
  health_status: {
    overall_health: string;
    gpu_health: string;
    queue_health: string;
    active_gpu_count: number;
    total_gpu_count: number;
    timestamp: number;
  };
  metrics: {
    active_gpus: number;
    total_tasks: number;
    queue_length: number;
    failed_tasks: number;
    completed_tasks: number;
    processing_tasks: number;
    queued_tasks: number;
  };
}

// 健康状态信息
export interface HealthStatus {
  overall_health: string;
  gpu_health: string;
  queue_health: string;
  active_gpu_count: number;
  total_gpu_count: number;
  timestamp: number;
}

// 监控指标
export interface MonitoringMetrics {
  gpu_status_counts: Record<string, number>;
  task_status_counts: Record<string, number>;
  queue_lengths: Record<string, number>;
  system_metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  };
}

// 集群状态信息
export interface ClusterStatus {
  cluster_id: string;
  leader_instance: string;
  total_instances: number;
  active_instances: number;
  instances: Array<{
    instance_id: string;
    status: string;
    role: string;
    last_heartbeat: number;
    start_time: number;
  }>;
}

// 告警统计
export interface AlertStats {
  total_alerts: number;
  critical_alerts: number;
  warning_alerts: number;
  info_alerts: number;
  acknowledged_alerts: number;
  active_alerts: number;
}

// 图表数据
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

// 任务趋势数据
export interface TaskTrendData {
  completed: number[];
  failed: number[];
  labels: string[];
}

// GPU状态统计
export interface GpuStatusStats {
  ACTIVE: number;
  OFFLINE: number;
  FAULTY: number;
}

// 任务状态统计
export interface TaskStatusStats {
  QUEUED: number;
  PROCESSING: number;
  COMPLETED: number;
  FAILED: number;
  TIMEOUT: number;
}

// 系统设置
export interface SystemSettings {
  apiBaseUrl: string;
  apiKey: string;
  refreshInterval: number;
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
}

// 分页参数
export interface PaginationParams {
  page?: number;
  size?: number;
}

// 筛选参数
export interface FilterParams {
  status?: string;
  taskType?: number;
  gpuId?: string;
  level?: string;
  priority?: string;
}

// 表格列配置
export interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: any, record: any) => React.ReactNode;
  sorter?: boolean;
  filters?: Array<{ text: string; value: any }>;
}
