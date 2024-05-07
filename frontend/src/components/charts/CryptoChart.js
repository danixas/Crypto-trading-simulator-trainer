import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Chart, registerables, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const CryptoChart = ({ coin, days, live, onPriceUpdate, simulationSpeed, setLatestPrice, selectedSavedStrategy }) => {
  const chartRef = useRef(null);
  const [prices, setPrices] = useState([]);
  const [liveIndex, setLiveIndex] = useState(0);
  const [chartInstance, setChartInstance] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    if (selectedSavedStrategy) {
      const fetchSignals = async () => {
        try {
          const params = new URLSearchParams({ coin_id: coin, days: days });
          const response = await axios.post(`http://localhost:8000/api/strategies/live_backtest/mac/`, {
            strategy_name: selectedSavedStrategy.strategy_name,
            coin: coin,
            days: days,
            initial_capital: 1000,
            max_trade_size_percent: 1,
            short_term: selectedSavedStrategy.short_term,
            long_term: selectedSavedStrategy.long_term,
          }, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
            }
          });
          if (response.status === 200) {
            setSignals(response.data.signals);
          }
        } catch (error) {
          console.error('Error fetching signals:', error);
        }
      };

      fetchSignals();
    }
  }, [selectedSavedStrategy, coin, days]);

  useEffect(() => {
    // Fetch historical data when not in live mode or on initial load
    if (!live) {
      fetchData();
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }
    };
  }, [coin, days, live]); // Dependencies include coin, days, and live mode

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({ coin_id: coin, days: days });
      const response = await axios.get(`http://localhost:8000/api/crypto/fetch_historical_data/?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
        }
      });
      if (response.status === 200 && response.data.length > 0) {
        const formattedPrices = response.data.map(item => ({
          x: new Date(item.timestamp),
          y: item.price
        }));
        setPrices(formattedPrices);
        initChart(formattedPrices); // Initialize chart with historical data
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const initChart = (data) => {
    if (chartInstance) {
      chartInstance.destroy();
      setChartInstance(null) // Destroy existing chart to avoid reuse problem
    }
    const ctx = chartRef.current.getContext('2d');
    const newChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(p => p.x),
        datasets: [{
          label: `${coin} Price`,
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          pointRadius: 0 // Removes dots for a cleaner line
        }]
      },
      options: {
       scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'MMM dd, yyyy HH:mm'
            }
          },
          y: {
            beginAtZero: false,
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.formattedValue;
                const signal = signals.find((signal) => signal.timestamp === context.parsed.x.getTime());
                if (signal) {
                  return `${label}: ${value} (${signal.signal})`;
                }
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    });
    setChartInstance(newChartInstance);
  };

  useEffect(() => {
    if (live && !isPaused) {
      //setLiveIndex(0); // Reset the live index when toggling live mode
      initChart([]); // Initialize chart with no data for live mode
    }
  }, [live]);

  useEffect(() => {
    let intervalId;
    if (live && !isPaused && chartInstance) {
      intervalId = setInterval(() => {
        if (liveIndex < prices.length) {
          const nextPrice = prices[liveIndex];
          chartInstance.data.labels.push(nextPrice.x);
          chartInstance.data.datasets.forEach(dataset => {
            dataset.data.push(nextPrice.y);
          });
          chartInstance.update();
          onPriceUpdate(nextPrice.y);
          setLiveIndex(liveIndex + 1);
        } else {
          clearInterval(intervalId); // Stop the interval when all data has been plotted
        }
      }, simulationSpeed);

      return () => clearInterval(intervalId);
    }
  }, [live, liveIndex, prices, simulationSpeed, chartInstance, onPriceUpdate, isPaused]);

  return (
    <div style={{ height: '400px' }}>
      {live && (
        <button onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? <i className="bi bi-play-fill"></i> : <i className="bi bi-pause-fill"></i>}
        </button>
      )}
      <canvas ref={chartRef} />
    </div>
  );
};

export default CryptoChart;