import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {Strategy} from "@/components/strategy-manager";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default function StrategyTable({ strategies, onAnalyze }) {
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
                {strategies.map((strategy: Strategy) => (
                    <TableRow key={strategy.name}>
                        <TableCell className="font-medium">{strategy.name}</TableCell>
                        <TableCell>{strategy.asset}</TableCell>
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
                            <Switch checked={strategy.status === 'active'} />
                        </TableCell>
                        <TableCell>
                            <Button variant="outline" onClick={() => onAnalyze(strategy)}>
                                Analyze
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}