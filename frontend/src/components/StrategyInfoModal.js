import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { marked } from 'marked';

const StrategyInfoModal = ({ show, onHide, strategy }) => {
    const strategyInfoContent = {
        'MAC Strategy': `The **Moving Average Crossover (MAC) Strategy** 
        involves using two moving averages of a security's price to 
        generate trading signals based on their crossover. 
        This strategy employs a **Short Term Moving Average 
        (STMA)** and a **Long Term Moving Average (LTMA)**. 
        A **buy signal** is generated when the STMA crosses **above** 
        the LTMA, indicating an upward trend, and a **sell signal** 
        is issued when the STMA crosses **below** the LTMA, 
        indicating a downward trend. This technique is widely used 
        to gauge the momentum behind an asset's price trend, providing 
        a clear visual representation of changing market conditions.`,
        
        'EMA Strategy': `The **Exponential Moving Average (EMA) Strategy** 
        enhances the simple moving average (SMA) approach by placing a 
        greater weight on more recent data points. Unlike SMAs, EMAs 
        respond more significantly to recent price changes, which can be 
        crucial in fast-moving markets. Traders often use two EMAs of 
        different lengths to capture potential buying or selling 
        opportunities when these averages cross one another. The 
        responsiveness of the EMA makes it a favorite among traders 
        who need to make quick decisions based on emerging trends.`,
        
        'RSI Strategy': `The **Relative Strength Index (RSI)** 
        is a momentum oscillator that measures the speed and 
        change of price movements within a range of zero to 100. 
        An asset is traditionally considered **overbought** 
        when the RSI is above 70 and **oversold** when it is below 30. 
        These traditional thresholds can help traders identify 
        potential reversal points. Additionally, traders look for **divergences** 
        between the RSI and price to spot potential buy or sell 
        signals, **failure swings** above 70 or below 30 as 
        confirmation of these conditions, and **centerline crossovers** 
        which can signal shifts in momentum. The RSI's ability to measure 
        momentum alongside price allows traders to discern potential 
        price movements from a unique perspective, often validating or 
        questioning other indicators' signals.`,

        'Machine Learning Strategy': `WRITE DESCRIPTION HERE`
    };

    const getFormattedInfo = (info) => {
        return { __html: marked.parse(info) };
    };

    const strategyDetails = strategy && strategy.name ? strategyInfoContent[strategy.name] : "No details available for this strategy.";
    console.log(strategy)
    
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{strategy ? strategy.name : "Strategy"} Details</Modal.Title>
            </Modal.Header>
            <Modal.Body dangerouslySetInnerHTML={getFormattedInfo(strategyInfoContent[strategy.name] || "No information available")} />
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default StrategyInfoModal;
