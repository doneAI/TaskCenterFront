import React, { useState } from 'react';
import { Layout, Menu, Button, Switch, Dropdown, Avatar } from 'antd';
import { 
  DashboardOutlined, 
  DesktopOutlined, 
  MonitorOutlined, 
  HeartOutlined, 
  BellOutlined, 
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setDisplaySettings } from '../../store/slices/settingsSlice';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { theme, autoRefresh } = useSelector((state: RootState) => state.settings);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '系统概览',
    },
    {
      key: '/gpu-management',
      icon: <DesktopOutlined />,
      label: 'GPU管理',
    },
    {
      key: '/task-monitoring',
      icon: <MonitorOutlined />,
      label: '任务监控',
    },
    {
      key: '/health-check',
      icon: <HeartOutlined />,
      label: '健康检查',
    },
    {
      key: '/alert-management',
      icon: <BellOutlined />,
      label: '告警管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleThemeChange = (checked: boolean) => {
    dispatch(setDisplaySettings({
      theme: checked ? 'dark' : 'light',
      refreshInterval: 30000,
      language: 'zh-CN',
      autoRefresh: true,
    }));
  };

  const handleAutoRefreshChange = (checked: boolean) => {
    dispatch(setDisplaySettings({
      theme: 'light',
      refreshInterval: 30000,
      language: 'zh-CN',
      autoRefresh: checked,
    }));
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 处理退出登录
      console.log('退出登录');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme={theme === 'dark' ? 'dark' : 'light'}
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme === 'dark' ? '#fff' : '#000',
          fontWeight: 'bold',
        }}>
          {collapsed ? 'TC' : '任务调度系统'}
        </div>
        <Menu
          theme={theme === 'dark' ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <span style={{ marginLeft: 16, fontSize: 18, fontWeight: 'bold' }}>
              分布式任务调度系统管理后台
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>深色主题:</span>
              <Switch 
                checked={theme === 'dark'} 
                onChange={handleThemeChange}
                size="small"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>自动刷新:</span>
              <Switch 
                checked={autoRefresh} 
                onChange={handleAutoRefreshChange}
                size="small"
              />
            </div>
            <Dropdown
              menu={{ 
                items: userMenuItems, 
                onClick: handleUserMenuClick 
              }}
              placement="bottomRight"
            >
              <Avatar 
                style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '16px', 
          padding: '24px',
          background: '#fff',
          borderRadius: 8,
          minHeight: 'calc(100vh - 112px)',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
