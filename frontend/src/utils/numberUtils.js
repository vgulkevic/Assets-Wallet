function roundNumberTo2Dp(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100
}

function roundNumberToDp(number, dp) {
    return Math.round((number + Number.EPSILON) * Math.pow(10, dp)) / Math.pow(10, dp)
}

export {roundNumberToDp, roundNumberTo2Dp}