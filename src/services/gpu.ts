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
