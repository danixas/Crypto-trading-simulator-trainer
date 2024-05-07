import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Chart, registerables, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

const CryptoChart = ({
  coin,
  days,
  live,
  onPriceUpdate,
  simulationSpeed,
  setLatestPrice,
  selectedSavedStrategy,
}) => {
  const chartRef = useRef(null);
  const [prices, setPrices] = useState([]);
  const [liveIndex, setLiveIndex] = useState(0);
  const [chartInstance, setChartInstance] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    if (selectedSavedStrategy) {
      fetchSignals();
    }
  }, [selectedSavedStrategy, coin, days]);

  const fetchSignals = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/strategies/live_backtest/mac/`, {
        coin,
        strategy_name: selectedSavedStrategy.strategy_name,
        date_range: days,
        initial_capital: selectedSavedStrategy.parameters.initial_capital,
        max_trade_size_percent: selectedSavedStrategy.parameters.max_trade_size_percent,
        short_term: selectedSavedStrategy.parameters.short_term,
        long_term: selectedSavedStrategy.parameters.long_term,
      }, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
        }
      });
      if (response.status === 200) {
        const formattedSignals = response.data.signals.map((signal) => ({
          timestamp: new Date(signal[0]),
          signal: signal[1]
        }));
        setSignals(formattedSignals);
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    }
  };

  useEffect(() => {
    console.log('Signals updated:', signals);
    console.log('Prices:', prices);
  }, [signals]);

  useEffect(() => {
    if (!live) {
      fetchData();
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }
    };
  }, [coin, days, live]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/crypto/fetch_historical_data/?coin_id=${coin}&days=${days}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
        }
      });
      if (response.status === 200 && response.data.length > 0) {
        const formattedPrices = response.data.map((item) => ({
          x: new Date(item.timestamp),
          y: item.price
        }));
        setPrices(formattedPrices);
        initChart(formattedPrices);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const initChart = (data) => {
    if (chartInstance) {
      chartInstance.destroy();
      setChartInstance(null);
    }
    const ctx = chartRef.current.getContext('2d');
    const newChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((p) => p.x),
        datasets: [
          {
            label: `${coin} Price`,
            data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            pointRadius: 10,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'MMM dd, yyyy HH:mm',
            },
          },
          y: {
            beginAtZero: false,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.formattedValue;
                  const signal = signals.find((signal) => {
                    if (signal.timestamp && new Date(context.parsed.x)) {
                      return signal.timestamp.getTime() === new Date(context.parsed.x).getTime();
                    }
                    return false;
                  });
                  if (signal) {
                    return `${label}: ${value} (${signal.signal})`;
                  }
                  return `${label}: ${value}`;
                },
              },
          },
        },
      },
    });
    setChartInstance(newChartInstance);
  };

  useEffect(() => {
    if (live && !isPaused) {
      initChart([]);
    }
  }, [live]);

  useEffect(() => {
    if (live && !isPaused && chartInstance) {
      const intervalId = setInterval(() => {
        if (liveIndex < prices.length) {
          const nextPrice = prices[liveIndex];
          chartInstance.data.labels.push(nextPrice.x);
          chartInstance.data.datasets.forEach((dataset) => {
            dataset.data.push(nextPrice.y);
          });
          chartInstance.update();
          onPriceUpdate(nextPrice.y);
          setLiveIndex(liveIndex + 1);
        } else {
          clearInterval(intervalId);
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