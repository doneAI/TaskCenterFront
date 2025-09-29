// 分布式任务调度系统管理后台 - 主应用脚本
class TaskSchedulerDashboard {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8080/api/v2';
        this.apiKey = 'xfsdfs3fsdfsdfasdfjoiojg';
        this.refreshInterval = 30000; // 30秒
        this.charts = {};
        this.refreshTimer = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadConfiguration();
        this.startAutoRefresh();
        this.loadDashboardData();
    }

    setupEventListeners() {
        // 侧边栏导航
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.dataset.section);
            });
        });

        // 系统配置表单
        document.getElementById('systemConfigForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConfiguration();
        });

        // 添加GPU表单
        document.getElementById('addGpuForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addGpu();
        });
    }

    loadConfiguration() {
        const config = localStorage.getItem('dashboardConfig');
        if (config) {
            const parsed = JSON.parse(config);
            this.apiBaseUrl = parsed.apiBaseUrl || this.apiBaseUrl;
            this.apiKey = parsed.apiKey || this.apiKey;
            this.refreshInterval = parsed.refreshInterval || this.refreshInterval;
            
            // 更新表单值
            document.getElementById('apiKey').value = this.apiKey;
            document.getElementById('serverUrl').value = this.apiBaseUrl;
            document.getElementById('refreshInterval').value = this.refreshInterval / 1000;
        }
    }

    saveConfiguration() {
        const config = {
            apiBaseUrl: document.getElementById('serverUrl').value,
            apiKey: document.getElementById('apiKey').value,
            refreshInterval: parseInt(document.getElementById('refreshInterval').value) * 1000
        };
        
        localStorage.setItem('dashboardConfig', JSON.stringify(config));
        this.apiBaseUrl = config.apiBaseUrl;
        this.apiKey = config.apiKey;
        this.refreshInterval = config.refreshInterval;
        
        this.showNotification('配置已保存', 'success');
        this.startAutoRefresh();
    }

    showSection(sectionName) {
        // 隐藏所有内容区域
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // 移除所有导航链接的active类
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // 显示选中的内容区域
        document.getElementById(sectionName).style.display = 'block';
        
        // 激活对应的导航链接
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // 加载对应数据
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'gpu':
                this.loadGpuData();
                break;
            case 'tasks':
                this.loadTaskData();
                break;
            case 'health':
                this.loadHealthData();
                break;
            case 'alerts':
                this.loadAlertData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // 加载监控概览
            const overview = await this.apiCall('/monitoring/overview');
            this.updateDashboardMetrics(overview);
            
            // 加载GPU数据
            const gpus = await this.apiCall('/gpus');
            this.updateGpuMetrics(gpus);
            
            // 加载任务数据
            const tasks = await this.apiCall('/tasks');
            this.updateTaskMetrics(tasks);
            
            // 初始化图表
            this.initCharts();
            
        } catch (error) {
            console.error('加载仪表板数据失败:', error);
            this.showNotification('加载数据失败', 'error');
        }
    }

    async loadGpuData() {
        try {
            const gpus = await this.apiCall('/gpus');
            this.updateGpuTable(gpus);
            this.updateGpuStats(gpus);
        } catch (error) {
            console.error('加载GPU数据失败:', error);
            this.showNotification('加载GPU数据失败', 'error');
        }
    }

    async loadTaskData() {
        try {
            const tasks = await this.apiCall('/tasks');
            this.updateTaskTable(tasks);
            this.updateTaskStats(tasks);
        } catch (error) {
            console.error('加载任务数据失败:', error);
            this.showNotification('加载任务数据失败', 'error');
        }
    }

    async loadHealthData() {
        try {
            const health = await this.apiCall('/monitoring/health');
            this.updateHealthStatus(health);
        } catch (error) {
            console.error('加载健康数据失败:', error);
            this.showNotification('加载健康数据失败', 'error');
        }
    }

    async loadAlertData() {
        try {
            const alerts = await this.apiCall('/monitoring/alerts');
            this.updateAlertList(alerts);
        } catch (error) {
            console.error('加载告警数据失败:', error);
            this.showNotification('加载告警数据失败', 'error');
        }
    }

    loadSettingsData() {
        // 加载系统信息
        this.loadSystemInfo();
    }

    updateDashboardMetrics(overview) {
        if (overview.metrics) {
            document.getElementById('activeGpus').textContent = overview.metrics.active_gpus || 0;
            document.getElementById('totalTasks').textContent = overview.metrics.total_tasks || 0;
            document.getElementById('queueLength').textContent = overview.metrics.queue_length || 0;
            document.getElementById('failedTasks').textContent = overview.metrics.failed_tasks || 0;
        }
    }

    updateGpuMetrics(gpus) {
        const activeGpus = gpus.filter(gpu => gpu.status === 'ACTIVE').length;
        const faultyGpus = gpus.filter(gpu => gpu.status === 'FAULTY').length;
        const offlineGpus = gpus.filter(gpu => gpu.status === 'OFFLINE').length;
        
        document.getElementById('activeGpus').textContent = activeGpus;
        document.getElementById('gpuActiveCount').textContent = activeGpus;
        document.getElementById('gpuOfflineCount').textContent = offlineGpus;
        document.getElementById('gpuFaultyCount').textContent = faultyGpus;
        document.getElementById('gpuTotalCount').textContent = gpus.length;
    }

    updateTaskMetrics(tasks) {
        const queued = tasks.filter(task => task.status === 'QUEUED').length;
        const processing = tasks.filter(task => task.status === 'PROCESSING').length;
        const completed = tasks.filter(task => task.status === 'COMPLETED').length;
        const failed = tasks.filter(task => task.status === 'FAILED').length;
        const timeout = tasks.filter(task => task.status === 'TIMEOUT').length;
        
        document.getElementById('taskQueuedCount').textContent = queued;
        document.getElementById('taskProcessingCount').textContent = processing;
        document.getElementById('taskCompletedCount').textContent = completed;
        document.getElementById('taskFailedCount').textContent = failed;
        document.getElementById('taskTimeoutCount').textContent = timeout;
        document.getElementById('taskTotalCount').textContent = tasks.length;
    }

    updateGpuTable(gpus) {
        const tbody = document.getElementById('gpuTableBody');
        tbody.innerHTML = '';
        
        gpus.forEach(gpu => {
            const row = document.createElement('tr');
            row.className = `gpu-card ${gpu.status.toLowerCase()}`;
            
            const statusBadge = this.getStatusBadge(gpu.status);
            const lastHeartbeat = new Date(gpu.lastHeartbeat).toLocaleString();
            const supportedTypes = gpu.supportedTaskTypes ? gpu.supportedTaskTypes.join(', ') : '-';
            
            row.innerHTML = `
                <td>${gpu.gpuId}</td>
                <td>${gpu.hostname || '-'}</td>
                <td>${gpu.ip || '-'}</td>
                <td>${statusBadge}</td>
                <td>${supportedTypes}</td>
                <td>${gpu.currentTasks || 0}/${gpu.maxConcurrentTasks || 0}</td>
                <td>${lastHeartbeat}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="dashboard.manageGpu('${gpu.gpuId}', 'heartbeat')">
                        <i class="bi bi-heart-pulse"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="dashboard.manageGpu('${gpu.gpuId}', 'fault')">
                        <i class="bi bi-exclamation-triangle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success btn-action" onclick="dashboard.manageGpu('${gpu.gpuId}', 'recover')">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateTaskTable(tasks) {
        const tbody = document.getElementById('taskTableBody');
        tbody.innerHTML = '';
        
        tasks.slice(0, 50).forEach(task => { // 只显示前50个任务
            const row = document.createElement('tr');
            const statusBadge = this.getStatusBadge(task.status);
            const createdAt = new Date(task.createdAt).toLocaleString();
            const progress = this.getTaskProgress(task);
            
            row.innerHTML = `
                <td>${task.taskId}</td>
                <td>${this.getTaskTypeName(task.taskType)}</td>
                <td>${statusBadge}</td>
                <td>${task.gpuId || '-'}</td>
                <td>${createdAt}</td>
                <td>${progress}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info btn-action" onclick="dashboard.viewTaskDetails('${task.taskId}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateHealthStatus(health) {
        const systemHealthDiv = document.getElementById('systemHealth');
        const componentHealthDiv = document.getElementById('componentHealth');
        
        // 系统健康状态
        systemHealthDiv.innerHTML = `
            <div class="row">
                <div class="col-6">
                    <h6>整体状态</h6>
                    <span class="status-badge ${health.overall_health === 'HEALTHY' ? 'status-online' : 'status-faulty'}">
                        ${health.overall_health || 'UNKNOWN'}
                    </span>
                </div>
                <div class="col-6">
                    <h6>检查时间</h6>
                    <small class="text-muted">${new Date(health.timestamp).toLocaleString()}</small>
                </div>
            </div>
        `;
        
        // 组件健康状态
        componentHealthDiv.innerHTML = `
            <div class="mb-2">
                <strong>GPU健康:</strong>
                <span class="status-badge ${health.gpu_health === 'HEALTHY' ? 'status-online' : 'status-faulty'}">
                    ${health.gpu_health || 'UNKNOWN'}
                </span>
            </div>
            <div class="mb-2">
                <strong>队列健康:</strong>
                <span class="status-badge ${health.queue_health === 'HEALTHY' ? 'status-online' : 'status-faulty'}">
                    ${health.queue_health || 'UNKNOWN'}
                </span>
            </div>
            <div class="mb-2">
                <strong>活跃GPU:</strong> ${health.active_gpu_count || 0}
            </div>
            <div class="mb-2">
                <strong>总GPU:</strong> ${health.total_gpu_count || 0}
            </div>
        `;
    }

    updateAlertList(alerts) {
        const alertListDiv = document.getElementById('alertList');
        
        if (alerts.length === 0) {
            alertListDiv.innerHTML = '<p class="text-muted">暂无告警</p>';
            return;
        }
        
        alertListDiv.innerHTML = alerts.map(alert => `
            <div class="alert alert-${this.getAlertLevelClass(alert.level)} alert-item">
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>${alert.title}</strong>
                        <p class="mb-1">${alert.message}</p>
                        <small class="text-muted">${new Date(alert.timestamp).toLocaleString()}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-secondary" onclick="dashboard.acknowledgeAlert('${alert.id}')">
                            确认
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    initCharts() {
        // 任务执行趋势图
        const taskTrendCtx = document.getElementById('taskTrendChart').getContext('2d');
        this.charts.taskTrend = new Chart(taskTrendCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: '完成任务',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    tension: 0.4
                }, {
                    label: '失败任务',
                    data: [2, 3, 1, 4, 1, 2],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });

        // GPU状态分布图
        const gpuStatusCtx = document.getElementById('gpuStatusChart').getContext('2d');
        this.charts.gpuStatus = new Chart(gpuStatusCtx, {
            type: 'doughnut',
            data: {
                labels: ['活跃', '离线', '故障'],
                datasets: [{
                    data: [8, 2, 1],
                    backgroundColor: ['#198754', '#ffc107', '#dc3545'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    getStatusBadge(status) {
        const statusMap = {
            'ACTIVE': { class: 'status-online', text: '活跃' },
            'OFFLINE': { class: 'status-offline', text: '离线' },
            'FAULTY': { class: 'status-faulty', text: '故障' },
            'QUEUED': { class: 'status-online', text: '排队' },
            'PROCESSING': { class: 'status-online', text: '处理中' },
            'COMPLETED': { class: 'status-online', text: '已完成' },
            'FAILED': { class: 'status-faulty', text: '失败' },
            'TIMEOUT': { class: 'status-faulty', text: '超时' }
        };
        
        const statusInfo = statusMap[status] || { class: 'status-offline', text: status };
        return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
    }

    getTaskTypeName(taskType) {
        const typeMap = {
            2: 'FaceSwapTask',
            3: 'ClothesSwapTask',
            4: 'ClothesRemoveTask',
            5: 'VideoFaceSwapTask',
            6: 'UpscaleTask',
            7: 'ClayStylizationTask'
        };
        return typeMap[taskType] || `TaskType-${taskType}`;
    }

    getTaskProgress(task) {
        if (task.status === 'COMPLETED') return '100%';
        if (task.status === 'PROCESSING') return '50%';
        if (task.status === 'QUEUED') return '0%';
        return '-';
    }

    getAlertLevelClass(level) {
        const levelMap = {
            'CRITICAL': 'danger',
            'WARNING': 'warning',
            'INFO': 'info'
        };
        return levelMap[level] || 'info';
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result.data;
    }

    async manageGpu(gpuId, action) {
        try {
            let endpoint = '';
            let method = 'POST';
            
            switch(action) {
                case 'heartbeat':
                    endpoint = `/gpus/${gpuId}/heartbeat`;
                    break;
                case 'fault':
                    endpoint = `/gpus/${gpuId}/fault?reason=手动标记`;
                    break;
                case 'recover':
                    endpoint = `/gpus/${gpuId}/recover`;
                    break;
            }
            
            await this.apiCall(endpoint, method);
            this.showNotification(`GPU ${action} 操作成功`, 'success');
            this.loadGpuData();
            
        } catch (error) {
            console.error(`GPU ${action} 操作失败:`, error);
            this.showNotification(`GPU ${action} 操作失败`, 'error');
        }
    }

    async addGpu() {
        try {
            const formData = {
                gpuId: document.getElementById('gpuId').value,
                hostname: document.getElementById('hostname').value,
                ip: document.getElementById('ip').value,
                port: parseInt(document.getElementById('port').value),
                supportedTaskTypes: Array.from(document.getElementById('supportedTaskTypes').selectedOptions)
                    .map(option => parseInt(option.value))
            };
            
            await this.apiCall('/gpus/register', 'POST', formData);
            this.showNotification('GPU添加成功', 'success');
            document.getElementById('addGpuModal').querySelector('.btn-close').click();
            this.loadGpuData();
            
        } catch (error) {
            console.error('添加GPU失败:', error);
            this.showNotification('添加GPU失败', 'error');
        }
    }

    showAddGpuModal() {
        const modal = new bootstrap.Modal(document.getElementById('addGpuModal'));
        modal.show();
    }

    viewTaskDetails(taskId) {
        this.showNotification(`查看任务详情: ${taskId}`, 'info');
        // 这里可以实现任务详情查看功能
    }

    acknowledgeAlert(alertId) {
        this.showNotification(`告警 ${alertId} 已确认`, 'success');
        // 这里可以实现告警确认功能
    }

    loadSystemInfo() {
        // 模拟系统信息
        document.getElementById('uptime').textContent = '2天 14小时 32分钟';
        document.getElementById('instanceId').textContent = 'instance-001';
        document.getElementById('clusterStatus').textContent = 'Leader';
    }

    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            this.refreshCurrentSection();
        }, this.refreshInterval);
    }

    refreshCurrentSection() {
        const activeSection = document.querySelector('.nav-link.active');
        if (activeSection) {
            this.loadSectionData(activeSection.dataset.section);
        }
    }

    refreshAllData() {
        this.loadDashboardData();
        this.showNotification('数据已刷新', 'success');
    }

    refreshGpuData() {
        this.loadGpuData();
        this.showNotification('GPU数据已刷新', 'success');
    }

    refreshTaskData() {
        this.loadTaskData();
        this.showNotification('任务数据已刷新', 'success');
    }

    refreshHealthData() {
        this.loadHealthData();
        this.showNotification('健康数据已刷新', 'success');
    }

    refreshAlertData() {
        this.loadAlertData();
        this.showNotification('告警数据已刷新', 'success');
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// 全局函数
function refreshData() {
    dashboard.refreshAllData();
}

function refreshGpuData() {
    dashboard.refreshGpuData();
}

function refreshTaskData() {
    dashboard.refreshTaskData();
}

function refreshHealthData() {
    dashboard.refreshHealthData();
}

function refreshAlertData() {
    dashboard.refreshAlertData();
}

function refreshAllData() {
    dashboard.refreshAllData();
}

function showAddGpuModal() {
    dashboard.showAddGpuModal();
}

function addGpu() {
    dashboard.addGpu();
}

// 初始化应用
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new TaskSchedulerDashboard();
});
