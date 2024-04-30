export async function fetchHistoricalData(coinId, vsCurrency, fromTimestamp, toTimestamp) {
    const response = await fetch(`/api/crypto/historical_data?coin_id=${coinId}&vs_currency=${vsCurrency}&from_timestamp=${fromTimestamp}&to_timestamp=${toTimestamp}`);
    return response.json();
}
