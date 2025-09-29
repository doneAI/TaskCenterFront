import { configureStore } from '@reduxjs/toolkit';
import gpuSlice from './slices/gpuSlice';
import taskSlice from './slices/taskSlice';
import monitoringSlice from './slices/monitoringSlice';
import alertSlice from './slices/alertSlice';
import settingsSlice from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    gpu: gpuSlice,
    task: taskSlice,
    monitoring: monitoringSlice,
    alert: alertSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
