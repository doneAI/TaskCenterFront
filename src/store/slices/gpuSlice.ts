import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { gpuApi } from '../../services/gpu';
import { GpuNodeInfo } from '../../types';

interface GpuState {
  gpuList: GpuNodeInfo[];
  loading: boolean;
  error: string | null;
  selectedGpu: GpuNodeInfo | null;
  filters: {
    status?: string;
    taskType?: number;
    priority?: string;
  };
}

const initialState: GpuState = {
  gpuList: [],
  loading: false,
  error: null,
  selectedGpu: null,
  filters: {},
};

// 异步actions
export const fetchGpuList = createAsyncThunk(
  'gpu/fetchGpuList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gpuApi.getGpuList();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取GPU列表失败');
    }
  }
);

export const fetchGpusByTaskType = createAsyncThunk(
  'gpu/fetchGpusByTaskType',
  async ({ taskType, priority }: { taskType: number; priority?: string }, { rejectWithValue }) => {
    try {
      const response = await gpuApi.getGpusByTaskType(taskType, priority);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取GPU列表失败');
    }
  }
);

export const updateGpuHeartbeat = createAsyncThunk(
  'gpu/updateHeartbeat',
  async (gpuId: string, { rejectWithValue }) => {
    try {
      const response = await gpuApi.updateHeartbeat(gpuId);
      return { gpuId, response: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || '心跳更新失败');
    }
  }
);

export const markGpuAsFaulty = createAsyncThunk(
  'gpu/markAsFaulty',
  async ({ gpuId, reason }: { gpuId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await gpuApi.markGpuAsFaulty(gpuId, reason);
      return { gpuId, response: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || '标记GPU故障失败');
    }
  }
);

export const recoverGpu = createAsyncThunk(
  'gpu/recover',
  async (gpuId: string, { rejectWithValue }) => {
    try {
      const response = await gpuApi.recoverGpu(gpuId);
      return { gpuId, response: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || '恢复GPU失败');
    }
  }
);

export const registerGpu = createAsyncThunk(
  'gpu/register',
  async (gpuInfo: Partial<GpuNodeInfo>, { rejectWithValue }) => {
    try {
      const response = await gpuApi.registerGpu(gpuInfo);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '注册GPU失败');
    }
  }
);

const gpuSlice = createSlice({
  name: 'gpu',
  initialState,
  reducers: {
    setSelectedGpu: (state, action: PayloadAction<GpuNodeInfo | null>) => {
      state.selectedGpu = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<GpuState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGpuList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGpuList.fulfilled, (state, action) => {
        state.loading = false;
        state.gpuList = action.payload;
      })
      .addCase(fetchGpuList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGpusByTaskType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGpusByTaskType.fulfilled, (state, action) => {
        state.loading = false;
        state.gpuList = action.payload;
      })
      .addCase(fetchGpusByTaskType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateGpuHeartbeat.fulfilled, (state, action) => {
        const { gpuId } = action.payload;
        const gpu = state.gpuList.find(g => g.gpuId === gpuId);
        if (gpu) {
          gpu.lastHeartbeat = Date.now();
        }
      })
      .addCase(markGpuAsFaulty.fulfilled, (state, action) => {
        const { gpuId } = action.payload;
        const gpu = state.gpuList.find(g => g.gpuId === gpuId);
        if (gpu) {
          gpu.status = 'FAULTY';
        }
      })
      .addCase(recoverGpu.fulfilled, (state, action) => {
        const { gpuId } = action.payload;
        const gpu = state.gpuList.find(g => g.gpuId === gpuId);
        if (gpu) {
          gpu.status = 'ACTIVE';
        }
      });
  },
});

export const { setSelectedGpu, setFilters, clearError } = gpuSlice.actions;
export default gpuSlice.reducer;
