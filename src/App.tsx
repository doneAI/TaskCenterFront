import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import GpuManagement from './pages/GpuManagement';
import TaskMonitoring from './pages/TaskMonitoring';
import HealthCheck from './pages/HealthCheck';
import AlertManagement from './pages/AlertManagement';
import Settings from './pages/Settings';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/gpu-management" element={<GpuManagement />} />
              <Route path="/task-monitoring" element={<TaskMonitoring />} />
              <Route path="/health-check" element={<HealthCheck />} />
              <Route path="/alert-management" element={<AlertManagement />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </AppLayout>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
