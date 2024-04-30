// src/components/StrategyInfoModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const StrategyInfoModal = ({ show, onHide, strategy }) => {
    // Replace the content below with the actual information about the strategy
    const strategyInfoContent = {
        'MAC Strategy': `The Moving Average Crossover (MAC) Strategy involves using two moving averages of a security's price, and generating trading signals based on the crossover of these moving averages. A typical setup might use a Short Term Moving Average (STMA) and a Long Term Moving Average (LTMA). A buy signal is generated when the STMA crosses above the LTMA, and a sell signal is issued when the STMA crosses below the LTMA. It's a simple yet powerful strategy used to determine the momentum behind an asset's price trend.`,
        // Add more strategies info here as key-value pairs
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{strategy.name} Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{strategyInfoContent[strategy.name]}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default StrategyInfoModal;
