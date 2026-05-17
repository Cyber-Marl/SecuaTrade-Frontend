import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';

const TradingChart = ({ data, ticker }) => {
    const chartContainerRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0 || !chartContainerRef.current) return;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
            },
            width: chartContainerRef.current.clientWidth || 500,
            height: 300,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const newSeries = chart.addSeries(AreaSeries, {
            lineColor: '#2962FF',
            topColor: '#2962FF',
            bottomColor: 'rgba(41, 98, 255, 0.28)',
        });

        try {
            newSeries.setData(data);
        } catch (err) {
            console.error("Chart data error:", err);
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, fontSize: '14px', fontWeight: 'bold', color: '#facc15' }}>
                {ticker}
            </div>
            <div ref={chartContainerRef} />
        </div>
    );
};

export default TradingChart;
