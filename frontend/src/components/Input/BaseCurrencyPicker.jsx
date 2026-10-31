import React from "react";
import SelectWithOneChoosableOption from "./SelectWithOneChoosableOption";
import {SUPPORTED_CURRENCIES} from "../../utils/currencies";

export default function BaseCurrencyPicker({label, value, setter, loading, ...props}) {

    const options = SUPPORTED_CURRENCIES;

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
