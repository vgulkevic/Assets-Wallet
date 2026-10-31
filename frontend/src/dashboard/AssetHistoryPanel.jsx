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

export default function AssetHistoryPanel({assetId}) {
    const {data: history, isLoading} = useGetAssetHistoryQuery(assetId);
    const [setExcluded] = useSetAssetChangeExcludedMutation();
    const {hidden, format} = useBalancesVisibility();
    const theme = useTheme();

    // excluded changes and deletions don't count towards the chart
    const points = useMemo(() => (history ?? [])
        .filter((change) => !change.excluded && change.type !== "DELETED")
        .map((change) => ({date: new Date(change.changedAt), value: parseFloat(change.amount), currency: change.currency})), [history]);

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
                        yAxis={[{width: hidden ? 8 : 56, valueFormatter: (value) => hidden ? "" : new Intl.NumberFormat("en-GB", {notation: "compact"}).format(value)}]}
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
                            secondary={dateTime.format(new Date(change.changedAt))}
                            sx={{pr: 5}}
                        />
                    </ListItem>)}
            </List>
        </>
    );
}
