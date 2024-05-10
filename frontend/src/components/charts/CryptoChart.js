import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot, ResponsiveContainer } from 'recharts';
import { fetchData, fetchSignals } from '../../utils/utils';

const CryptoChart = ({
  coin,
  days,
  live,
  onPriceUpdate,
  simulationSpeed,
  selectedSavedStrategy
}) => {
  const [data, setData] = useState([]);
  const [liveData, setLiveData] = useState([]);
  const [signals, setSignals] = useState([]);
  const liveIndex = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    updateData();
  }, [coin, days]);

  useEffect(() => {
    if(selectedSavedStrategy) {
      updateSignals();  
    } else {
      setSignals([]);
    }
  }, [selectedSavedStrategy]);

  useEffect(() => {
    if (live) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        updateLiveData();
      }, simulationSpeed);
      return () => clearInterval(intervalRef.current);
    } else {
      liveIndex.current = 0;
      setLiveData([]);
    }
  }, [live, simulationSpeed]);

  const updateLiveData = () => {
    if (liveIndex.current < data.length) {
      const nextLivePoint = data[liveIndex.current];
      setLiveData(prevLiveData => [...prevLiveData, nextLivePoint]);
      onPriceUpdate(nextLivePoint.price);
      liveIndex.current++;
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const updateData = async () => {
    const updatedData = await fetchData(coin, days);
    setData(updatedData);
  };

  const updateSignals = async () => {
    const updatedSignals = await fetchSignals(coin, days, selectedSavedStrategy);
    setSignals(updatedSignals);
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={live ? [...liveData] : data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} scale="time" tickFormatter={(timeStr) => new Date(timeStr).toLocaleDateString()} />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} animationEasing="ease-out" animationDuration={500} />
        {signals.map((signal, index) => (
          <ReferenceDot key={index} x={signal.time} y={data.concat(liveData).find(d => d.time === signal.time)?.price}
            label={signal.signal === 'buy' ? '↑' : '↓'} fill={signal.signal === 'buy' ? 'green' : 'red'} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CryptoChart;
