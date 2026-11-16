import React, {useMemo, useState} from "react";
import {LineChart} from "@mui/x-charts/LineChart";
import {useTheme} from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import {useGetNetWorthHistoryQuery} from "../api/assetManagerApi";
import {paletteColor} from "../utils/palette";
import {useBalancesVisibility} from "./balancesVisibility";

const RANGES = {"1Y": 1, "3Y": 3, All: null};
const VIEWS = {total: "Total", category: "Category", currency: "Currency"};
const DAY = 24 * 60 * 60 * 1000;
const dayMonth = new Intl.DateTimeFormat("en-GB", {day: "numeric", month: "short"});
const monthYear = new Intl.DateTimeFormat("en-GB", {month: "short", year: "numeric"});
const fullDate = new Intl.DateTimeFormat("en-GB", {day: "numeric", month: "short", year: "numeric"});
const compact = (currency) => new Intl.NumberFormat("en-GB", {style: "currency", currency, currencyDisplay: "narrowSymbol", notation: "compact", maximumFractionDigits: 1});

const entryDate = (entry) => new Date(`${entry.date}T12:00:00Z`);
const isToday = (date) => date.toDateString() === new Date().toDateString();

// Saved daily/monthly totals plus today's live total, in the main currency.
function useTotalPoints(history, currency, currentTotal) {
    return useMemo(() => {
        if (!history || !currency) {
            return [];
        }
        const points = history
            .filter((entry) => entry.totals?.[currency] !== undefined)
            .map((entry) => ({date: entryDate(entry), value: entry.totals[currency]}))
            .sort((a, b) => a.date - b.date);

        const last = points.at(-1);
        if (currentTotal !== undefined && !Number.isNaN(currentTotal)) {
            if (last && isToday(last.date)) {
                last.value = currentTotal;
            } else {
                points.push({date: new Date(), value: currentTotal});
            }
        }
        return points;
    }, [history, currency, currentTotal]);
}

// group key -> {label, value in the main currency}, for one snapshot or for today's live data
function snapshotGroups(entry, view, currency) {
    const groups = new Map();
    if (view === "category") {
        entry.byCategory?.forEach((category) => groups.set(category.id, {label: category.name, value: category.totals?.[currency] ?? 0}));
    } else {
        entry.byCurrency?.forEach((holding) => groups.set(holding.currency, {label: holding.currency, value: holding.totals?.[currency] ?? 0}));
    }
    return groups;
}

function liveGroups(categories, view) {
    const groups = new Map();
    if (view === "category") {
        categories.forEach((category) => groups.set(category.id, {label: category.name, value: category.totalInMain}));
    } else {
        categories.flatMap((category) => category.assets).forEach((asset) => groups.set(asset.currency, {
            label: asset.currency,
            value: (groups.get(asset.currency)?.value ?? 0) + asset.amountInMain
        }));
    }
    return groups;
}

// Points from the nightly snapshots that carry a breakdown (imported history has none), plus today's live breakdown.
function useBreakdownPoints(history, view, currency, categories) {
    return useMemo(() => {
        if (!history || !currency || view === "total") {
            return [];
        }
        const field = view === "category" ? "byCategory" : "byCurrency";
        const points = history
            .filter((entry) => entry[field]?.length)
            .map((entry) => ({date: entryDate(entry), groups: snapshotGroups(entry, view, currency)}))
            .sort((a, b) => a.date - b.date);

        if (categories) {
            const live = {date: new Date(), groups: liveGroups(categories, view)};
            if (points.at(-1) && isToday(points.at(-1).date)) {
                points[points.length - 1] = live;
            } else {
                points.push(live);
            }
        }
        return points;
    }, [history, view, currency, categories]);
}

const withinRange = (points, range) => {
    const years = RANGES[range];
    if (!years) {
        return points;
    }
    const from = new Date();
    from.setFullYear(from.getFullYear() - years);
    return points.filter((point) => point.date >= from);
};

// One stacked series per category/currency, biggest at the bottom; a group missing on a day counts as 0.
function breakdownSeries(points) {
    const labels = new Map();
    points.forEach((point) => point.groups.forEach(({label}, key) => labels.set(key, label))); // latest name wins
    const last = points.at(-1);
    const keys = [...labels.keys()].sort((a, b) => (last.groups.get(b)?.value ?? 0) - (last.groups.get(a)?.value ?? 0));

    return keys.map((key, i) => {
        const data = points.map((point) => point.groups.get(key)?.value ?? 0);
        return {key, label: labels.get(key), color: paletteColor(i), data, first: data[0], last: data.at(-1)};
    });
}

function Change({value, currency, format}) {
    return (
        <Box component="span" sx={{color: value >= 0 ? "success.main" : "error.main", fontWeight: 600}}>
            {value >= 0 ? "+" : "−"}{format(Math.abs(value), currency)}
        </Box>
    );
}

