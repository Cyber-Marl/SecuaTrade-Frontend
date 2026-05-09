import { useState, useEffect, useCallback } from 'react';

const useMarketData = () => {
  const [prices, setPrices] = useState({});
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/market/');

    ws.onopen = () => {
      console.log('Connected to Market Data Feed');
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'price_update') {
        const { ticker, price } = message.data;
        setPrices(prev => ({
          ...prev,
          [ticker]: price
        }));
      }
    };

    ws.onclose = () => {
      console.log('Market Feed Disconnected');
      setStatus('disconnected');
    };

    return () => ws.close();
  }, []);

  return { prices, status };
};

export default useMarketData;
