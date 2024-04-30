// src/components/StrategyModalFactory.js
import MACStrategyModal from './MACStrategyModal';
import EMAStrategyModal from './EMAStrategyModal';

const StrategyModalFactory = ({ strategyType, ...props }) => {
    switch (strategyType) {
        case 'MAC Strategy':
            return <MACStrategyModal {...props} />;
        case 'EMA Strategy':
            return <EMAStrategyModal {...props} />;
        default:
            return null;  // Return a default or null if no matching strategy is found
    }
};

export default StrategyModalFactory;
