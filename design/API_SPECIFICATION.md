# 分布式任务调度系统 - API接口规范

## 概述

本文档详细描述了分布式任务调度系统的所有API接口，用于前端工程开发。所有接口都基于RESTful设计，使用JSON格式进行数据交换。

## 基础信息

- **API版本**: v2
- **基础URL**: `http://your-domain:port/api/v2`
- **认证方式**: Bearer Token
- **内容类型**: `application/json`
- **字符编码**: UTF-8

## 统一响应格式

所有API响应都遵循以下格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | HTTP状态码，200表示成功 |
| message | String | 响应消息 |
| data | Object | 响应数据，具体结构见各接口说明 |

### 错误响应示例

```json
{
  "code": 500,
  "message": "操作失败: 具体错误信息",
  "data": null
}
```

## 认证说明

所有API请求都需要在请求头中包含认证信息：

```http
Authorization: Bearer your-api-key
```

或者使用X-API-Key头：

```http
X-API-Key: your-api-key
```

## 接口分类

### 1. 监控相关接口

#### 1.1 获取监控概览

**接口**: `GET /monitoring/overview`

**描述**: 获取系统监控概览信息

**认证**: 需要API密钥认证

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "timestamp": 1703123456789,
    "instance_id": "instance-001",
    "is_leader": true,
    "health_status": {
      "overall_health": "HEALTHY",
      "gpu_health": "HEALTHY",
      "queue_health": "HEALTHY",
      "active_gpu_count": 12,
      "total_gpu_count": 15,
      "timestamp": 1703123456789
    },
    "metrics": {
      "active_gpus": 12,
      "total_tasks": 1247,
      "queue_length": 23,
      "failed_tasks": 3,
      "completed_tasks": 1156,
      "processing_tasks": 8,
      "queued_tasks": 15
    }
  }
}
```

#### 1.2 获取系统健康状态

**接口**: `GET /monitoring/health`

**描述**: 获取系统健康状态信息

**认证**: 需要API密钥认证

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "overall_health": "HEALTHY",
    "gpu_health": "HEALTHY",
    "queue_health": "HEALTHY",
    "active_gpu_count": 12,
    "total_gpu_count": 15,
    "timestamp": 1703123456789
  }
}
```

#### 1.3 获取特定组件健康状态

**接口**: `GET /monitoring/health/{component}`

**描述**: 获取指定组件的健康状态

**路径参数**:
- `component`: 组件名称（system, gpu, task, queue, cluster）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "component": "gpu",
    "status": "HEALTHY",
    "details": {
      "active_gpus": 12,
      "faulty_gpus": 1,
      "offline_gpus": 2,
      "total_gpus": 15
    },
    "timestamp": 1703123456789
  }
}
```

#### 1.4 获取监控指标

**接口**: `GET /monitoring/metrics`

**描述**: 获取所有监控指标

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "gpu_status_counts": {
      "ACTIVE": 12,
      "OFFLINE": 2,
      "FAULTY": 1
    },
    "task_status_counts": {
      "QUEUED": 15,
      "PROCESSING": 8,
      "COMPLETED": 1156,
      "FAILED": 3,
      "TIMEOUT": 1
    },
    "queue_lengths": {
      "2": 5,
      "3": 8,
      "4": 10
    },
    "system_metrics": {
      "cpu_usage": 45.2,
      "memory_usage": 67.8,
      "disk_usage": 23.1
    }
  }
}
```

#### 1.5 获取特定指标

**接口**: `GET /monitoring/metrics/{key}`

**描述**: 获取指定监控指标

**路径参数**:
- `key`: 指标键名

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "key": "gpu_status_counts",
    "value": {
      "ACTIVE": 12,
      "OFFLINE": 2,
      "FAULTY": 1
    },
    "timestamp": 1703123456789
  }
}
```

#### 1.6 手动触发监控检查

**接口**: `POST /monitoring/check`

**描述**: 手动触发监控检查

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "监控检查已触发"
}
```

#### 1.7 手动触发健康检查

**接口**: `POST /monitoring/health/check`

**描述**: 手动触发健康检查

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "健康检查已触发"
}
```

### 2. GPU管理接口

#### 2.1 获取GPU列表

**接口**: `GET /gpus`

**描述**: 获取所有GPU节点信息

**认证**: 需要API密钥认证

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "gpuId": "gpu_001",
      "hostname": "gpu-server-01",
      "ip": "192.168.1.100",
      "port": 8080,
      "supportedTaskTypes": [2, 3, 4],
      "supportedTaskPriority": "VIP",
      "status": "ACTIVE",
      "lastHeartbeat": 1703123456789,
      "failureCount": 0,
      "taskFailureCount": 0,
      "version": "1.0.0",
      "currentTasks": 2,
      "maxConcurrentTasks": 4,
      "metadata": {
        "gpuModel": "RTX 4090",
        "memory": "24GB",
        "cudaVersion": "11.8"
      }
    }
  ]
}
```

