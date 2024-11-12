import StrategyManagement from "@/components/strategy-management";
import React from "react";
import {StoreWrapper} from "@/store/Provider";

const Page = () => {

    return (
        <StoreWrapper>
            <StrategyManagement />
        </StoreWrapper>
    );
}

export default Page;