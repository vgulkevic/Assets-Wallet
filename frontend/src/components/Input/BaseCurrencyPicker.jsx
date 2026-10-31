import React from "react";
import SelectWithOneChoosableOption from "./SelectWithOneChoosableOption";

export default function BaseCurrencyPicker({label, value, setter, loading, ...props}) {

    const options = [
        {
            id: "GBP",
            name: "£ (Pound)"
        },
        {
            id: "USD",
            name: "$ (Dollar)"
        },
        {
            id: "EUR",
            name: "€ (Euro)"
        },
        {
            id: "JPY",
            name: "¥ (Japanese yen)"
        },
        {
            id: "AUD",
            name: "$ (Australian dollar)"
        }
    ];

    return (
        <SelectWithOneChoosableOption label={label}
                                      options={options}
                                      value={value}
                                      setter={(val) => {
                                          setter(val);
                                      }}
                                      isLoading={loading}
                                      {...props}
        />
    );
}
