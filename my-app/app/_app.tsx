import { createContext } from "react";
import { useStore } from "../store";
import TradingRuleStore, {TradingRule} from "@/store/TradingRuleStore";

    // kind: "short",
    // startTime: "",
    // endTime: "",
    // asset: 'EURUSD',
    // profitNLoss: 0,

export const defaultTradingRuleSupplier = (): TradingRuleStore => ({
    setTradingRule: () => {return [] as TradingRule[]},
    tradingRules: [],
    hydrate: () => {},
});

export const MobxContext = createContext(defaultTradingRuleSupplier());

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const MyApp = (props) => {
    const { Component, pageProps, err } = props;
    const store = useStore(pageProps.initialState);
    return (
        <MobxContext.Provider value={store}>
            <Component {...pageProps} err={err} />
        </MobxContext.Provider>
    );
};

export default MyApp;
