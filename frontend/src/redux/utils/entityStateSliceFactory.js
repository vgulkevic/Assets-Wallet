import {createSlice} from "@reduxjs/toolkit";

export function createEntityStateSliceFactory(name) {
    const slice = createSlice({
        name: name,
        initialState: {
            entityState: {},
        },
        reducers: {
            updateProperty: (state, action) => {
                const {propertyName, newValue} = action.payload;
                state.entityState = {...state.entityState, [propertyName]: newValue};
                return state;
            },
            set: (state, action) => {
                const payload = action.payload;
                if (!payload)
                    return state;

                state.entityState = payload;
                return state;
            },
            reset: () => {
                return slice.initialState;
            }
        }
    });

    return slice;
}