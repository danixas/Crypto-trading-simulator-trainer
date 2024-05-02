import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

const MACStrategyModal = ({ show, handleClose, selectedStrategy, onRunBacktest, endpoint }) => {
    const [shortTerm, setShortTerm] = useState(5);
    const [longTerm, setLongTerm] = useState(20);
    const [coin, setCoin] = useState('bitcoin');
    const [dateRange, setDateRange] = useState(90);
    const [initialCapital, setInitialCapital] = useState(10000);
    const [riskPerTrade, setRiskPerTrade] = useState(1);

    useEffect(() => {
        if (selectedStrategy && selectedStrategy.conditions) {
            setShortTerm(selectedStrategy.conditions.shortTerm || 5);
            setLongTerm(selectedStrategy.conditions.longTerm || 20);
            setCoin(selectedStrategy.conditions.coin || 'bitcoin');
            setDateRange(selectedStrategy.conditions.dateRange || 90);
            setInitialCapital(selectedStrategy.conditions.initialCapital || 10000);
            setRiskPerTrade(selectedStrategy.conditions.riskPerTrade || 1);
        }
    }, [selectedStrategy]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const strategyParameters = {
            coin,
            strategy_name: "MAC Strategy", // Ensure this matches exactly what the backend expects
            date_range: dateRange,
            initial_capital: initialCapital,
            max_trade_size_percent: riskPerTrade,
            short_term: shortTerm, // Ensure these are integers
            long_term: longTerm
        };
        onRunBacktest(strategyParameters, 'mac'); // Make sure endpoint is passed correctly
        handleClose();
    };
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit MAC Strategy</Modal.Title>
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

                    <Form.Group controlId="strategyInitialCapital">
                        <Form.Label>Initial Capital</Form.Label>
                        <Form.Control
                            type="number"
                            value={initialCapital}
                            onChange={e => setInitialCapital(parseFloat(e.target.value))}
                        />
                    </Form.Group>

                    <Form.Group controlId="strategyRiskPerTrade">
                        <Form.Label>Risk Per Trade (%)</Form.Label>
                        <Form.Control
                            type="number"
                            value={riskPerTrade}
                            onChange={e => setRiskPerTrade(parseFloat(e.target.value))}
                        />
                    </Form.Group>

                    <Form.Group controlId="strategyShortTerm">
                        <Form.Label>Short Term MA Days</Form.Label>
                        <Form.Control
                            type="number"
                            value={shortTerm}
                            onChange={e => setShortTerm(Number(e.target.value))}
                        />
                    </Form.Group>

                    <Form.Group controlId="strategyLongTerm">
                        <Form.Label>Long Term MA Days</Form.Label>
                        <Form.Control
                            type="number"
                            value={longTerm}
                            onChange={e => setLongTerm(Number(e.target.value))}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handleSubmit}>Run Backtest</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MACStrategyModal;
