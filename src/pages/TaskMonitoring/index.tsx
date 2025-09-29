import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Input, 
  Select, 
  message, 
  Modal, 
  Form, 
  Progress,
  Row,
  Col,
  Statistic,
  Descriptions,
  Badge,
} from 'antd';
import { 
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchTaskList, 
  fetchTaskById,
  fetchTaskProgress,
  setFilters,
  setPagination,
  setSelectedTask,
} from '../../store/slices/taskSlice';
import { TaskInfo } from '../../types';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

const { Option } = Select;

const TaskMonitoring: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { taskList, loading, error, selectedTask, taskProgress, pagination, filters } = useSelector((state: RootState) => state.task);
  const { autoRefresh, refreshInterval } = useSelector((state: RootState) => state.settings);
  const [searchText, setSearchText] = useState('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);

  const refreshData = () => {
    dispatch(fetchTaskList({ 
      page: pagination.page, 
      size: pagination.size, 
      ...filters 
    }));
  };

  // 自动刷新
  useAutoRefresh({
    interval: refreshInterval,
    enabled: autoRefresh,
    onRefresh: refreshData,
  });

  useEffect(() => {
    refreshData();
  }, [dispatch, pagination.page, pagination.size, filters]);

  const handleViewDetail = async (taskId: string) => {
    try {
      await dispatch(fetchTaskById(taskId)).unwrap();
      setIsDetailModalVisible(true);
    } catch (error) {
      message.error('获取任务详情失败');
    }
  };

  const handleViewProgress = async (taskId: string) => {
    try {
      await dispatch(fetchTaskProgress(taskId)).unwrap();
      setIsProgressModalVisible(true);
    } catch (error) {
      message.error('获取任务进度失败');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      QUEUED: { color: 'blue', text: '排队', icon: <ClockCircleOutlined /> },
      PROCESSING: { color: 'processing', text: '处理中', icon: <PlayCircleOutlined /> },
      COMPLETED: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      FAILED: { color: 'error', text: '失败', icon: <CloseCircleOutlined /> },
      TIMEOUT: { color: 'warning', text: '超时', icon: <ExclamationCircleOutlined /> },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null };
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  const getPriorityTag = (priority: number) => {
    const priorityMap = {
      1: { color: 'red', text: '高' },
      2: { color: 'orange', text: '中' },
      3: { color: 'blue', text: '低' },
    };
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || { color: 'default', text: priority };
    return <Tag color={priorityInfo.color}>{priorityInfo.text}</Tag>;
  };

  // 筛选后的数据
  const filteredData = taskList.filter(task => {
    const matchesSearch = !searchText || 
      task.taskId.toLowerCase().includes(searchText.toLowerCase()) ||
      task.userId.toLowerCase().includes(searchText.toLowerCase()) ||
      task.app.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  });

  // 统计信息
  const stats = {
    total: taskList.length,
    queued: taskList.filter(t => t.status === 'QUEUED').length,
    processing: taskList.filter(t => t.status === 'PROCESSING').length,
    completed: taskList.filter(t => t.status === 'COMPLETED').length,
    failed: taskList.filter(t => t.status === 'FAILED').length,
    timeout: taskList.filter(t => t.status === 'TIMEOUT').length,
  };

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 150,
      render: (taskId: string) => (
        <Button type="link" onClick={() => handleViewDetail(taskId)}>
          {taskId}
        </Button>
      ),
    },
    {
      title: '显示ID',
      dataIndex: 'displayId',
      key: 'displayId',
      width: 100,
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: '排队', value: 'QUEUED' },
        { text: '处理中', value: 'PROCESSING' },
        { text: '已完成', value: 'COMPLETED' },
        { text: '失败', value: 'FAILED' },
        { text: '超时', value: 'TIMEOUT' },
      ],
      onFilter: (value: any, record: TaskInfo) => record.status === value,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
    },
    {
      title: '应用',
      dataIndex: 'app',
      key: 'app',
      width: 120,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: number) => getPriorityTag(priority),
    },
    {
      title: 'GPU ID',
      dataIndex: 'gpuId',
      key: 'gpuId',
      width: 120,
      render: (gpuId: string) => gpuId || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
      sorter: (a: TaskInfo, b: TaskInfo) => a.createdAt - b.createdAt,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (record: TaskInfo) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.taskId)}
          >
            详情
          </Button>
          {record.status === 'PROCESSING' && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => handleViewProgress(record.taskId)}
            >
              进度
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>任务监控</h1>
        <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
          刷新
        </Button>
      </div>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic title="总任务数" value={stats.total} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="排队任务" value={stats.queued} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="处理中" value={stats.processing} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="失败任务" value={stats.failed} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="超时任务" value={stats.timeout} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索和筛选 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索任务ID、用户ID或应用"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="状态筛选"
            style={{ width: 120 }}
            allowClear
            value={filters.status}
            onChange={(value) => dispatch(setFilters({ status: value }))}
          >
            <Option value="QUEUED">排队</Option>
            <Option value="PROCESSING">处理中</Option>
            <Option value="COMPLETED">已完成</Option>
            <Option value="FAILED">失败</Option>
            <Option value="TIMEOUT">超时</Option>
          </Select>
          <Select
            placeholder="任务类型"
            style={{ width: 120 }}
            allowClear
            value={filters.taskType}
            onChange={(value) => dispatch(setFilters({ taskType: value }))}
          >
            <Option value={1}>类型1</Option>
            <Option value={2}>类型2</Option>
            <Option value={3}>类型3</Option>
            <Option value={4}>类型4</Option>
          </Select>
          <Select
            placeholder="GPU ID"
            style={{ width: 120 }}
            allowClear
            value={filters.gpuId}
            onChange={(value) => dispatch(setFilters({ gpuId: value }))}
          >
            {Array.from(new Set(taskList.map(t => t.gpuId).filter(Boolean))).map(gpuId => (
              <Option key={gpuId} value={gpuId}>{gpuId}</Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="taskId"
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => {
              dispatch(setPagination({ page, size: size || 20 }));
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 任务详情模态框 */}
      <Modal
        title="任务详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTask && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="任务ID" span={2}>
              {selectedTask.taskId}
            </Descriptions.Item>
            <Descriptions.Item label="显示ID">
              {selectedTask.displayId}
            </Descriptions.Item>
            <Descriptions.Item label="任务类型">
              {selectedTask.taskType}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {getStatusTag(selectedTask.status)}
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              {getPriorityTag(selectedTask.priority)}
            </Descriptions.Item>
            <Descriptions.Item label="用户ID">
              {selectedTask.userId}
            </Descriptions.Item>
            <Descriptions.Item label="应用">
              {selectedTask.app}
            </Descriptions.Item>
            <Descriptions.Item label="GPU ID">
              {selectedTask.gpuId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="重试次数">
              {selectedTask.retryCount}/{selectedTask.maxRetries}
            </Descriptions.Item>
            <Descriptions.Item label="超时时间">
              {selectedTask.timeout}ms
            </Descriptions.Item>
            <Descriptions.Item label="预估等待时间">
              {selectedTask.estimatedWaitTime}秒
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(selectedTask.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="开始时间">
              {selectedTask.startedAt ? new Date(selectedTask.startedAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="完成时间">
              {selectedTask.completedAt ? new Date(selectedTask.completedAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(selectedTask.updatedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="任务载荷" span={2}>
              <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                {JSON.stringify(JSON.parse(selectedTask.payload || '{}'), null, 2)}
              </pre>
            </Descriptions.Item>
            {selectedTask.result && (
              <Descriptions.Item label="执行结果" span={2}>
                <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                  {JSON.stringify(JSON.parse(selectedTask.result), null, 2)}
                </pre>
              </Descriptions.Item>
            )}
            {selectedTask.errorMessage && (
              <Descriptions.Item label="错误信息" span={2}>
                <pre style={{ maxHeight: 200, overflow: 'auto', background: '#fff2f0', padding: 8, borderRadius: 4, color: '#ff4d4f' }}>
                  {selectedTask.errorMessage}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 任务进度模态框 */}
      <Modal
        title="任务进度"
        open={isProgressModalVisible}
        onCancel={() => setIsProgressModalVisible(false)}
        footer={null}
        width={500}
      >
        {taskProgress && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="任务ID">
                {taskProgress.taskId}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(taskProgress.status)}
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={taskProgress.progress} status="active" />
              </Descriptions.Item>
              <Descriptions.Item label="预估剩余时间">
                {taskProgress.estimatedRemainingTime}秒
              </Descriptions.Item>
              <Descriptions.Item label="GPU ID">
                {taskProgress.gpuId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="队列位置">
                {taskProgress.queuePosition}
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">
                {taskProgress.startTime ? new Date(taskProgress.startTime).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(taskProgress.updateTime).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskMonitoring;
