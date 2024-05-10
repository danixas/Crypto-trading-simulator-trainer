
const fetchData = async (coin, days) => {
    const response = await fetch(`http://localhost:8000/api/crypto/fetch_historical_data/?coin_id=${coin}&days=${days}`);
    if (response.ok) {
      const jsonData = await response.json();
      const formattedData = jsonData.map(item => ({
        time: new Date(item.timestamp).getTime(),
        price: item.price
      }));
      return formattedData;
    }
    return [];
};

const fetchSignals = async (coin, days, selectedSavedStrategy) => {

    if (!selectedSavedStrategy || !selectedSavedStrategy.strategy_name || !selectedSavedStrategy.strategy_type) {
        return []; 
    }
    const endpoint = selectedSavedStrategy.strategy_type === 'MAC' ? 'mac' : 'rsi';
    const url = `http://localhost:8000/api/strategies/live_backtest/${endpoint}/`;

    if (selectedSavedStrategy.strategy_type === 'MAC') {
        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
            coin,
            strategy_name: selectedSavedStrategy.strategy_name,
            date_range: days,
            initial_capital: selectedSavedStrategy.parameters.initial_capital,
            max_trade_size_percent: selectedSavedStrategy.parameters.max_trade_size_percent,
            short_term: selectedSavedStrategy.parameters.short_term,
            long_term: selectedSavedStrategy.parameters.long_term,
            })
        });
        if (response.ok) {
            const jsonData = await response.json();
            const formattedSignals = jsonData.signals.map(signal => ({
                time: new Date(signal[0]).getTime(),
                signal: signal[1]
            }));
            return formattedSignals;
        }
        else {
            console.error('Failed to fetch signals');
            return [];
        }
    } 
    else if (selectedSavedStrategy.strategy_type === 'RSI') {
        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
            coin,
            strategy_name: selectedSavedStrategy.strategy_name,
            date_range: days,
            initial_capital: selectedSavedStrategy.parameters.initial_capital,
            max_trade_size_percent: selectedSavedStrategy.parameters.max_trade_size_percent,
            period: selectedSavedStrategy.parameters.period,
            overbought: selectedSavedStrategy.parameters.overbought,
            oversold: selectedSavedStrategy.parameters.oversold,
            })
        });
        if (response.ok) {
            const jsonData = await response.json();
            const formattedSignals = jsonData.signals.map(signal => ({
                time: new Date(signal[0]).getTime(),
                signal: signal[1]
            }));
            return formattedSignals;
        }
        else {
            console.error('Failed to fetch signals');
            return [];
        }
    }
};

export { fetchData, fetchSignals };