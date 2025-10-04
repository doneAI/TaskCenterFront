import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

// API配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://taskcenter-api.powers-ai.net/api/v2';
const API_KEY = process.env.REACT_APP_API_KEY || 'xfsdfs3fsdfsdfasdfjoiojg';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: any) => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error: any) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  (error: any) => {
    console.error('API Error:', error);
    
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          message.error('认证失败，请检查API密钥');
          break;
        case 403:
          message.error('权限不足');
          break;
        case 404:
          message.error('资源不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络设置');
    } else {
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
