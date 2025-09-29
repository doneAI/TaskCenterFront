import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { monitoringApi } from '../../services/monitoring';
import { MonitoringOverview, HealthStatus, MonitoringMetrics, ClusterStatus } from '../../types';

interface MonitoringState {
  overview: MonitoringOverview | null;
  health: HealthStatus | null;
  metrics: MonitoringMetrics | null;
  clusterStatus: ClusterStatus | null;
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
}

const initialState: MonitoringState = {
  overview: null,
  health: null,
  metrics: null,
  clusterStatus: null,
  loading: false,
  error: null,
  lastUpdate: null,
};

// 异步actions
export const fetchOverview = createAsyncThunk(
  'monitoring/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await monitoringApi.getOverview();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取监控概览失败');
    }
  }
);

export const fetchHealth = createAsyncThunk(
  'monitoring/fetchHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await monitoringApi.getHealth();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取健康状态失败');
    }
  }
);

export const fetchMetrics = createAsyncThunk(
  'monitoring/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await monitoringApi.getMetrics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取监控指标失败');
    }
  }
);

export const fetchClusterStatus = createAsyncThunk(
  'monitoring/fetchClusterStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await monitoringApi.getClusterStatus();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取集群状态失败');
    }
  }
);

export const triggerCheck = createAsyncThunk(
  'monitoring/triggerCheck',
  async (_, { rejectWithValue }) => {
    try {
      const response = await monitoringApi.triggerCheck();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '触发监控检查失败');
    }
  }
);

export const triggerHealthCheck = createAsyncThunk(
  'monitoring/triggerHealthCheck',
  async (_, { rejectWithValue }) => {
    try {
      const response = await monitoringApi.triggerHealthCheck();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '触发健康检查失败');
    }
  }
);

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLastUpdate: (state, action: PayloadAction<number>) => {
      state.lastUpdate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
        state.lastUpdate = Date.now();
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHealth.fulfilled, (state, action) => {
        state.health = action.payload;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })
      .addCase(fetchClusterStatus.fulfilled, (state, action) => {
        state.clusterStatus = action.payload;
      });
  },
});

export const { clearError, setLastUpdate } = monitoringSlice.actions;
export default monitoringSlice.reducer;
