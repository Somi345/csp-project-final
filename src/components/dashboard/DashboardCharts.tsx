import React, { useEffect, useRef } from 'react';
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  BarController
} from 'chart.js';
import { Farmer, MonthlySurvey } from '../../types';

// Register Chart.js components once
Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  BarController
);

interface DashboardChartsProps {
  farmers: Farmer[];
  surveys: MonthlySurvey[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  farmers,
  surveys
}) => {
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const surveyCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const cropChartInstance = useRef<Chart | null>(null);
  const surveyChartInstance = useRef<Chart | null>(null);

  // 1. Crop Distribution Chart
  useEffect(() => {
    if (!cropCanvasRef.current) return;
    cropChartInstance.current?.destroy();

    const cropCounts: Record<string, number> = {};
    farmers.forEach(f => {
      const crop = f.primaryCrop || 'Unspecified';
      cropCounts[crop] = (cropCounts[crop] || 0) + 1;
    });

    const labels = Object.keys(cropCounts);
    const data = Object.values(cropCounts);

    if (labels.length === 0) return;

    const ctx = cropCanvasRef.current.getContext('2d');
    if (!ctx) return;

    cropChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              '#2563eb', // blue
              '#059669', // emerald
              '#d97706', // amber
              '#7c3aed', // purple
              '#0284c7', // sky
              '#e11d48'  // rose
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 12,
              font: { size: 11, family: 'sans-serif' }
            }
          }
        },
        cutout: '65%'
      }
    });

    return () => {
      cropChartInstance.current?.destroy();
    };
  }, [farmers]);

  // 2. Survey Status Chart
  useEffect(() => {
    if (!surveyCanvasRef.current) return;
    surveyChartInstance.current?.destroy();

    const monthCounts: Record<string, number> = {};
    surveys.forEach(s => {
      const month = s.month || s.surveyDate.slice(0, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthCounts).sort();
    const data = sortedMonths.map(m => monthCounts[m]);

    if (sortedMonths.length === 0) return;

    const ctx = surveyCanvasRef.current.getContext('2d');
    if (!ctx) return;

    surveyChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedMonths.map(m => {
          try {
            const [y, mm] = m.split('-');
            const date = new Date(parseInt(y), parseInt(mm) - 1, 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          } catch {
            return m;
          }
        }),
        datasets: [
          {
            label: 'Completed Surveys',
            data,
            backgroundColor: '#2563eb',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 11 } },
            grid: { color: '#f1f5f9' }
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    return () => {
      surveyChartInstance.current?.destroy();
    };
  }, [surveys]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Chart 1: Crop Distribution */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Crop Distribution</h4>
            <p className="text-xs text-slate-500">Distribution of primary crops across registered farmers</p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            {farmers.length} Farmers
          </span>
        </div>
        <div className="h-64 w-full">
          {farmers.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No crop distribution data available.
            </div>
          ) : (
            <canvas ref={cropCanvasRef} />
          )}
        </div>
      </div>

      {/* Chart 2: Survey Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Survey Status</h4>
            <p className="text-xs text-slate-500">Number of field surveys completed by month</p>
          </div>
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
            {surveys.length} Total Surveys
          </span>
        </div>
        <div className="h-64 w-full">
          {surveys.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No survey records available.
            </div>
          ) : (
            <canvas ref={surveyCanvasRef} />
          )}
        </div>
      </div>
    </div>
  );
};
