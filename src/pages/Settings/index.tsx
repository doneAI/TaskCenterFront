import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  InputNumber, 
  message, 
  Row, 
  Col, 
  Divider,
  Space,
  Alert,
  Descriptions,
} from 'antd';
import { 
  SaveOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  setApiConfig, 
  setDisplaySettings, 
  resetSettings,
  updateSettings,
} from '../../store/slices/settingsSlice';
import { monitoringApi } from '../../services/monitoring';

const { Option } = Select;

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.settings);
  const [form] = Form.useForm();
  const [displayForm] = Form.useForm();
  const [testing, setTesting] = useState(false);

  const handleApiConfigSave = async (values: any) => {
    try {
      dispatch(setApiConfig({
        apiBaseUrl: values.apiBaseUrl,
        apiKey: values.apiKey,
      }));
      message.success('API配置已保存');
    } catch (error) {
      message.error('保存API配置失败');
    }
  };

  const handleDisplaySettingsSave = async (values: any) => {
    try {
      dispatch(setDisplaySettings({
        refreshInterval: values.refreshInterval,
        theme: values.theme,
        language: values.language,
        autoRefresh: values.autoRefresh,
      }));
      message.success('显示设置已保存');
    } catch (error) {
      message.error('保存显示设置失败');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await monitoringApi.getOverview();
      message.success('连接测试成功');
    } catch (error) {
      message.error('连接测试失败，请检查API配置');
    } finally {
      setTesting(false);
    }
  };

  const handleResetSettings = () => {
    dispatch(resetSettings());
    form.resetFields();
    displayForm.resetFields();
    message.success('设置已重置');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>系统设置</h1>
      </div>

      <Row gutter={[16, 16]}>
        {/* API配置 */}
        <Col xs={24} lg={12}>
          <Card title="API配置" extra={
            <Button 
              icon={<CheckCircleOutlined />} 
              onClick={handleTestConnection}
              loading={testing}
            >
              测试连接
            </Button>
          }>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                apiBaseUrl: settings.apiBaseUrl,
                apiKey: settings.apiKey,
              }}
              onFinish={handleApiConfigSave}
            >
              <Form.Item
                name="apiBaseUrl"
                label="API基础URL"
                rules={[{ required: true, message: '请输入API基础URL' }]}
              >
                <Input placeholder="http://localhost:8080/api/v2" />
              </Form.Item>
              <Form.Item
                name="apiKey"
                label="API密钥"
                rules={[{ required: true, message: '请输入API密钥' }]}
              >
                <Input.Password placeholder="请输入API密钥" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    保存配置
                  </Button>
                  <Button onClick={() => form.resetFields()}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 显示设置 */}
        <Col xs={24} lg={12}>
          <Card title="显示设置">
            <Form
              form={displayForm}
              layout="vertical"
              initialValues={{
                refreshInterval: settings.refreshInterval,
                theme: settings.theme,
                language: settings.language,
                autoRefresh: settings.autoRefresh,
              }}
              onFinish={handleDisplaySettingsSave}
            >
              <Form.Item
                name="refreshInterval"
                label="自动刷新间隔（毫秒）"
                rules={[{ required: true, message: '请输入刷新间隔' }]}
              >
                <InputNumber 
                  min={5000} 
                  max={300000} 
                  step={5000}
                  style={{ width: '100%' }}
                  placeholder="30000"
                />
              </Form.Item>
              <Form.Item
                name="theme"
                label="主题"
                rules={[{ required: true, message: '请选择主题' }]}
              >
                <Select>
                  <Option value="light">浅色主题</Option>
                  <Option value="dark">深色主题</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="language"
                label="语言"
                rules={[{ required: true, message: '请选择语言' }]}
              >
                <Select>
                  <Option value="zh-CN">简体中文</Option>
                  <Option value="en-US">English</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="autoRefresh"
                label="自动刷新"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    保存设置
                  </Button>
                  <Button onClick={() => displayForm.resetFields()}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* 系统信息 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="系统信息">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="应用名称">
                分布式任务调度系统管理后台
              </Descriptions.Item>
              <Descriptions.Item label="版本">
                1.0.0
              </Descriptions.Item>
              <Descriptions.Item label="构建时间">
                {new Date().toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="运行环境">
                {process.env.NODE_ENV === 'production' ? '生产环境' : '开发环境'}
              </Descriptions.Item>
              <Descriptions.Item label="API地址">
                {settings.apiBaseUrl}
              </Descriptions.Item>
              <Descriptions.Item label="当前主题">
                {settings.theme === 'light' ? '浅色主题' : '深色主题'}
              </Descriptions.Item>
              <Descriptions.Item label="当前语言">
                {settings.language === 'zh-CN' ? '简体中文' : 'English'}
              </Descriptions.Item>
              <Descriptions.Item label="自动刷新">
                {settings.autoRefresh ? '已启用' : '已禁用'}
              </Descriptions.Item>
              <Descriptions.Item label="刷新间隔">
                {settings.refreshInterval}ms
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="操作">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="重置设置"
                description="重置所有设置到默认值，此操作不可撤销。"
                type="warning"
                showIcon
                icon={<InfoCircleOutlined />}
              />
              <Button 
                danger 
                onClick={handleResetSettings}
                icon={<ReloadOutlined />}
                style={{ width: '100%' }}
              >
                重置所有设置
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" title="API配置">
              <ul>
                <li>API基础URL：后端API服务的地址</li>
                <li>API密钥：用于身份验证的密钥</li>
                <li>点击"测试连接"验证配置是否正确</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" title="显示设置">
              <ul>
                <li>刷新间隔：数据自动刷新的时间间隔</li>
                <li>主题：选择浅色或深色主题</li>
                <li>语言：选择界面显示语言</li>
                <li>自动刷新：是否启用数据自动刷新</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" title="注意事项">
              <ul>
                <li>修改API配置后需要重新测试连接</li>
                <li>刷新间隔建议设置在5-300秒之间</li>
                <li>重置设置会清除所有自定义配置</li>
                <li>设置会自动保存到本地存储</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Settings;