#### 2.2 获取指定GPU信息

**接口**: `GET /gpus/{gpuId}`

**描述**: 获取指定GPU节点信息

**路径参数**:
- `gpuId`: GPU ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "gpuId": "gpu_001",
    "hostname": "gpu-server-01",
    "ip": "192.168.1.100",
    "port": 8080,
    "supportedTaskTypes": [2, 3, 4],
    "supportedTaskPriority": "VIP",
    "status": "ACTIVE",
    "lastHeartbeat": 1703123456789,
    "failureCount": 0,
    "taskFailureCount": 0,
    "version": "1.0.0",
    "currentTasks": 2,
    "maxConcurrentTasks": 4,
    "metadata": {
      "gpuModel": "RTX 4090",
      "memory": "24GB",
      "cudaVersion": "11.8"
    }
  }
}
```

#### 2.3 按任务类型获取GPU列表

**接口**: `GET /gpus/by-task-type/{taskType}`

**描述**: 根据任务类型查询支持该类型的GPU列表

**路径参数**:
- `taskType`: 任务类型代码

**查询参数**:
- `priority`: 任务优先级（可选），支持NORMAL、VIP

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "gpuId": "gpu_001",
      "hostname": "gpu-server-01",
      "ip": "192.168.1.100",
      "port": 8080,
      "supportedTaskTypes": [2, 3, 4],
      "supportedTaskPriority": "VIP",
      "status": "ACTIVE",
      "lastHeartbeat": 1703123456789,
      "currentTasks": 2,
      "maxConcurrentTasks": 4
    }
  ]
}
```

#### 2.4 GPU注册

**接口**: `POST /gpus/register`

**描述**: 注册新的GPU节点

**请求体**:
```json
{
  "gpuId": "gpu_001",
  "hostname": "gpu-server-01",
  "ip": "192.168.1.100",
  "port": 8080,
  "supportedTaskTypes": [2, 3, 4],
  "supportedTaskPriority": "VIP",
  "version": "1.0.0",
  "maxConcurrentTasks": 4,
  "metadata": {
    "gpuModel": "RTX 4090",
    "memory": "24GB",
    "cudaVersion": "11.8"
  }
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "GPU注册成功"
}
```

#### 2.5 GPU心跳

**接口**: `POST /gpus/{gpuId}/heartbeat`

**描述**: 更新GPU心跳状态

**路径参数**:
- `gpuId`: GPU ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "心跳更新成功"
}
```

#### 2.6 标记GPU为故障

**接口**: `POST /gpus/{gpuId}/fault`

**描述**: 标记GPU为故障状态

**路径参数**:
- `gpuId`: GPU ID

**查询参数**:
- `reason`: 故障原因

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "GPU已标记为故障"
}
```

#### 2.7 恢复GPU

**接口**: `POST /gpus/{gpuId}/recover`

**描述**: 恢复GPU到正常状态

**路径参数**:
- `gpuId`: GPU ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "GPU恢复成功"
}
```

#### 2.8 注销GPU

**接口**: `DELETE /gpus/{gpuId}`

**描述**: 注销GPU节点

**路径参数**:
- `gpuId`: GPU ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "GPU注销成功"
}
```

### 3. 任务管理接口

#### 3.1 获取任务列表

**接口**: `GET /tasks`

**描述**: 获取任务列表

**查询参数**:
- `status`: 任务状态过滤（可选）
- `taskType`: 任务类型过滤（可选）
- `gpuId`: GPU ID过滤（可选）
- `page`: 页码（可选，默认1）
- `size`: 每页大小（可选，默认20）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "taskId": "task_123456789",
      "displayId": 1001,
      "taskType": 2,
      "status": "PROCESSING",
      "userId": "user_001",
      "app": "face_swap_app",
      "priority": 2,
      "gpuId": "gpu_001",
      "payload": "{\"input\": \"image.jpg\", \"output\": \"result.jpg\"}",
      "result": null,
      "errorMessage": null,
      "retryCount": 0,
      "maxRetries": 3,
      "timeout": 300000,
      "estimatedWaitTime": 120,
      "createdAt": 1703123456789,
      "startedAt": 1703123460000,
      "completedAt": null,
      "updatedAt": 1703123460000
    }
  ]
}
```

#### 3.2 获取任务详情

**接口**: `GET /tasks/{taskId}`

**描述**: 获取指定任务详情

**路径参数**:
- `taskId`: 任务ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_123456789",
    "displayId": 1001,
    "taskType": 2,
    "status": "PROCESSING",
    "userId": "user_001",
    "app": "face_swap_app",
    "priority": 2,
    "gpuId": "gpu_001",
    "payload": "{\"input\": \"image.jpg\", \"output\": \"result.jpg\"}",
    "result": null,
    "errorMessage": null,
    "retryCount": 0,
    "maxRetries": 3,
    "timeout": 300000,
    "estimatedWaitTime": 120,
    "createdAt": 1703123456789,
    "startedAt": 1703123460000,
    "completedAt": null,
    "updatedAt": 1703123460000
  }
}
```

