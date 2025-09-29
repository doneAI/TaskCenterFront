import apiClient from './api';
import { TaskInfo, TaskProgress, ApiResponse, PaginationParams, FilterParams } from '../types';

export const taskApi = {
  // 获取任务列表
  getTaskList: (params?: PaginationParams & FilterParams): Promise<ApiResponse<TaskInfo[]>> => 
    apiClient.get('/tasks', { params }),
  
  // 获取任务详情
  getTaskById: (taskId: string): Promise<ApiResponse<TaskInfo>> => 
    apiClient.get(`/tasks/${taskId}`),
  
  // 获取任务进度
  getTaskProgress: (taskId: string): Promise<ApiResponse<TaskProgress>> => 
    apiClient.get(`/tasks/${taskId}/progress`),
  
  // 获取任务结果
  getTaskResult: (taskId: string): Promise<ApiResponse<any>> => 
    apiClient.get(`/tasks/${taskId}/result`),
  
  // 创建任务
  createTask: (taskData: {
    taskType: number;
    userId: string;
    app: string;
    priority: number;
    payload: string;
    env?: string;
  }): Promise<ApiResponse<{
    taskId: string;
    displayId: number;
    status: string;
    estimatedWaitTime: number;
  }>> => 
    apiClient.post('/tasks', taskData),
  
  // 更新任务状态
  updateTaskStatus: (taskId: string, statusData: {
    status: string;
    gpuId?: string;
    message?: string;
  }): Promise<ApiResponse<string>> => 
    apiClient.post(`/tasks/${taskId}/status`, statusData),
  
  // 更新任务结果
  updateTaskResult: (taskId: string, result: string): Promise<ApiResponse<string>> => 
    apiClient.post(`/tasks/${taskId}/result`, { result }),
};
