import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const TimeSeriesChart = ({ timeseries, region }) => {
    if (!timeseries || timeseries.length === 0) {
        return region ? <p>No timeseries data available for this region.</p> : null;
    }

    const filtered = timeseries.filter(item => Math.abs(item.value) <= 10);
    if (filtered.length === 0) {
        return <p>All values are outliers for this region. Nothing to display.</p>;
    }

    const data = {
        labels: filtered.map((_, index) => index + 1),
        datasets: [{
            label: `Region ${region} Activity`,
            data: filtered.map(item => item.value),
            fill: false,
            borderWidth: 2,
            borderColor: '#97b5b5',
            pointRadius: 2
        }]
    };

    const options = {
        plugins: {
            legend: {
                labels: {
                    color: '#fff'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#fff'
                }
            },
            y: {
                suggestedMin: -2,
                suggestedMax: 2,
                ticks: {
                    stepSize: 1,
                    color: '#fff'
                }
            }
        }
    };

    return (
        <div style={{ maxWidth: '600px', marginTop: '2rem' }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default TimeSeriesChart;
