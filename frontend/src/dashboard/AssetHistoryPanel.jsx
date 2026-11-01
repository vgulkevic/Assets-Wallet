import React, {useMemo} from "react";
import {LineChart} from "@mui/x-charts/LineChart";
import {useTheme} from "@mui/material/styles";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import {useGetAssetHistoryQuery, useSetAssetChangeExcludedMutation} from "../api/assetManagerApi";
import {useBalancesVisibility} from "./balancesVisibility";

const dateTime = new Intl.DateTimeFormat("en-GB", {day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"});
const shortDate = new Intl.DateTimeFormat("en-GB", {day: "numeric", month: "short", year: "2-digit"});
// 3 significant digits keep neighbouring ticks apart ("10.1K", "10.3K") once the axis is padded below
const axisNumber = new Intl.NumberFormat("en-GB", {notation: "compact", maximumSignificantDigits: 3});

// Axis range with at least 5% of the value as room on each side, so a small change looks small
// instead of filling the whole chart. Never goes below zero for positive values.
function paddedRange(values) {
    const low = Math.min(...values);
    const high = Math.max(...values);
    const pad = Math.max((high - low) * 0.1, Math.abs(high) * 0.05, 1);
    return {min: low >= 0 ? Math.max(0, low - pad) : low - pad, max: high + pad};
}

// For changes made right after an excluded one: the value they count from in the chart, when it
// differs from the (excluded) value they replaced. Keyed by change id.
function countedFrom(history) {
    const result = new Map();
    let counted = null;
    for (const change of history) {
        if (change.excluded) {
            continue;
        }
        if (change.type === "UPDATED" && counted && (counted.amount !== change.previousAmount || counted.currency !== change.previousCurrency)) {
            result.set(change.id, counted);
        }
        counted = change.type === "DELETED" ? null : change;
    }
    return result;
}

// What a change did, in words. `money` formats (and masks) an amount.
function describe(change, money) {
    const amount = money(parseFloat(change.amount), change.currency);
    switch (change.type) {
        case "BASELINE":
            return `Starting value ${amount}`;
        case "CREATED":
            return `Added with ${amount}`;
        case "DELETED":
            return `Deleted (was ${amount})`;
        default: {
            const parts = [];
            if (change.previousAmount !== change.amount || change.previousCurrency !== change.currency) {
                const before = money(parseFloat(change.previousAmount), change.previousCurrency);
                const diff = change.previousCurrency === change.currency ? parseFloat(change.amount) - parseFloat(change.previousAmount) : null;
                parts.push(`${before} → ${amount}${diff === null ? "" : ` (${diff >= 0 ? "+" : "−"}${money(Math.abs(diff), change.currency)})`}`);
            }
            if (change.previousName !== change.name) {
                parts.push(`renamed from "${change.previousName}"`);
            }
            return parts.join(", ") || "Saved without changes";
        }
    }
}

// "In the chart: +€19.88 from €10,090.00", for a change whose previous value was excluded
function chartDifference(change, counted, money) {
    const from = money(parseFloat(counted.amount), counted.currency);
    if (counted.currency !== change.currency) {
        return `In the chart: from ${from}`;
    }
    const diff = parseFloat(change.amount) - parseFloat(counted.amount);
    return `In the chart: ${diff >= 0 ? "+" : "−"}${money(Math.abs(diff), change.currency)} from ${from}`;
}

export default function AssetHistoryPanel({assetId}) {
    const {data: history, isLoading} = useGetAssetHistoryQuery(assetId);
    const [setExcluded] = useSetAssetChangeExcludedMutation();
    const {hidden, format} = useBalancesVisibility();
    const theme = useTheme();

    // excluded changes and deletions don't count towards the chart
    const points = useMemo(() => (history ?? [])
        .filter((change) => !change.excluded && change.type !== "DELETED")
        .map((change) => ({date: new Date(change.changedAt), value: parseFloat(change.amount), currency: change.currency})), [history]);

    const fromCounted = useMemo(() => countedFrom(history ?? []), [history]);

    if (isLoading) {
        return <Skeleton variant="rounded" height={220}/>;
    }

    if (!history?.length) {
        return <Typography color="textSecondary" sx={{py: 2}}>No changes recorded yet.</Typography>;
    }

    const newestFirst = [...history].reverse();
    const currency = points.at(-1)?.currency;

    return (
        <>
            {points.length > 1 &&
                <Box sx={{height: 160, mx: -1}}>
                    <LineChart
                        height={160}
                        skipAnimation
                        hideLegend
                        grid={{horizontal: true}}
                        margin={{left: 4, right: 12, top: 12, bottom: 4}}
                        xAxis={[{data: points.map((p) => p.date), scaleType: "time", valueFormatter: (date) => shortDate.format(date), tickNumber: 3}]}
                        yAxis={[{
                            width: hidden ? 8 : 56,
                            ...paddedRange(points.map((p) => p.value)),
                            valueFormatter: (value) => hidden ? "" : axisNumber.format(value)
                        }]}
                        series={[{
                            data: points.map((p) => p.value),
                            curve: "stepAfter",
                            color: (theme.vars ?? theme).palette.primary.main,
                            showMark: true,
                            valueFormatter: (value, {dataIndex}) => format(value, points[dataIndex]?.currency ?? currency)
                        }]}
                    />
                </Box>}

            <List dense disablePadding>
                {newestFirst.map((change) =>
                    <ListItem key={change.id} divider disableGutters
                              secondaryAction={change.type !== "DELETED" &&
                                  <Tooltip title={change.excluded ? "Count this change in the chart again" : "Exclude from the chart (e.g. a typo)"}>
                                      <IconButton edge="end" size="small" aria-pressed={change.excluded}
                                                  aria-label={change.excluded ? "Include change" : "Exclude change"}
                                                  onClick={() => setExcluded({assetId, changeId: change.id, excluded: !change.excluded})}>
                                          {change.excluded ? <ReplayIcon fontSize="small"/> : <RemoveCircleOutlineIcon fontSize="small"/>}
                                      </IconButton>
                                  </Tooltip>}>
                        <ListItemText
                            primary={<>
                                <Box component="span" sx={change.excluded ? {textDecoration: "line-through", color: "text.disabled"} : undefined}>
                                    {describe(change, format)}
                                </Box>
                                {change.excluded && <Chip label="Excluded" size="small" variant="outlined" sx={{ml: 1, height: 20}}/>}
                            </>}
                            secondary={<>
                                {fromCounted.has(change.id) && <>{chartDifference(change, fromCounted.get(change.id), format)}<br/></>}
                                {dateTime.format(new Date(change.changedAt))}
                            </>}
                            sx={{pr: 5}}
                        />
                    </ListItem>)}
            </List>
        </>
    );
}
