import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const VehicleChart = ({ data }) => {
    const chartData = {
        labels: ['Taxi', 'Bus', 'Truck'],
        datasets: [
            {
                label: 'Vehicles',
                data: [
                    data?.byType?.taxi || 0,
                    data?.byType?.bus || 0,
                    data?.byType?.truck || 0,
                ],
                backgroundColor: [
                    '#8b5cf6',
                    '#3b82f6',
                    '#f59e0b',
                ],
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <div className="h-64">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default VehicleChart;
