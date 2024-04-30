// src/components/StrategyModal.js
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

const MACStrategyModal = ({ show, handleClose, selectedStrategy, onRunBacktest }) => {
    // State for form fields with default values or empty strings
    const [shortTerm, setShortTerm] = useState(5);
    const [longTerm, setLongTerm] = useState(20);
    const [coin, setCoin] = useState('bitcoin');
    const [dateRange, setDateRange] = useState(90);
    const [initialCapital, setInitialCapital] = useState(10000);
    const [riskPerTrade, setRiskPerTrade] = useState(1);
    const [strategyName, setStrategyName] = useState('MAC Strategy');
    useEffect(() => {
        // Populate form fields when the selected strategy changes
        if (selectedStrategy && selectedStrategy.conditions) {
            setShortTerm(selectedStrategy.conditions.shortTerm || 5);
            setLongTerm(selectedStrategy.conditions.longTerm || 20);
            setCoin(selectedStrategy.conditions.coin || 'bitcoin');
            setDateRange(selectedStrategy.conditions.dateRange || 90);
            setInitialCapital(selectedStrategy.conditions.initialCapital || 10000);
            setRiskPerTrade(selectedStrategy.conditions.riskPerTrade || 1);
            setStrategyName(selectedStrategy.name || 'MAC Strategy');
        }
    }, [selectedStrategy]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onRunBacktest(coin, strategyName, shortTerm, longTerm, dateRange, initialCapital, riskPerTrade);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Strategy</Modal.Title>
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
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MACStrategyModal;