#### 3.3 获取任务进度

**接口**: `GET /tasks/{taskId}/progress`

**描述**: 获取任务执行进度

**路径参数**:
- `taskId`: 任务ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_123456789",
    "status": "PROCESSING",
    "progress": 65,
    "estimatedRemainingTime": 120,
    "gpuId": "gpu_001",
    "startTime": 1703123460000,
    "updateTime": 1703123500000,
    "queuePosition": 0
  }
}
```

#### 3.4 获取任务结果

**接口**: `GET /tasks/{taskId}/result`

**描述**: 获取任务执行结果

**路径参数**:
- `taskId`: 任务ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_123456789",
    "status": "COMPLETED",
    "result": {
      "resultImages": ["image/2025-01-15/result.jpg"],
      "processingTime": 180000,
      "gpuId": "gpu_001"
    },
    "completedAt": 1703123640000
  }
}
```

#### 3.5 创建任务

**接口**: `POST /tasks`

**描述**: 创建新任务

**请求体**:
```json
{
  "taskType": 2,
  "userId": "user_001",
  "app": "face_swap_app",
  "priority": 2,
  "payload": "{\"input\": \"image.jpg\", \"output\": \"result.jpg\"}",
  "env": "prod"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_123456789",
    "displayId": 1001,
    "status": "QUEUED",
    "estimatedWaitTime": 120
  }
}
```

#### 3.6 更新任务状态

**接口**: `POST /tasks/{taskId}/status`

**描述**: 更新任务状态

**路径参数**:
- `taskId`: 任务ID

**请求体**:
```json
{
  "status": "PROCESSING",
  "gpuId": "gpu_001",
  "message": "任务开始执行"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "任务状态更新成功"
}
```

#### 3.7 更新任务结果

**接口**: `POST /tasks/{taskId}/result`

**描述**: 更新任务执行结果

**路径参数**:
- `taskId`: 任务ID

**请求体**:
```json
{
  "result": "{\"resultImages\": [\"image/2025-01-15/result.jpg\"], \"processingTime\": 180000}"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "任务结果更新成功"
}
```

### 4. 告警管理接口

#### 4.1 获取告警列表

**接口**: `GET /monitoring/alerts`

**描述**: 获取告警列表

**查询参数**:
- `level`: 告警级别过滤（可选）
- `status`: 告警状态过滤（可选）
- `page`: 页码（可选，默认1）
- `size`: 每页大小（可选，默认20）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "alert_001",
      "title": "GPU故障告警",
      "message": "GPU节点 gpu_003 检测到故障",
      "level": "CRITICAL",
      "status": "ACTIVE",
      "source": "gpu_monitor",
      "timestamp": 1703123456789,
      "acknowledgedAt": null,
      "acknowledgedBy": null
    }
  ]
}
```

#### 4.2 确认告警

**接口**: `POST /monitoring/alerts/{alertId}/acknowledge`

**描述**: 确认告警

**路径参数**:
- `alertId`: 告警ID

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "告警已确认"
}
```

#### 4.3 获取告警统计

**接口**: `GET /monitoring/alerts/stats`

**描述**: 获取告警统计信息

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_alerts": 8,
    "critical_alerts": 1,
    "warning_alerts": 2,
    "info_alerts": 5,
    "acknowledged_alerts": 3,
    "active_alerts": 5
  }
}
```

### 5. 集群管理接口

#### 5.1 获取集群状态

**接口**: `GET /cluster/status`

**描述**: 获取集群状态信息

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "cluster_id": "cluster_001",
    "leader_instance": "instance-001",
    "total_instances": 3,
    "active_instances": 3,
    "instances": [
      {
        "instance_id": "instance-001",
        "status": "ACTIVE",
        "role": "LEADER",
        "last_heartbeat": 1703123456789,
        "start_time": 1703120000000
      }
    ]
  }
}
```

