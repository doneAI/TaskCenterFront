import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { TaskTrendData } from '../../types';

interface TaskTrendChartProps {
  data: TaskTrendData;
  height?: number;
}

const TaskTrendChart: React.FC<TaskTrendChartProps> = ({ data, height = 400 }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstance.current && data) {
      const option = {
        title: {
          text: '任务执行趋势',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        legend: {
          data: ['完成任务', '失败任务'],
          top: 30,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: data.labels,
          axisLabel: {
            rotate: 45,
          },
        },
        yAxis: {
          type: 'value',
          name: '任务数量',
        },
        series: [
          {
            name: '完成任务',
            type: 'line',
            data: data.completed,
            smooth: true,
            itemStyle: {
              color: '#52c41a',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                  { offset: 1, color: 'rgba(82, 196, 26, 0.1)' },
                ],
              },
            },
          },
          {
            name: '失败任务',
            type: 'line',
            data: data.failed,
            smooth: true,
            itemStyle: {
              color: '#ff4d4f',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
                  { offset: 1, color: 'rgba(255, 77, 79, 0.1)' },
                ],
              },
            },
          },
        ],
      };

      chartInstance.current.setOption(option);
    }
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />;
};

export default TaskTrendChart;
