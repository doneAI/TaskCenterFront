import React, { useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Alert, 
  Descriptions, 
  Tag, 
  Space,
  Spin,
  Timeline,
  Table,
} from 'antd';
import { 
  HeartOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchHealth, 
  fetchMetrics, 
  fetchClusterStatus,
  triggerHealthCheck,
} from '../../store/slices/monitoringSlice';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

const HealthCheck: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { health, metrics, clusterStatus, loading, error } = useSelector((state: RootState) => state.monitoring);
  const { autoRefresh, refreshInterval } = useSelector((state: RootState) => state.settings);

  const refreshData = () => {
    dispatch(fetchHealth());
    dispatch(fetchMetrics());
    dispatch(fetchClusterStatus());
  };

  // 自动刷新
  useAutoRefresh({
    interval: refreshInterval,
    enabled: autoRefresh,
    onRefresh: refreshData,
  });

  useEffect(() => {
    refreshData();
  }, [dispatch]);

  const handleTriggerCheck = async () => {
    try {
      await dispatch(triggerHealthCheck()).unwrap();
      // 触发检查后刷新数据
      setTimeout(refreshData, 2000);
    } catch (error) {
      console.error('触发健康检查失败:', error);
    }
  };

  const getHealthStatus = (status: string) => {
    const statusMap = {
      HEALTHY: { color: 'success', text: '健康', icon: <CheckCircleOutlined /> },
      UNHEALTHY: { color: 'error', text: '不健康', icon: <CloseCircleOutlined /> },
      WARNING: { color: 'warning', text: '警告', icon: <ExclamationCircleOutlined /> },
      UNKNOWN: { color: 'default', text: '未知', icon: <ClockCircleOutlined /> },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null };
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  const getInstanceStatus = (status: string) => {
    const statusMap = {
      ACTIVE: { color: 'success', text: '活跃' },
      INACTIVE: { color: 'error', text: '非活跃' },
      UNKNOWN: { color: 'default', text: '未知' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  if (loading && !health) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="数据加载失败"
        description={error}
        type="error"
        action={
          <Button size="small" onClick={refreshData}>
            重试
          </Button>
        }
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>系统健康检查</h1>
        <Space>
          <Button 
            type="primary" 
            icon={<HeartOutlined />} 
            onClick={handleTriggerCheck}
            loading={loading}
          >
            触发健康检查
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 整体健康状态 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="整体健康状态"
              value={health?.overall_health || 'UNKNOWN'}
              formatter={(value) => getHealthStatus(value as string)}
              valueStyle={{ 
                color: health?.overall_health === 'HEALTHY' ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="GPU健康状态"
              value={health?.gpu_health || 'UNKNOWN'}
              formatter={(value) => getHealthStatus(value as string)}
              valueStyle={{ 
                color: health?.gpu_health === 'HEALTHY' ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="队列健康状态"
              value={health?.queue_health || 'UNKNOWN'}
              formatter={(value) => getHealthStatus(value as string)}
              valueStyle={{ 
                color: health?.queue_health === 'HEALTHY' ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃GPU数"
              value={health?.active_gpu_count || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细健康信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="GPU状态统计" style={{ height: 300 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="活跃GPU"
                  value={metrics?.gpu_status_counts?.ACTIVE || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="离线GPU"
                  value={metrics?.gpu_status_counts?.OFFLINE || 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="故障GPU"
                  value={metrics?.gpu_status_counts?.FAULTY || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Timeline>
                <Timeline.Item color="green">
                  <div>活跃GPU: {metrics?.gpu_status_counts?.ACTIVE || 0} 个</div>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <div>离线GPU: {metrics?.gpu_status_counts?.OFFLINE || 0} 个</div>
                </Timeline.Item>
                <Timeline.Item color="red">
                  <div>故障GPU: {metrics?.gpu_status_counts?.FAULTY || 0} 个</div>
                </Timeline.Item>
              </Timeline>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="任务状态统计" style={{ height: 300 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="排队任务"
                  value={metrics?.task_status_counts?.QUEUED || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="处理中"
                  value={metrics?.task_status_counts?.PROCESSING || 0}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="已完成"
                  value={metrics?.task_status_counts?.COMPLETED || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="失败任务"
                  value={metrics?.task_status_counts?.FAILED || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="超时任务"
                  value={metrics?.task_status_counts?.TIMEOUT || 0}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 系统指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="系统资源使用率" style={{ height: 200 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="CPU使用率"
                  value={metrics?.system_metrics?.cpu_usage || 0}
                  suffix="%"
                  valueStyle={{ 
                    color: (metrics?.system_metrics?.cpu_usage || 0) > 80 ? '#ff4d4f' : '#52c41a' 
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="内存使用率"
                  value={metrics?.system_metrics?.memory_usage || 0}
                  suffix="%"
                  valueStyle={{ 
                    color: (metrics?.system_metrics?.memory_usage || 0) > 80 ? '#ff4d4f' : '#52c41a' 
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="磁盘使用率"
                  value={metrics?.system_metrics?.disk_usage || 0}
                  suffix="%"
                  valueStyle={{ 
                    color: (metrics?.system_metrics?.disk_usage || 0) > 80 ? '#ff4d4f' : '#52c41a' 
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="集群状态" style={{ height: 200 }}>
            {clusterStatus ? (
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="集群ID">
                  {clusterStatus.cluster_id}
                </Descriptions.Item>
                <Descriptions.Item label="主节点">
                  {clusterStatus.leader_instance}
                </Descriptions.Item>
                <Descriptions.Item label="总实例数">
                  {clusterStatus.total_instances}
                </Descriptions.Item>
                <Descriptions.Item label="活跃实例数">
                  {clusterStatus.active_instances}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 集群实例详情 */}
      {clusterStatus && (
        <Card title="集群实例详情">
          <Table
            dataSource={clusterStatus.instances}
            columns={[
              {
                title: '实例ID',
                dataIndex: 'instance_id',
                key: 'instance_id',
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => getInstanceStatus(status),
              },
              {
                title: '角色',
                dataIndex: 'role',
                key: 'role',
                render: (role: string) => (
                  <Tag color={role === 'LEADER' ? 'gold' : 'blue'}>
                    {role}
                  </Tag>
                ),
              },
              {
                title: '最后心跳',
                dataIndex: 'last_heartbeat',
                key: 'last_heartbeat',
                render: (timestamp: number) => new Date(timestamp).toLocaleString(),
              },
              {
                title: '启动时间',
                dataIndex: 'start_time',
                key: 'start_time',
                render: (timestamp: number) => new Date(timestamp).toLocaleString(),
              },
            ]}
            pagination={false}
            rowKey="instance_id"
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default HealthCheck;
