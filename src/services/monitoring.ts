import apiClient from './api';
import { 
  MonitoringOverview, 
  HealthStatus, 
  MonitoringMetrics, 
  ClusterStatus, 
  ApiResponse 
} from '../types';

export const monitoringApi = {
  // 获取监控概览
  getOverview: (): Promise<ApiResponse<MonitoringOverview>> => 
    apiClient.get('/monitoring/overview'),
  
  // 获取系统健康状态
  getHealth: (): Promise<ApiResponse<HealthStatus>> => 
    apiClient.get('/monitoring/health'),
  
  // 获取特定组件健康状态
  getComponentHealth: (component: string): Promise<ApiResponse<any>> => 
    apiClient.get(`/monitoring/health/${component}`),
  
  // 获取监控指标
  getMetrics: (): Promise<ApiResponse<MonitoringMetrics>> => 
    apiClient.get('/monitoring/metrics'),
  
  // 获取特定指标
  getMetric: (key: string): Promise<ApiResponse<any>> => 
    apiClient.get(`/monitoring/metrics/${key}`),
  
  // 手动触发监控检查
  triggerCheck: (): Promise<ApiResponse<string>> => 
    apiClient.post('/monitoring/check'),
  
  // 手动触发健康检查
  triggerHealthCheck: (): Promise<ApiResponse<string>> => 
    apiClient.post('/monitoring/health/check'),
  
  // 获取集群状态
  getClusterStatus: (): Promise<ApiResponse<ClusterStatus>> => 
    apiClient.get('/cluster/status'),
  
  // 获取集群实例信息
  getClusterInstances: (): Promise<ApiResponse<any[]>> => 
    apiClient.get('/cluster/instances'),
};