#### 5.2 获取实例信息

**接口**: `GET /cluster/instances`

**描述**: 获取集群实例信息

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "instance_id": "instance-001",
      "status": "ACTIVE",
      "role": "LEADER",
      "last_heartbeat": 1703123456789,
      "start_time": 1703120000000,
      "version": "2.0.0"
    }
  ]
}
```

## 数据模型

### GPU节点信息 (GpuNodeInfo)

```json
{
  "gpuId": "string",                    // GPU唯一标识
  "hostname": "string",                 // 主机名
  "vastInsId": "string",               // vast实例ID
  "ip": "string",                      // IP地址
  "port": "integer",                   // 端口
  "supportedTaskTypes": [2, 3, 4],     // 支持的任务类型
  "supportedTaskPriority": "string",   // 支持的优先级队列
  "status": "ACTIVE|OFFLINE|FAULTY",   // GPU状态
  "lastHeartbeat": "long",             // 最后心跳时间
  "failureCount": "integer",           // 连续失败次数
  "taskFailureCount": "integer",       // 任务连续失败次数
  "version": "string",                 // 客户端版本
  "currentTasks": "integer",           // 当前任务数
  "maxConcurrentTasks": "integer",     // 最大并发任务数
  "metadata": "object"                 // 元数据
}
```

### 任务信息 (TaskDO)

```json
{
  "taskId": "string",                  // 任务ID
  "displayId": "long",                 // 显示ID
  "taskType": "integer",               // 任务类型
  "status": "QUEUED|PROCESSING|COMPLETED|FAILED|TIMEOUT", // 任务状态
  "userId": "string",                  // 用户ID
  "app": "string",                     // 应用名称
  "priority": "integer",               // 优先级
  "gpuId": "string",                   // GPU ID
  "payload": "string",                 // 任务载荷
  "result": "string",                  // 执行结果
  "errorMessage": "string",            // 错误信息
  "retryCount": "integer",             // 重试次数
  "maxRetries": "integer",             // 最大重试次数
  "timeout": "long",                   // 超时时间
  "estimatedWaitTime": "long",         // 预估等待时间
  "createdAt": "long",                 // 创建时间
  "startedAt": "long",                 // 开始时间
  "completedAt": "long",               // 完成时间
  "updatedAt": "long"                  // 更新时间
}
```

### 告警信息 (AlertInfo)

```json
{
  "id": "string",                      // 告警ID
  "title": "string",                   // 告警标题
  "message": "string",                 // 告警消息
  "level": "CRITICAL|WARNING|INFO",   // 告警级别
  "status": "ACTIVE|ACKNOWLEDGED",     // 告警状态
  "source": "string",                  // 告警源
  "timestamp": "long",                 // 告警时间
  "acknowledgedAt": "long",            // 确认时间
  "acknowledgedBy": "string"           // 确认人
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript示例

```javascript
// 获取GPU列表
async function getGpuList() {
    const response = await fetch('/api/v2/gpus', {
        headers: {
            'Authorization': 'Bearer your-api-key',
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data.data;
}

// 获取监控概览
async function getMonitoringOverview() {
    const response = await fetch('/api/v2/monitoring/overview', {
        headers: {
            'Authorization': 'Bearer your-api-key',
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data.data;
}

// 标记GPU为故障
async function markGpuAsFaulty(gpuId, reason) {
    const response = await fetch(`/api/v2/gpus/${gpuId}/fault?reason=${encodeURIComponent(reason)}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer your-api-key',
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}
```

### cURL示例

```bash
# 获取GPU列表
curl -H "Authorization: Bearer your-api-key" \
     "http://localhost:8080/api/v2/gpus"

# 获取监控概览
curl -H "Authorization: Bearer your-api-key" \
     "http://localhost:8080/api/v2/monitoring/overview"

# 标记GPU为故障
curl -X POST \
     -H "Authorization: Bearer your-api-key" \
     "http://localhost:8080/api/v2/gpus/gpu_001/fault?reason=手动标记"
```

## 注意事项

1. **认证**: 所有API请求都需要有效的API密钥
2. **频率限制**: 建议控制请求频率，避免过于频繁的请求
3. **错误处理**: 请妥善处理各种错误情况
4. **数据格式**: 所有时间戳都是Unix时间戳（毫秒）
5. **分页**: 列表接口支持分页，建议使用分页参数控制数据量
6. **缓存**: 监控数据建议适当缓存，避免频繁请求
