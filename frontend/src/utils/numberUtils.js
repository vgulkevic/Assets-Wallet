function roundNumberTo2Dp(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100
}

function roundNumberToDp(number, dp) {
    const result = Math.round((number + Number.EPSILON) * Math.pow(10, dp)) / Math.pow(10, dp);
    return isNaN(result) ? number : result;
}

export {roundNumberToDp, roundNumberTo2Dp}
