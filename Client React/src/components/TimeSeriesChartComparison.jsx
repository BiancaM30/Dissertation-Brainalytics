import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const TimeSeriesChartComparison = ({ data1, data2, region, patient1Id, patient2Id }) => {
    const filtered1 = data1.filter(d => Math.abs(d.value) <= 10);
    const filtered2 = data2.filter(d => Math.abs(d.value) <= 10);

    const chartData = {
        labels: filtered1.map((_, i) => i + 1),
        datasets: [
            {
                label: patient1Id ? `Patient ${patient1Id}` : 'Patient 1',
                data: filtered1.map(d => d.value),
                borderColor: '#97b5b5',
                backgroundColor: '#97b5b5',
                pointRadius: 1,
                fill: false,
                tension: 0.3
            },
            {
                label: patient2Id ? `Patient ${patient2Id}` : 'Patient 2',
                data: filtered2.map(d => d.value),
                borderColor: '#ffa500',
                backgroundColor: '#ffa500',
                pointRadius: 1,
                fill: false,
                tension: 0.3
            }
        ]
    };

    const options = {
        plugins: {
            legend: {
                labels: {
                    color: '#fff'
                }
            },
            title: {
                display: true,
                text: `Region: ${region}`,
                color: '#fff'
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#fff'
                }
            },
            y: {
                ticks: {
                    color: '#fff'
                },
                suggestedMin: -2,
                suggestedMax: 2,
                stepSize: 1
            }
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default TimeSeriesChartComparison;
