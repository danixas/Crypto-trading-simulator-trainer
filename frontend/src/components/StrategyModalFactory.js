import MACStrategyModal from './MACStrategyModal';
import EMAStrategyModal from './EMAStrategyModal';
import RSIStrategyModal from './RSIStrategyModal';
import MLStrategyModal from './MLStrategyModal';

const StrategyModalFactory = ({ strategyType, ...props }) => {
    
    switch (strategyType) {
        case 'MAC Strategy':
            return <MACStrategyModal {...props} endpoint="mac" />;
        case 'EMA Strategy':
            return <EMAStrategyModal {...props} endpoint="ema"/>;
        case 'RSI Strategy':
            return <RSIStrategyModal {...props} endpoint="rsi"/>;
        case 'ML Strategy':
            return <MLStrategyModal {...props} endpoint="ml"/>;
        default:
            return null;
    }
};

export default StrategyModalFactory;
