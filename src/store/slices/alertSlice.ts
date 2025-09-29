import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { alertApi } from '../../services/alert';
import { AlertInfo, AlertStats, PaginationParams, FilterParams } from '../../types';

interface AlertState {
  alertList: AlertInfo[];
  alertStats: AlertStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  filters: FilterParams;
}

const initialState: AlertState = {
  alertList: [],
  alertStats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    size: 20,
    total: 0,
  },
  filters: {},
};

// 异步actions
export const fetchAlertList = createAsyncThunk(
  'alert/fetchAlertList',
  async (params: PaginationParams & FilterParams = {}, { rejectWithValue }) => {
    try {
      const response = await alertApi.getAlertList(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取告警列表失败');
    }
  }
);

export const fetchAlertStats = createAsyncThunk(
  'alert/fetchAlertStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await alertApi.getAlertStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取告警统计失败');
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'alert/acknowledgeAlert',
  async (alertId: string, { rejectWithValue }) => {
    try {
      const response = await alertApi.acknowledgeAlert(alertId);
      return { alertId, response: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || '确认告警失败');
    }
  }
);

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FilterParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<AlertState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlertList.fulfilled, (state, action) => {
        state.loading = false;
        state.alertList = action.payload;
      })
      .addCase(fetchAlertList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAlertStats.fulfilled, (state, action) => {
        state.alertStats = action.payload;
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const { alertId } = action.payload;
        const alert = state.alertList.find(a => a.id === alertId);
        if (alert) {
          alert.status = 'ACKNOWLEDGED';
          alert.acknowledgedAt = Date.now();
        }
      });
  },
});

export const { setFilters, setPagination, clearError } = alertSlice.actions;
export default alertSlice.reducer;
