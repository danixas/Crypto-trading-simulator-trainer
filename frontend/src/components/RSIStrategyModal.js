import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const RSIStrategyModal = ({ show, handleClose, onRunBacktest, ednpoint }) => {
    const [coin, setCoin] = useState('bitcoin');
    const [dateRange, setDateRange] = useState(90);
    const [initialCapital, setInitialCapital] = useState(10000);
    const [maxTradeSizePercent, setMaxTradeSizePercent] = useState(1);
    const [period, setPeriod] = useState(14);
    const [overbought, setOverbought] = useState(70);
    const [oversold, setOversold] = useState(30);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const strategyParameters = {
            coin,
            strategy_name: "RSI Strategy",
            date_range: dateRange,
            initial_capital: initialCapital,
            max_trade_size_percent: maxTradeSizePercent,
            period: period,
            overbought: overbought,
            oversold: oversold
        };
        onRunBacktest(strategyParameters, 'rsi');
        handleClose();
    };
    
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Configure RSI Strategy</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="strategyCoin">
                        <Form.Label>Coin</Form.Label>
                        <Form.Control as="select" value={coin} onChange={e => setCoin(e.target.value)}>
                            <option value="bitcoin">Bitcoin</option>
                            <option value="ethereum">Ethereum</option>
                            <option value="ripple">XRP</option>
                        </Form.Control>
                    </Form.Group>
                    
                    <Form.Group controlId="strategyDateRange">
                        <Form.Label>Date Range (Days)</Form.Label>
                        <Form.Control
                            type="number"
                            value={dateRange}
                            onChange={e => setDateRange(Number(e.target.value))}
                        />
                    </Form.Group>

                    <Form.Group controlId="rsiInitialCapital">
                        <Form.Label>Initial Capital</Form.Label>
                        <Form.Control
                            type="number"
                            value={initialCapital}
                            onChange={e => setInitialCapital(parseFloat(e.target.value))}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="rsiMaxTradeSizePercent">
                        <Form.Label>Risk Per Trade (%)</Form.Label>
                        <Form.Control
                            type="number"
                            value={maxTradeSizePercent}
                            onChange={e => setMaxTradeSizePercent(parseFloat(e.target.value))}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="rsiPeriod">
                        <Form.Label>RSI Period</Form.Label>
                        <Form.Control
                            type="number"
                            value={period}
                            onChange={e => setPeriod(parseInt(e.target.value))}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="rsiOverbought">
                        <Form.Label>Overbought Threshold</Form.Label>
                        <Form.Control
                            type="number"
                            value={overbought}
                            onChange={e => setOverbought(parseInt(e.target.value))}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="rsiOversold">
                        <Form.Label>Oversold Threshold</Form.Label>
                        <Form.Control
                            type="number"
                            value={oversold}
                            onChange={e => setOversold(parseInt(e.target.value))}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Run Backtest
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RSIStrategyModal;
