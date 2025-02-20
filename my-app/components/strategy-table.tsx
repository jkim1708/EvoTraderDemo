import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Button} from "@/components/ui/button"
import {useStores} from "@/store/Provider";
import {TradingStrategy} from "@/store/RootStore";
import {observer} from "mobx-react-lite";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {InfoCircledIcon} from "@radix-ui/react-icons";
import TooltipWrapper from "@/lib/tooltip";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
const StrategyTable = observer(({onAnalyze}: { onAnalyze: (strategy: TradingStrategy) => void }) => {

    const {
        tradingStrategyStore: {tradingStrategies},
    } = useStores();

    const [count, setCount] = useState(0);
    const [countSharpe] = useState(0);

    const getRandomBetween20And80 = () => {
        return (Math.random() * (80 - 40) + 40).toFixed(1) + "%";
    };

    const getRandomSharpeRatio = () => {
        return (Math.random() * (1.9 - 0.4) + 0.4).toFixed(2);
    };

    function getRandomProfitFactor() {

        //1,1 1,9
        return (Math.random() * (1.90 - 1.10) + 1.10).toFixed(2);
    }

    useEffect(() => {
        const updateWinRate = () => {
            tradingStrategies.forEach(strategy => {
                if (strategy.status === "inactive") return;
                strategy.winRate = getRandomBetween20And80();
                strategy.profitFactor = getRandomProfitFactor();
            });
        };
        //change every 10-20 seconds
        // Math.random() * (2000 - 1000) + 1000)
        const interval = setInterval(() => {
            updateWinRate();
            setCount(count + 1);
        }, Math.random() * (2000 - 1000) + 1000);

        //Clearing the interval
        return () => {
            clearInterval(interval)
        };
    }, [count, tradingStrategies]);

    useEffect(() => {

        const updateSharpeRatio = () => {
            tradingStrategies.forEach(strategy => {
                if (strategy.status === "inactive") return;
                strategy.sharpeRatio = getRandomSharpeRatio();

            });
        };

        const intervalSharpeRatio = setInterval(() => {
            updateSharpeRatio();
            setCount(countSharpe + 1);
        }, Math.random() * (4000 - 2000) + 2000);

        //Clearing the interval
        return () => {
            clearInterval(intervalSharpeRatio);
        };
    }, [countSharpe, tradingStrategies]);

    const router = useRouter();

    const editStrategyHandler = (strategy: TradingStrategy) => {
        router.push(`/?strategyName=${strategy.name}`);
    }

    function handleDeleteStrategy(strategy: TradingStrategy) {
        const indexToDelete = tradingStrategies.findIndex((s) => s.name == strategy.name);
        tradingStrategies.splice(indexToDelete, 1);
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Strategy Name</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>
                        <div className="flex items-center">
                            Used Indicators <TooltipWrapper
                            content={"used indicators to generate the trading algorithm"}><InfoCircledIcon/></TooltipWrapper>
                        </div>
                    </TableHead>
                    <TableHead>
                        <div className="flex items-center">
                            Win Rate <TooltipWrapper
                            content={"win rate of executed trades"}><InfoCircledIcon/></TooltipWrapper>
                        </div>
                    </TableHead>
                <TableHead>Profit Factor</TableHead>
                <TableHead>Sharpe Ratio</TableHead>
                <TableHead>Broker</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
        </TableHeader>
    <TableBody>
        {tradingStrategies.map((strategy: TradingStrategy) => (
            <TableRow key={strategy.name}>
                <TableCell className="font-medium">{strategy.name}</TableCell>
                <TableCell>{strategy.tradingRules[0].asset}</TableCell>
                <TableCell>
                    <div className="flex flex-wrap gap-1">
                        {strategy.indicators.map((indicator) => (
                            <span key={indicator} className="bg-muted px-2 py-1 rounded-md text-sm">
                    {indicator}
                  </span>
                        ))}
                    </div>
                </TableCell>
                <TableCell className={strategy.status === "active" ? "text-metrics-winRate" : "text-black" }>{strategy.winRate}</TableCell>
                <TableCell className={strategy.status === "active" ? "text-metrics-profitFactor" : "text-black" }>{strategy.profitFactor}</TableCell>
                <TableCell className={strategy.status === "active" ? "text-metrics-sharpeRatio": "text-black" }>{strategy.sharpeRatio}</TableCell>
                <TableCell>Lemon Markets</TableCell>
                <TableCell>
                    <div className="space-x-2">
                        <Button variant="outline" onClick={() => onAnalyze(strategy)}>
                            Analyze
                        </Button>

                        <Button variant="outline" onClick={() => editStrategyHandler(strategy)}>
                            Edit
                        </Button>

                        <Button variant="outline" onClick={()=> handleDeleteStrategy(strategy)}>
                            Delete
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>
)
});

export default StrategyTable;