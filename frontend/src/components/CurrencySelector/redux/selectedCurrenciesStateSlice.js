import {createEntityStateSliceFactory} from "../../../redux/utils/entityStateSliceFactory";

const SELECTED_CURRENCIES_STATE_STORE_NAME = "selectedCurrenciesState";

const selectedCurrenciesStateSlice = createEntityStateSliceFactory("selectedCurrenciesState");
const selectedCurrenciesStateReducer = selectedCurrenciesStateSlice.reducer;
const
    {
        updateProperty: updateSelectedCurrenciesStateProperty,
        set: setSelectedCurrenciesState,
        reset: resetSelectedCurrenciesState
    } = selectedCurrenciesStateSlice.actions;

export {SELECTED_CURRENCIES_STATE_STORE_NAME, selectedCurrenciesStateReducer, updateSelectedCurrenciesStateProperty, setSelectedCurrenciesState, resetSelectedCurrenciesState};
