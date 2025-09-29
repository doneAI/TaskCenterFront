import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { GpuStatusStats } from '../../types';

interface GpuStatusChartProps {
  data: GpuStatusStats;
  height?: number;
}

const GpuStatusChart: React.FC<GpuStatusChartProps> = ({ data, height = 300 }) => {
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
          text: 'GPU状态分布',
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
          data: ['活跃', '离线', '故障'],
        },
        series: [
          {
            name: 'GPU状态',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            data: [
              { value: data.ACTIVE, name: '活跃', itemStyle: { color: '#52c41a' } },
              { value: data.OFFLINE, name: '离线', itemStyle: { color: '#faad14' } },
              { value: data.FAULTY, name: '故障', itemStyle: { color: '#ff4d4f' } },
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

export default GpuStatusChart;
