'use client'

import {useState} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import StrategyTable from './strategy-table'
import StrategyDialog from './strategy-dialog'
import Link from "next/link";
import {observer} from "mobx-react-lite";
import {TradingStrategy} from "@/store/RootStore";

export type Strategy = {
    name: string
    asset: string
    indicators: string[]
    winRate: string
    profitFactor: string
    sharpeRatio: string
    status: 'active' | 'inactive'
}

const StrategyManagement = observer(() => {
    const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null);

    // const strategies = [
    //     {
    //         name: "John Doe Momentum",
    //         asset: "USDEUR",
    //         indicators: ["RSI", "MACD"],
    //         winRate: "62.5%",
    //         profitFactor: "1.80",
    //         sharpeRatio: "1.50",
    //         status: "active"
    //     },
    //     {
    //         name: "John Doe Mean Reversion V2",
    //         asset: "GBPUSD",
    //         indicators: ["Bollinger Bands", "Stochastic"],
    //         winRate: "58.3%",
    //         profitFactor: "1.60",
    //         sharpeRatio: "1.30",
    //         status: "inactive"
    //     },
    //     {
    //         name: "USDJPY Trend Following",
    //         asset: "USDJPY",
    //         indicators: ["Moving Averages", "ADX"],
    //         winRate: "55.0%",
    //         profitFactor: "1.40",
    //         sharpeRatio: "1.10",
    //         status: "inactive"
    //     },
    //     {
    //         name: "EURCAD Breakout",
    //         asset: "EURCAD",
    //         indicators: ["ATR", "Fibonacci"],
    //         winRate: "60.0%",
    //         profitFactor: "1.70",
    //         sharpeRatio: "1.40",
    //         status: "active"
    //     }
    // ]

    const setStrategy = (strategy: TradingStrategy) => {
        setSelectedStrategy(strategy);
    }

    return (
        <div className="space-y-2">
        <Card className="w-11/12 mx-auto ">
            <CardHeader>
                <CardTitle className="text-2xl">Trading Strategy Management</CardTitle>
                <p className="text-muted-foreground">Manage and monitor your trading algorithms</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <StrategyTable
                        onAnalyze={setStrategy}
                    />
                    <div className="flex justify-end">
                        <Link href="/">
                            <Button>
                                Create new Algorithm
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
            {selectedStrategy && (
                <StrategyDialog
                    strategy={selectedStrategy}
                    onClose={() => setSelectedStrategy(null)}
                />
            )}
        </div>
    )
});
export default  StrategyManagement;