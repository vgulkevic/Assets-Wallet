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
import {useBalancesVisibility} from "./balancesVisibility";

const RANGES = {"1Y": 1, "3Y": 3, All: null};
const monthYear = new Intl.DateTimeFormat("en-GB", {month: "short", year: "numeric"});
const fullDate = new Intl.DateTimeFormat("en-GB", {day: "numeric", month: "short", year: "numeric"});
const compact = (currency) => new Intl.NumberFormat("en-GB", {style: "currency", currency, currencyDisplay: "narrowSymbol", notation: "compact", maximumFractionDigits: 1});

// Saved daily/monthly totals plus today's live total, in the main currency.
function usePoints(history, currency, currentTotal) {
    return useMemo(() => {
        if (!history || !currency) {
            return [];
        }
        const points = history
            .filter((entry) => entry.totals?.[currency] !== undefined)
            .map((entry) => ({date: new Date(`${entry.date}T12:00:00Z`), value: entry.totals[currency]}))
            .sort((a, b) => a.date - b.date);

        const today = new Date();
        const last = points.at(-1);
        if (currentTotal !== undefined && !Number.isNaN(currentTotal)) {
            if (last && last.date.toDateString() === today.toDateString()) {
                last.value = currentTotal;
            } else {
                points.push({date: today, value: currentTotal});
            }
        }
        return points;
    }, [history, currency, currentTotal]);
}

export default function NetWorthChart({currencies, currentTotal}) {
    const {data: history, isLoading} = useGetNetWorthHistoryQuery();
    const theme = useTheme();
    const {hidden, format} = useBalancesVisibility();
    const [range, setRange] = useState("All");
    const currency = currencies?.main;
    const allPoints = usePoints(history, currency, currentTotal);

    const points = useMemo(() => {
        const years = RANGES[range];
        if (!years) {
            return allPoints;
        }
        const from = new Date();
        from.setFullYear(from.getFullYear() - years);
        return allPoints.filter((point) => point.date >= from);
    }, [allPoints, range]);

    const first = points[0];
    const last = points.at(-1);
    const change = first && last ? last.value - first.value : 0;
    const changePercent = first?.value ? change / first.value * 100 : 0;

    return (
        <Card sx={{height: "100%"}}>
            <CardContent sx={{p: {xs: 2.5, sm: 3}}}>
                <Stack direction="row" sx={{justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap"}}>
                    <div>
                        <Typography variant="h6" component="h2">Net worth over time</Typography>
                        {points.length > 1 &&
                            <Typography variant="body2" sx={{color: change >= 0 ? "success.main" : "error.main", fontWeight: 600}}>
                                {change >= 0 ? "+" : "−"}{format(Math.abs(change), currency)} ({change >= 0 ? "+" : "−"}{Math.abs(changePercent).toFixed(1)}%)
                                <Typography component="span" variant="body2" color="textSecondary" sx={{fontWeight: 400}}>
                                    {" "}since {monthYear.format(first.date)}
                                </Typography>
                            </Typography>}
                    </div>
                    <ToggleButtonGroup size="small" exclusive value={range} onChange={(e, value) => value && setRange(value)} aria-label="Time range">
                        {Object.keys(RANGES).map((key) => <ToggleButton key={key} value={key} sx={{px: 1.5}}>{key}</ToggleButton>)}
                    </ToggleButtonGroup>
                </Stack>

                <Box sx={{height: 260, mt: 1}}>
                    {isLoading || !currency
                        ? <Skeleton variant="rounded" height="100%"/>
                        : points.length < 2
                            ? <Typography color="textSecondary" sx={{pt: 4}}>
                                Your net worth is saved every night; the chart fills in from here.
                            </Typography>
                            : <LineChart
                                height={260}
                                skipAnimation
                                hideLegend
                                grid={{horizontal: true}}
                                margin={{left: 8, right: 16, top: 16, bottom: 8}}
                                xAxis={[{
                                    data: points.map((point) => point.date),
                                    scaleType: "time",
                                    valueFormatter: (date, context) => context.location === "tick" ? monthYear.format(date) : fullDate.format(date),
                                    tickNumber: 5
                                }]}
                                yAxis={[{
                                    width: hidden ? 8 : 64,
                                    valueFormatter: (value) => hidden ? "" : compact(currency).format(value)
                                }]}
                                series={[{
                                    data: points.map((point) => point.value),
                                    area: true,
                                    color: (theme.vars ?? theme).palette.primary.main,
                                    showMark: false,
                                    curve: "monotoneX",
                                    valueFormatter: (value) => format(value, currency)
                                }]}
                                sx={{"& .MuiLineChart-area": {fillOpacity: 0.15}, "& .MuiLineChart-line": {strokeWidth: 2.5}}}
                            />}
                </Box>
            </CardContent>
        </Card>
    );
}
