import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { TaskStatusStats } from '../../types';

interface TaskStatusChartProps {
  data: TaskStatusStats;
  height?: number;
}

const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ data, height = 300 }) => {
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
          text: '任务状态分布',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['排队', '处理中', '已完成', '失败', '超时'],
        },
        series: [
          {
            name: '任务状态',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            data: [
              { value: data.QUEUED, name: '排队', itemStyle: { color: '#1890ff' } },
              { value: data.PROCESSING, name: '处理中', itemStyle: { color: '#722ed1' } },
              { value: data.COMPLETED, name: '已完成', itemStyle: { color: '#52c41a' } },
              { value: data.FAILED, name: '失败', itemStyle: { color: '#ff4d4f' } },
              { value: data.TIMEOUT, name: '超时', itemStyle: { color: '#fa8c16' } },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            label: {
              show: true,
              formatter: '{b}: {c}',
            },
            labelLine: {
              show: true,
            },
          },
        ],
      };

      chartInstance.current.setOption(option);
    }
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />;
};

export default TaskStatusChart;
