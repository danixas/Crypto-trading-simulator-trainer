// frontend/src/components/Live.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Live = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: 'BTC Price (USD)',
            data: [],
            borderColor: 'rgb(33, 158, 188)',
            backgroundColor: 'rgba(33, 158, 188, 0.5)',
        }],
    });
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch('http://localhost:8000/api/crypto/fetch_live_data/')
                .then(response => response.json())
                .then(data => {
                    setChartData(prevState => ({
                        ...prevState,
                        labels: [...prevState.labels, new Date(data.last_updated_at * 1000).toLocaleTimeString()],
                        datasets: [{
                            ...prevState.datasets[0],
                            data: [...prevState.datasets[0].data, data.usd],
                        }]
                    }));
                    setLoading(false);
                })
                .catch(error => console.error('Error fetching live data:', error));
        }, 60000);  // fetches data every minute

        return () => clearInterval(interval);
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (!chartData.datasets[0].data.length) return <div>No data available</div>;

    return (
        <div>
            <h2>Live Bitcoin Price Chart</h2>
            <Line data={chartData} />
        </div>
    );
};

export default Live;
