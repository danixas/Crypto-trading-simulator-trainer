import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const MLStrategyModal = ({ show, handleClose, onRunBacktest, endpoint }) => {
    const [strategyName, setStrategyName] = useState('');
    const [coin, setCoin] = useState('bitcoin');
    const [initialCapital, setInitialCapital] = useState(10000);
    const [maxTradeSizePercent, setMaxTradeSizePercent] = useState(10);
    const [lstmUnits, setLstmUnits] = useState(50);

    const handleSubmit = async (e) => {
        const isFormValid = strategyName && lstmUnits >= 1 && lstmUnits <= 100;
        e.preventDefault();
        if (!isFormValid) {
            alert('Please correct the errors before submitting.');
            return;
        }
        const strategyParameters = {
            coin,
            strategy_name: strategyName,
            initial_capital: initialCapital,
            max_trade_size_percent: maxTradeSizePercent,
            lstm_units: lstmUnits
        };
        console.log('strat parameters tha should be sent to dashboard:', strategyParameters);
        onRunBacktest(strategyParameters, "ml");
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Configure ML Strategy</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="strategyName">
                        <Form.Label>Strategy Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={strategyName}
                            onChange={e => setStrategyName(e.target.value)}
                            placeholder="Enter strategy name"
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="strategyCoin">
                        <Form.Label>Coin</Form.Label>
                        <Form.Control as="select" value={coin} onChange={e => setCoin(e.target.value)}>
                            <option value="bitcoin">Bitcoin</option>
                            <option value="ethereum">Ethereum</option>
                            <option value="ripple">XRP</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="strategyInitialCapital">
                        <Form.Label>Initial Capital</Form.Label>
                        <Form.Control
                            type="number"
                            value={initialCapital}
                            onChange={e => setInitialCapital(parseFloat(e.target.value))}
                        />
                    </Form.Group>
                    <Form.Group controlId="strategyMaxTradeSizePercent">
                        <Form.Label>Max Trade Size Percent</Form.Label>
                        <Form.Control
                            type="number"
                            value={maxTradeSizePercent}
                            onChange={e => setMaxTradeSizePercent(parseFloat(e.target.value))}
                        />
                    </Form.Group>
                    <Form.Group controlId="strategyLstmUnits">
                        <Form.Label>LSTM units</Form.Label>
                        <Form.Control
                            type="number"
                            value={lstmUnits}
                            onChange={e => setLstmUnits(parseFloat(e.target.value))}
                            isInvalid={lstmUnits < 1 || lstmUnits > 100}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please enter a value between 1 and 100.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Train Model
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MLStrategyModal;
