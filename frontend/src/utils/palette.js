// Colours for categories and currencies, in order of size, so the allocation donut and the history chart match.
export const PALETTE = ["#1e88e5", "#43a047", "#fb8c00", "#8e24aa", "#00acc1", "#e53935", "#fdd835", "#6d4c41", "#3949ab", "#7cb342"];

export const paletteColor = (index) => PALETTE[index % PALETTE.length];
