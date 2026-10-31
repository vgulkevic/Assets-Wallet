import React, {createContext, useContext, useMemo, useState} from "react";
import {formatMoney} from "../utils/money";

const STORAGE_KEY = "assets-wallet:hide-balances";
const MASK = "••••";

const readHidden = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return false;
    }
};

const symbols = {};
const currencySymbol = (currency) => {
    symbols[currency] ??= new Intl.NumberFormat("en-GB", {style: "currency", currency, currencyDisplay: "narrowSymbol"})
        .formatToParts(0).find((part) => part.type === "currency")?.value ?? currency;
    return symbols[currency];
};

const BalancesVisibilityContext = createContext(null);

// Lets the user hide every amount on the dashboard, e.g. when someone is looking at the screen.
// The choice is remembered in this browser.
export function BalancesVisibilityProvider({children}) {
    const [hidden, setHidden] = useState(readHidden);

    const value = useMemo(() => ({
        hidden,
        toggle: () => setHidden((current) => {
            try {
                localStorage.setItem(STORAGE_KEY, String(!current));
            } catch {
                // not persisted (e.g. private mode), still toggles for this page
            }
            return !current;
        }),
        // same as formatMoney, but "£••••" while balances are hidden
        format: (amount, currency) => hidden ? currencySymbol(currency) + MASK : formatMoney(amount, currency)
    }), [hidden]);

    return <BalancesVisibilityContext.Provider value={value}>{children}</BalancesVisibilityContext.Provider>;
}

export function useBalancesVisibility() {
    return useContext(BalancesVisibilityContext);
}
