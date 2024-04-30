// src/components/EMAStrategyModal.js
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

const EMAStrategyModal = ({ show, handleClose, selectedStrategy, onRunBacktest }) => {
    const [spanShort, setSpanShort] = useState(12);
    const [spanLong, setSpanLong] = useState(26);
    const [coin, setCoin] = useState('bitcoin');
    const [dateRange, setDateRange] = useState(90);
    const [initialCapital, setInitialCapital] = useState(10000);
    const [riskPerTrade, setRiskPerTrade] = useState(1);

    useEffect(() => {
        if (selectedStrategy && selectedStrategy.conditions) {
            setSpanShort(selectedStrategy.conditions.spanShort || 12);
            setSpanLong(selectedStrategy.conditions.spanLong || 26);
            setCoin(selectedStrategy.conditions.coin || 'bitcoin');
            setDateRange(selectedStrategy.conditions.dateRange || 90);
            setInitialCapital(selectedStrategy.conditions.initialCapital || 10000);
            setRiskPerTrade(selectedStrategy.conditions.riskPerTrade || 1);
        }
    }, [selectedStrategy]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onRunBacktest(coin, 'EMA Strategy', spanShort, spanLong, dateRange, initialCapital, riskPerTrade);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit EMA Strategy</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="strategyCoin">
                        <Form.Label>Coin</Form.Label>
                        <Form.Control as="select" value={coin} onChange={e => setCoin(e.target.value)}>
                            <option value="bitcoin">Bitcoin</option>
                            <option value="ethereum">Ethereum</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="strategyShortTerm">
                        <Form.Label>Short Term EMA Days</Form.Label>
                        <Form.Control
                            type="number"
                            value={spanShort}
                            onChange={e => setSpanShort(Number(e.target.value))}
                        />
                    </Form.Group>

                    <Form.Group controlId="strategySpanLong">
                        <Form.Label>Long Term EMA Days</Form.Label>
                        <Form.Control
                            type="number"
                            value={spanLong}
                            onChange={e => setSpanLong(Number(e.target.value))}
                        />
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
                            value={riskPerTrade * 100}
                            onChange={e => setRiskPerTrade(parseFloat(e.target.value) / 100)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EMAStrategyModal;
