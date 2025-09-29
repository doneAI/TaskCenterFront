import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemSettings } from '../../types';

interface SettingsState extends SystemSettings {
  autoRefresh: boolean;
  refreshInterval: number;
}

const initialState: SettingsState = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v2',
  apiKey: process.env.REACT_APP_API_KEY || 'xfsdfs3fsdfsdfasdfjoiojg',
  refreshInterval: 30000,
  theme: 'light',
  language: 'zh-CN',
  autoRefresh: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
    setApiConfig: (state, action: PayloadAction<{ apiBaseUrl: string; apiKey: string }>) => {
      state.apiBaseUrl = action.payload.apiBaseUrl;
      state.apiKey = action.payload.apiKey;
    },
    setDisplaySettings: (state, action: PayloadAction<{ 
      refreshInterval: number; 
      theme: 'light' | 'dark'; 
      language: 'zh-CN' | 'en-US';
      autoRefresh: boolean;
    }>) => {
      state.refreshInterval = action.payload.refreshInterval;
      state.theme = action.payload.theme;
      state.language = action.payload.language;
      state.autoRefresh = action.payload.autoRefresh;
    },
    resetSettings: () => initialState,
  },
});

export const { updateSettings, setApiConfig, setDisplaySettings, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