export default function NetWorthChart({currencies, currentTotal, categories}) {
    const {data: history, isLoading} = useGetNetWorthHistoryQuery();
    const theme = useTheme();
    const {hidden, format} = useBalancesVisibility();
    const [range, setRange] = useState("All");
    const [view, setView] = useState("total");
    const currency = currencies?.main;

    const allTotalPoints = useTotalPoints(history, currency, currentTotal);
    const totalPoints = useMemo(() => withinRange(allTotalPoints, range), [allTotalPoints, range]);
    const allBreakdownPoints = useBreakdownPoints(history, view, currency, categories);
    const breakdownPoints = useMemo(() => withinRange(allBreakdownPoints, range), [allBreakdownPoints, range]);

    const isBreakdown = view !== "total";
    const points = isBreakdown ? breakdownPoints : totalPoints;
    const series = useMemo(() => isBreakdown && breakdownPoints.length > 1 ? breakdownSeries(breakdownPoints) : [], [isBreakdown, breakdownPoints]);

    const first = points[0];
    const last = points.at(-1);
    const change = !isBreakdown && first && last ? last.value - first.value : 0;
    const changePercent = first?.value ? change / first.value * 100 : 0;
    // short ranges (e.g. the first weeks of breakdowns) read better with days on the axis
    const tickFormat = first && last && last.date - first.date < 120 * DAY ? dayMonth : monthYear;

    const chartSeries = isBreakdown
        ? series.map((s) => ({
            id: s.key, label: s.label, data: s.data, color: s.color, stack: "total", area: true, showMark: false,
            curve: "monotoneX", valueFormatter: (value) => format(value, currency)
        }))
        : [{
            data: points.map((point) => point.value), area: true, color: (theme.vars ?? theme).palette.primary.main,
            showMark: false, curve: "monotoneX", valueFormatter: (value) => format(value, currency)
        }];

    const emptyMessage = isBreakdown
        ? `The ${view} breakdown is saved with each nightly snapshot, so this chart fills in from the first one${allBreakdownPoints.length > 1 ? " in this range" : ""}.`
        : "Your net worth is saved every night; the chart fills in from here.";

    return (
        <Card sx={{height: "100%"}}>
            <CardContent sx={{p: {xs: 2.5, sm: 3}}}>
                <Stack direction="row" sx={{justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap"}}>
                    <div>
                        <Typography variant="h6" component="h2">Net worth over time</Typography>
                        {points.length > 1 && !isBreakdown &&
                            <Typography variant="body2" sx={{color: change >= 0 ? "success.main" : "error.main", fontWeight: 600}}>
                                {change >= 0 ? "+" : "−"}{format(Math.abs(change), currency)} ({change >= 0 ? "+" : "−"}{Math.abs(changePercent).toFixed(1)}%)
                                <Typography component="span" variant="body2" color="textSecondary" sx={{fontWeight: 400}}>
                                    {" "}since {monthYear.format(first.date)}
                                </Typography>
                            </Typography>}
                        {points.length > 1 && isBreakdown &&
                            <Typography variant="body2" color="textSecondary">
                                By {view} since {fullDate.format(first.date)}
                            </Typography>}
                    </div>
                    <Stack direction="row" sx={{gap: 1, flexWrap: "wrap"}}>
                        <ToggleButtonGroup size="small" exclusive value={view} onChange={(e, value) => value && setView(value)} aria-label="Show">
                            {Object.entries(VIEWS).map(([key, label]) => <ToggleButton key={key} value={key} sx={{px: 1.5}}>{label}</ToggleButton>)}
                        </ToggleButtonGroup>
                        <ToggleButtonGroup size="small" exclusive value={range} onChange={(e, value) => value && setRange(value)} aria-label="Time range">
                            {Object.keys(RANGES).map((key) => <ToggleButton key={key} value={key} sx={{px: 1.5}}>{key}</ToggleButton>)}
                        </ToggleButtonGroup>
                    </Stack>
                </Stack>

                <Box sx={{height: 260, mt: 1}}>
                    {isLoading || !currency
                        ? <Skeleton variant="rounded" height="100%"/>
                        : points.length < 2
                            ? <Typography color="textSecondary" sx={{pt: 4}}>{emptyMessage}</Typography>
                            : <LineChart
                                height={260}
                                skipAnimation
                                hideLegend
                                grid={{horizontal: true}}
                                margin={{left: 8, right: 16, top: 16, bottom: 8}}
                                xAxis={[{
                                    data: points.map((point) => point.date),
                                    scaleType: "time",
                                    valueFormatter: (date, context) => context.location === "tick" ? tickFormat.format(date) : fullDate.format(date),
                                    tickNumber: 5
                                }]}
                                yAxis={[{
                                    width: hidden ? 8 : 64,
                                    valueFormatter: (value) => hidden ? "" : compact(currency).format(value)
                                }]}
                                series={chartSeries}
                                sx={{
                                    "& .MuiLineChart-area": {fillOpacity: isBreakdown ? 0.55 : 0.15},
                                    "& .MuiLineChart-line": {strokeWidth: isBreakdown ? 1.5 : 2.5}
                                }}
                            />}
                </Box>

                {series.length > 0 &&
                    <Stack component="ul" direction="row" sx={{listStyle: "none", p: 0, m: 0, mt: 1.5, columnGap: 2.5, rowGap: 0.75, flexWrap: "wrap"}}>
                        {series.map((s) =>
                            <Stack component="li" key={s.key} direction="row" spacing={0.75} sx={{alignItems: "center"}}>
                                <Box sx={{width: 10, height: 10, borderRadius: "50%", bgcolor: s.color, flexShrink: 0}}/>
                                <Typography variant="body2">{s.label}</Typography>
                                <Typography variant="body2" sx={{fontVariantNumeric: "tabular-nums"}}>
                                    <Change value={s.last - s.first} currency={currency} format={format}/>
                                </Typography>
                            </Stack>)}
                    </Stack>}
            </CardContent>
        </Card>
    );
}
