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
  InputNumber,
  Popconfirm,
  Row,
  Col,
  Statistic,
} from 'antd';
import { 
  HeartOutlined, 
  ExclamationCircleOutlined, 
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchGpuList, 
  updateGpuHeartbeat, 
  markGpuAsFaulty, 
  recoverGpu,
  registerGpu,
  setFilters 
} from '../../store/slices/gpuSlice';
import { GpuNodeInfo } from '../../types';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

const { Option } = Select;

const GpuManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { gpuList, loading, error, filters } = useSelector((state: RootState) => state.gpu);
  const { autoRefresh, refreshInterval } = useSelector((state: RootState) => state.settings);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const refreshData = () => {
    dispatch(fetchGpuList());
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

  const handleHeartbeat = async (gpuId: string) => {
    try {
      await dispatch(updateGpuHeartbeat(gpuId)).unwrap();
      message.success('心跳更新成功');
    } catch (error) {
      message.error('心跳更新失败');
    }
  };

  const handleMarkFaulty = async (gpuId: string) => {
    try {
      await dispatch(markGpuAsFaulty({ gpuId, reason: '手动标记' })).unwrap();
      message.success('GPU已标记为故障');
    } catch (error) {
      message.error('标记失败');
    }
  };

  const handleRecover = async (gpuId: string) => {
    try {
      await dispatch(recoverGpu(gpuId)).unwrap();
      message.success('GPU恢复成功');
    } catch (error) {
      message.error('恢复失败');
    }
  };

  const handleRegister = async (values: any) => {
    try {
      await dispatch(registerGpu(values)).unwrap();
      message.success('GPU注册成功');
      setIsModalVisible(false);
      form.resetFields();
      refreshData();
    } catch (error) {
      message.error('注册失败');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      ACTIVE: { color: 'green', text: '活跃' },
      OFFLINE: { color: 'orange', text: '离线' },
      FAULTY: { color: 'red', text: '故障' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const getPriorityTag = (priority: string) => {
    const priorityMap = {
      VIP: { color: 'gold', text: 'VIP' },
      NORMAL: { color: 'blue', text: '普通' },
    };
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || { color: 'default', text: priority };
    return <Tag color={priorityInfo.color}>{priorityInfo.text}</Tag>;
  };

  // 筛选后的数据
  const filteredData = gpuList.filter(gpu => {
    const matchesSearch = !searchText || 
      gpu.gpuId.toLowerCase().includes(searchText.toLowerCase()) ||
      gpu.hostname.toLowerCase().includes(searchText.toLowerCase()) ||
      gpu.ip.includes(searchText);
    
    const matchesStatus = !filters.status || gpu.status === filters.status;
    const matchesTaskType = !filters.taskType || gpu.supportedTaskTypes.includes(filters.taskType);
    const matchesPriority = !filters.priority || gpu.supportedTaskPriority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesTaskType && matchesPriority;
  });

  // 统计信息
  const stats = {
    total: gpuList.length,
    active: gpuList.filter(g => g.status === 'ACTIVE').length,
    offline: gpuList.filter(g => g.status === 'OFFLINE').length,
    faulty: gpuList.filter(g => g.status === 'FAULTY').length,
  };

  const columns = [
    {
      title: 'GPU ID',
      dataIndex: 'gpuId',
      key: 'gpuId',
      width: 120,
    },
    {
      title: '主机名',
      dataIndex: 'hostname',
      key: 'hostname',
      width: 150,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: '活跃', value: 'ACTIVE' },
        { text: '离线', value: 'OFFLINE' },
        { text: '故障', value: 'FAULTY' },
      ],
      onFilter: (value: any, record: GpuNodeInfo) => record.status === value,
    },
    {
      title: '支持任务类型',
      dataIndex: 'supportedTaskTypes',
      key: 'supportedTaskTypes',
      width: 120,
      render: (types: number[]) => types?.join(', ') || '-',
    },
    {
      title: '优先级',
      dataIndex: 'supportedTaskPriority',
      key: 'supportedTaskPriority',
      width: 100,
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: '当前任务',
      key: 'currentTasks',
      width: 100,
      render: (record: GpuNodeInfo) => 
        `${record.currentTasks || 0}/${record.maxConcurrentTasks || 0}`,
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      width: 150,
      render: (timestamp: number) => 
        new Date(timestamp).toLocaleString(),
      sorter: (a: GpuNodeInfo, b: GpuNodeInfo) => a.lastHeartbeat - b.lastHeartbeat,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (record: GpuNodeInfo) => (
        <Space>
          <Button 
            size="small" 
            icon={<HeartOutlined />}
            onClick={() => handleHeartbeat(record.gpuId)}
          >
            心跳
          </Button>
          <Popconfirm
            title="确定要标记此GPU为故障吗？"
            onConfirm={() => handleMarkFaulty(record.gpuId)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              size="small" 
              danger
              icon={<ExclamationCircleOutlined />}
            >
              故障
            </Button>
          </Popconfirm>
          <Button 
            size="small" 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => handleRecover(record.gpuId)}
          >
            恢复
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>GPU管理</h1>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            添加GPU
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总GPU数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="活跃GPU" value={stats.active} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="离线GPU" value={stats.offline} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="故障GPU" value={stats.faulty} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索和筛选 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索GPU ID、主机名或IP"
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
            <Option value="ACTIVE">活跃</Option>
            <Option value="OFFLINE">离线</Option>
            <Option value="FAULTY">故障</Option>
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
            placeholder="优先级"
            style={{ width: 120 }}
            allowClear
            value={filters.priority}
            onChange={(value) => dispatch(setFilters({ priority: value }))}
          >
            <Option value="VIP">VIP</Option>
            <Option value="NORMAL">普通</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="gpuId"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 添加GPU模态框 */}
      <Modal
        title="添加GPU"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gpuId"
                label="GPU ID"
                rules={[{ required: true, message: '请输入GPU ID' }]}
              >
                <Input placeholder="请输入GPU ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hostname"
                label="主机名"
                rules={[{ required: true, message: '请输入主机名' }]}
              >
                <Input placeholder="请输入主机名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ip"
                label="IP地址"
                rules={[{ required: true, message: '请输入IP地址' }]}
              >
                <Input placeholder="请输入IP地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="port"
                label="端口"
                rules={[{ required: true, message: '请输入端口' }]}
              >
                <InputNumber placeholder="请输入端口" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supportedTaskTypes"
                label="支持任务类型"
                rules={[{ required: true, message: '请选择支持的任务类型' }]}
              >
                <Select mode="multiple" placeholder="请选择任务类型">
                  <Option value={1}>类型1</Option>
                  <Option value={2}>类型2</Option>
                  <Option value={3}>类型3</Option>
                  <Option value={4}>类型4</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supportedTaskPriority"
                label="支持优先级"
                rules={[{ required: true, message: '请选择支持的优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="VIP">VIP</Option>
                  <Option value="NORMAL">普通</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxConcurrentTasks"
                label="最大并发任务数"
                rules={[{ required: true, message: '请输入最大并发任务数' }]}
              >
                <InputNumber placeholder="请输入最大并发任务数" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="版本"
                rules={[{ required: true, message: '请输入版本' }]}
              >
                <Input placeholder="请输入版本" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GpuManagement;
