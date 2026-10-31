// Redux Toolkit 2 removed the object notation for `extraReducers`.
// This keeps the `{[thunk.pending]: reducer}` maps used across the slices working with the builder API.
export function addCaseReducers(caseReducers) {
    return (builder) => {
        Object.entries(caseReducers).forEach(([type, reducer]) => builder.addCase(type, reducer));
    };
}
