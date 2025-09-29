import apiClient from './api';
import { AlertInfo, AlertStats, ApiResponse, PaginationParams, FilterParams } from '../types';

export const alertApi = {
  // 获取告警列表
  getAlertList: (params?: PaginationParams & FilterParams): Promise<ApiResponse<AlertInfo[]>> => 
    apiClient.get('/monitoring/alerts', { params }),
  
  // 确认告警
  acknowledgeAlert: (alertId: string): Promise<ApiResponse<string>> => 
    apiClient.post(`/monitoring/alerts/${alertId}/acknowledge`),
  
  // 获取告警统计
  getAlertStats: (): Promise<ApiResponse<AlertStats>> => 
    apiClient.get('/monitoring/alerts/stats'),
};
