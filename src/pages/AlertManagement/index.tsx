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
  Row,
  Col,
  Statistic,
  Badge,
  Popconfirm,
} from 'antd';
import { 
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchAlertList, 
  fetchAlertStats,
  acknowledgeAlert,
  setFilters,
  setPagination,
} from '../../store/slices/alertSlice';
import { AlertInfo } from '../../types';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

const { Option } = Select;

const AlertManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { alertList, alertStats, loading, error, pagination, filters } = useSelector((state: RootState) => state.alert);
  const { autoRefresh, refreshInterval } = useSelector((state: RootState) => state.settings);
  const [searchText, setSearchText] = useState('');

  const refreshData = () => {
    dispatch(fetchAlertList({ 
      page: pagination.page, 
      size: pagination.size, 
      ...filters 
    }));
    dispatch(fetchAlertStats());
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

  const handleAcknowledge = async (alertId: string) => {
    try {
      await dispatch(acknowledgeAlert(alertId)).unwrap();
      message.success('告警已确认');
      refreshData();
    } catch (error) {
      message.error('确认告警失败');
    }
  };

  const getLevelTag = (level: string) => {
    const levelMap = {
      CRITICAL: { color: 'error', text: '严重', icon: <ExclamationCircleOutlined /> },
      WARNING: { color: 'warning', text: '警告', icon: <ExclamationCircleOutlined /> },
      INFO: { color: 'processing', text: '信息', icon: <InfoCircleOutlined /> },
    };
    const levelInfo = levelMap[level as keyof typeof levelMap] || { color: 'default', text: level, icon: null };
    return (
      <Tag color={levelInfo.color} icon={levelInfo.icon}>
        {levelInfo.text}
      </Tag>
    );
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      ACTIVE: { color: 'error', text: '活跃' },
      ACKNOWLEDGED: { color: 'success', text: '已确认' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // 筛选后的数据
  const filteredData = alertList.filter(alert => {
    const matchesSearch = !searchText || 
      alert.title.toLowerCase().includes(searchText.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchText.toLowerCase()) ||
      alert.source.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  });

  const columns = [
    {
      title: '告警ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      width: 300,
      ellipsis: true,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => getLevelTag(level),
      filters: [
        { text: '严重', value: 'CRITICAL' },
        { text: '警告', value: 'WARNING' },
        { text: '信息', value: 'INFO' },
      ],
      onFilter: (value: any, record: AlertInfo) => record.level === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: '活跃', value: 'ACTIVE' },
        { text: '已确认', value: 'ACKNOWLEDGED' },
      ],
      onFilter: (value: any, record: AlertInfo) => record.status === value,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
      sorter: (a: AlertInfo, b: AlertInfo) => a.timestamp - b.timestamp,
    },
    {
      title: '确认时间',
      dataIndex: 'acknowledgedAt',
      key: 'acknowledgedAt',
      width: 150,
      render: (timestamp: number) => timestamp ? new Date(timestamp).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (record: AlertInfo) => (
        <Space>
          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="确定要确认此告警吗？"
              onConfirm={() => handleAcknowledge(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                size="small" 
                type="primary"
                icon={<CheckCircleOutlined />}
              >
                确认
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>告警管理</h1>
        <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
          刷新
        </Button>
      </div>

      {/* 告警统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic 
              title="总告警数" 
              value={alertStats?.total_alerts || 0}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="严重告警" 
              value={alertStats?.critical_alerts || 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="警告告警" 
              value={alertStats?.warning_alerts || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="信息告警" 
              value={alertStats?.info_alerts || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="已确认" 
              value={alertStats?.acknowledged_alerts || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="活跃告警" 
              value={alertStats?.active_alerts || 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索和筛选 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索告警标题、消息或来源"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="级别筛选"
            style={{ width: 120 }}
            allowClear
            value={filters.level}
            onChange={(value) => dispatch(setFilters({ level: value }))}
          >
            <Option value="CRITICAL">严重</Option>
            <Option value="WARNING">警告</Option>
            <Option value="INFO">信息</Option>
          </Select>
          <Select
            placeholder="状态筛选"
            style={{ width: 120 }}
            allowClear
            value={filters.status}
            onChange={(value) => dispatch(setFilters({ status: value }))}
          >
            <Option value="ACTIVE">活跃</Option>
            <Option value="ACKNOWLEDGED">已确认</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
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
    </div>
  );
};

export default AlertManagement;
