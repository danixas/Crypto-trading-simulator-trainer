import MACStrategyModal from './MACStrategyModal';
import EMAStrategyModal from './EMAStrategyModal';
import RSIStrategyModal from './RSIStrategyModal';

const StrategyModalFactory = ({ strategyType, ...props }) => {
    
    switch (strategyType) {
        case 'MAC Strategy':
            return <MACStrategyModal {...props} endpoint="mac" />;
        case 'EMA Strategy':
            return <EMAStrategyModal {...props} endpoint="ema"/>;
        case 'RSI Strategy':
            return <RSIStrategyModal {...props} endpoint="rsi"/>;
        default:
            return null;
    }
};

export default StrategyModalFactory;
