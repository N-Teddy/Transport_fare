import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DriverChart = ({ data }) => {
    const chartData = {
        labels: ['Active', 'Inactive', 'Suspended', 'Revoked'],
        datasets: [
            {
                data: [
                    data?.activeDrivers || 0,
                    (data?.totalDrivers || 0) - (data?.activeDrivers || 0),
                    data?.suspendedDrivers || 0,
                    data?.revokedDrivers || 0,
                ],
                backgroundColor: [
                    '#10b981',
                    '#fbbf24',
                    '#f97316',
                    '#ef4444',
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

    return (
        <div className="h-64">
            <Doughnut data={chartData} options={options} />
        </div>
    );
};

export default DriverChart;
