import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, Alert, Button } from 'antd';
import { 
  DesktopOutlined, 
  PlayCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchOverview, fetchHealth, fetchMetrics } from '../../store/slices/monitoringSlice';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import TaskTrendChart from '../../components/Charts/TaskTrendChart';
import GpuStatusChart from '../../components/Charts/GpuStatusChart';
import TaskStatusChart from '../../components/Charts/TaskStatusChart';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { overview, health, metrics, loading, error } = useSelector((state: RootState) => state.monitoring);
  const { autoRefresh, refreshInterval } = useSelector((state: RootState) => state.settings);

  const refreshData = () => {
    dispatch(fetchOverview());
    dispatch(fetchHealth());
    dispatch(fetchMetrics());
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

  // 生成模拟的趋势数据
  const generateTrendData = () => {
    const labels = [];
    const completed = [];
    const failed = [];
    
    for (let i = 0; i < 24; i++) {
      const hour = String(i).padStart(2, '0');
      labels.push(`${hour}:00`);
      completed.push(Math.floor(Math.random() * 50) + 10);
      failed.push(Math.floor(Math.random() * 10) + 1);
    }
    
    return { labels, completed, failed };
  };

  const trendData = generateTrendData();

  if (loading && !overview) {
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
        <h1 style={{ margin: 0 }}>系统概览</h1>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={refreshData}
          loading={loading}
        >
          刷新数据
        </Button>
      </div>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃GPU"
              value={overview?.metrics.active_gpus || 0}
              prefix={<DesktopOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={overview?.metrics.total_tasks || 0}
              prefix={<PlayCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="队列长度"
              value={overview?.metrics.queue_length || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="失败任务"
              value={overview?.metrics.failed_tasks || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="任务执行趋势" style={{ height: 400 }}>
            <TaskTrendChart data={trendData} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="GPU状态分布" style={{ height: 400 }}>
            <GpuStatusChart 
              data={{
                ACTIVE: metrics?.gpu_status_counts?.ACTIVE || 0,
                OFFLINE: metrics?.gpu_status_counts?.OFFLINE || 0,
                FAULTY: metrics?.gpu_status_counts?.FAULTY || 0,
              }} 
              height={300} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="任务状态分布" style={{ height: 400 }}>
            <TaskStatusChart 
              data={{
                QUEUED: metrics?.task_status_counts?.QUEUED || 0,
                PROCESSING: metrics?.task_status_counts?.PROCESSING || 0,
                COMPLETED: metrics?.task_status_counts?.COMPLETED || 0,
                FAILED: metrics?.task_status_counts?.FAILED || 0,
                TIMEOUT: metrics?.task_status_counts?.TIMEOUT || 0,
              }} 
              height={300} 
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统健康状态" style={{ height: 400 }}>
            <div style={{ padding: '20px' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="整体健康"
                    value={health?.overall_health || 'UNKNOWN'}
                    valueStyle={{ 
                      color: health?.overall_health === 'HEALTHY' ? '#52c41a' : '#ff4d4f' 
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="GPU健康"
                    value={health?.gpu_health || 'UNKNOWN'}
                    valueStyle={{ 
                      color: health?.gpu_health === 'HEALTHY' ? '#52c41a' : '#ff4d4f' 
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="队列健康"
                    value={health?.queue_health || 'UNKNOWN'}
                    valueStyle={{ 
                      color: health?.queue_health === 'HEALTHY' ? '#52c41a' : '#ff4d4f' 
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="活跃GPU数"
                    value={health?.active_gpu_count || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
