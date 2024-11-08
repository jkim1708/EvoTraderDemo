"use client"

import {useStores} from "@/store/Provider";
import {observer} from "mobx-react-lite";

const StrategyManager = observer(() => {
    const {
        tradingStrategyStore: { tradingStrategies},
    } = useStores();

    console.log(JSON.stringify(tradingStrategies));

    return (
        <div>
        <h1>Strategy Manager</h1>
            {/*<p> {JSON.stringify(tradingStrategies)} </p>*/}
        </div>
    );
});

export default StrategyManager;