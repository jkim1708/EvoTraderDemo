"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Button} from "@/components/ui/button";
import {CANDLESTICK_FREQUENCY} from "@/utils";
import {useRouter} from "next/navigation";

const StrategyCreatorSetup = observer(() => {

    const [asset, setAsset] = useState('EURUSD');

    const appRouterInstance = useRouter();

    // const assets = ['EURUSD', 'GBPUSD', 'EURCHF', 'EURNOK']

    const [startDate, setStartDate] = useState<string>(new Date('2020-02-01').toJSON().split('T')[0]);

    const [frequency, setFrequency] = useState<CANDLESTICK_FREQUENCY>(CANDLESTICK_FREQUENCY.HOURLY);

    const [tradingName, setTradingName] = useState<string>('My Trading Rule');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    function handleClickEURUSD(event) {
        setAsset('EURUSD');
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    function handleClickGBPUSD(event) {
        setAsset('GBPUSD');
    }

    function handleStartCreateStrategy() {
        appRouterInstance.push('/?asset=' + asset + '&startDate=' + startDate + '&frequency=' + frequency + '&tradingName=' + tradingName);
    }

    function handleCancelCreateStrategy() {
        appRouterInstance.push('/strategy-management');
    }

    return (
        <div className="space-y-2">
            <Card className="w-11/12 mx-auto ">
                <CardHeader>
                    <CardTitle className="text-2xl">Trading Strategy Creator (TSC)</CardTitle>
                    <p className="text-muted-foreground">Select asset, date range, and manage trades</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex space-x-4 mb-4">
                            <div className="flex-4">
                                <Label htmlFor="asset">Trading Rule Name</Label>
                                <Input
                                    // className={isStrategyNameValid ? "" : "border-red-500"}
                                    id={"tading-rule-name"}
                                    defaultValue={"My Trading Rule"} onChange={e => {
                                    setTradingName(e.target.value)
                                }}/>
                            </div>
                        </div>
                        <div className="space-y-4 mb-6">
                            {/*<div className="flex space-x-4">*/}
                            <div className="space-y-2">
                                <Label htmlFor="asset">Asset</Label>
                                {/*<Select value={asset} onValueChange={setAsset}>*/}
                                {/*    <SelectTrigger id="asset">*/}
                                {/*        <SelectValue/>*/}
                                {/*    </SelectTrigger>*/}
                                {/*    <SelectContent>*/}
                                {/*        */}
                                {/*    </SelectContent>*/}
                                {/*    */}
                                {/*</Select>*/}
                                <div className={"space-x-2"}>
                                    {/*{assets.map((a) => (*/}
                                    {/*    // <SelectItem key={a} value={a}>{a}</SelectItem>*/}
                                    {/*    <Button*/}
                                    {/*        className="rounded-full py-0.5 px-2.5 bordertext-sm transition-all shadow-sm"*/}
                                    {/*        key={a}*/}
                                    {/*        variant={asset == a ? 'default' : 'outline'}*/}
                                    {/*        value={a}*/}
                                    {/*        onClick={ () => {*/}
                                    {/*            console.log('value',a);*/}
                                    {/*            setAsset(a as unknown as string)*/}
                                    {/*        }}*/}
                                    {/*        // variant={'outline'}*/}
                                    {/*    >{a}</Button>*/}
                                    {/*))}*/}

                                    <Button
                                        className="rounded-full py-0.5 px-2.5 bordertext-sm transition-all shadow-sm"
                                        variant={asset == 'EURUSD' ? 'default' : 'outline'}
                                        value={'EURUSD'}
                                        onClick={handleClickEURUSD}
                                        // variant={'outline'}
                                    >EURUSD</Button>

                                    <Button
                                        className="rounded-full py-0.5 px-2.5 bordertext-sm transition-all shadow-sm"
                                        variant={asset == 'GBPUSD' ? 'default' : 'outline'}
                                        value={'GBPUSD'}
                                        onClick={handleClickGBPUSD}
                                        // variant={'outline'}
                                    >GBPUSD</Button>
                                </div>

                            </div>
                            <div className="flex-1">
                                <Label htmlFor="startDate">Date Select</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value)
                                    }}
                                    max={new Date().toJSON().split('T')[0]}
                                />
                            </div>
                            {/*<div className="flex-1">*/}
                            {/*    <Label htmlFor="endDate">End Date</Label>*/}
                            {/*    <Input*/}
                            {/*        id="endDate"*/}
                            {/*        type="date"*/}
                            {/*        value={endDate}*/}
                            {/*        onChange={(e) => {*/}
                            {/*            setEndDate(e.target.value)*/}
                            {/*        }}*/}
                            {/*        max={new Date().toJSON().split('T')[0]}*/}
                            {/*    />*/}
                            {/*</div>*/}
                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frequency</Label>
                                <div className={"space-x-2"}>
                                    <Button
                                        className="rounded-full py-0.5 px-2.5 bordertext-sm transition-all shadow-sm"
                                        variant={frequency == CANDLESTICK_FREQUENCY.HOURLY ? 'default' : 'outline'}
                                        value={CANDLESTICK_FREQUENCY.HOURLY}
                                        onClick={() => setFrequency(CANDLESTICK_FREQUENCY.HOURLY)}
                                        // variant={'outline'}
                                    >Hourly</Button>

                                    <Button
                                        className="rounded-full py-0.5 px-2.5 bordertext-sm transition-all shadow-sm"
                                        variant={frequency == CANDLESTICK_FREQUENCY.FOUR_HOURLY ? 'default' : 'outline'}
                                        value={CANDLESTICK_FREQUENCY.FOUR_HOURLY}
                                        onClick={() => setFrequency(CANDLESTICK_FREQUENCY.FOUR_HOURLY)}
                                        // variant={'outline'}
                                    >4 Hourly</Button>
                                </div>
                            </div>
                            {/*</div>*/}
                        </div>
                        <div className="flex space-x-4 mb-4 flex justify-end mt-6">
                            <Button variant="default" size="sm"
                                onClick={handleStartCreateStrategy}>
                                Start
                            </Button>

                            <Button variant="default" size="sm"
                                    onClick={handleCancelCreateStrategy}>
                                Cancel
                            </Button>
                        </div>

                        </div>


                </CardContent>
            </Card>

        </div>
    )
});

export default StrategyCreatorSetup;