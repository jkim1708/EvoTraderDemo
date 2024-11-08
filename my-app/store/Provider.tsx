"use client";
import React, {createContext, ReactNode, useContext} from "react";
import {RootStore} from "@/store/RootStore";

export const StoreContext = createContext(RootStore);

export const useStores = () => {
    return useContext(StoreContext);
};

export const StoreWrapper = ({ children }: { children: ReactNode }) => {
    return (
        <StoreContext.Provider value={RootStore}>{children}</StoreContext.Provider>
    );
};