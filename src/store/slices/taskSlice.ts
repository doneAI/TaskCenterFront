import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskApi } from '../../services/task';
import { TaskInfo, TaskProgress, PaginationParams, FilterParams } from '../../types';

interface TaskState {
  taskList: TaskInfo[];
  loading: boolean;
  error: string | null;
  selectedTask: TaskInfo | null;
  taskProgress: TaskProgress | null;
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  filters: FilterParams;
}

const initialState: TaskState = {
  taskList: [],
  loading: false,
  error: null,
  selectedTask: null,
  taskProgress: null,
  pagination: {
    page: 1,
    size: 20,
    total: 0,
  },
  filters: {},
};

// 异步actions
export const fetchTaskList = createAsyncThunk(
  'task/fetchTaskList',
  async (params: PaginationParams & FilterParams = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskList(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取任务列表失败');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'task/fetchTaskById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskById(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取任务详情失败');
    }
  }
);

export const fetchTaskProgress = createAsyncThunk(
  'task/fetchTaskProgress',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskProgress(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取任务进度失败');
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData: {
    taskType: number;
    userId: string;
    app: string;
    priority: number;
    payload: string;
    env?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(taskData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '创建任务失败');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'task/updateTaskStatus',
  async ({ taskId, statusData }: { 
    taskId: string; 
    statusData: { status: string; gpuId?: string; message?: string } 
  }, { rejectWithValue }) => {
    try {
      const response = await taskApi.updateTaskStatus(taskId, statusData);
      return { taskId, statusData, response: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || '更新任务状态失败');
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<TaskInfo | null>) => {
      state.selectedTask = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<TaskState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskList.fulfilled, (state, action) => {
        state.loading = false;
        state.taskList = action.payload;
      })
      .addCase(fetchTaskList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskProgress.fulfilled, (state, action) => {
        state.taskProgress = action.payload;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const { taskId, statusData } = action.payload;
        const task = state.taskList.find(t => t.taskId === taskId);
        if (task) {
          task.status = statusData.status as any;
          task.gpuId = statusData.gpuId;
          task.updatedAt = Date.now();
        }
      });
  },
});

export const { setSelectedTask, setFilters, setPagination, clearError } = taskSlice.actions;
export default taskSlice.reducer;
