import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Switch} from "@/components/ui/switch"
import {Button} from "@/components/ui/button"
import {useStores} from "@/store/Provider";
import {TradingStrategy} from "@/store/RootStore";
import {observer} from "mobx-react-lite";
import React from "react";
import {useRouter} from "next/navigation";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
const StrategyTable = observer(({onAnalyze}: { onAnalyze: (strategy: TradingStrategy) => void }) => {

    const {
        tradingStrategyStore: {tradingStrategies},
    } = useStores();

    const router = useRouter();

    const editStrategyHandler = (strategy: TradingStrategy) => {
        router.push(`/?strategyName=${strategy.name}`);
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Strategy Name</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Used Indicators</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Profit Factor</TableHead>
                    <TableHead>Sharpe Ratio</TableHead>
                    <TableHead>Status</TableHead>
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
                        <TableCell className="text-orange-500">{strategy.winRate}</TableCell>
                        <TableCell>{strategy.profitFactor}</TableCell>
                        <TableCell>{strategy.sharpeRatio}</TableCell>
                        <TableCell>
                            <Switch checked={(strategy.status === "active")}
                                    onClick={() => {
                                        strategy.status = (strategy.status === "inactive") ? "active" : "inactive"
                                    }}
                            />
                        </TableCell>
                        <TableCell>
                            <div className="space-x-2">
                                <Button variant="outline" onClick={() => onAnalyze(strategy)}>
                                    Analyze
                                </Button>

                                <Button variant="outline" onClick={() => editStrategyHandler(strategy)}>
                                    Edit
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