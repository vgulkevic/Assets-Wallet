import React, {useMemo, useState} from "react";
import {PieChart} from "@mui/x-charts/PieChart";
import {useTheme} from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import {sum} from "../utils/money";
import {useBalancesVisibility} from "./balancesVisibility";

const PALETTE = ["#1e88e5", "#43a047", "#fb8c00", "#8e24aa", "#00acc1", "#e53935", "#fdd835", "#6d4c41", "#3949ab", "#7cb342"];

function useSlices(categories, groupBy) {
    return useMemo(() => {
        if (!categories) {
            return [];
        }
        const groups = new Map();
        if (groupBy === "category") {
            categories.forEach((category) => groups.set(category.name, category.totalInMain));
        } else {
            categories.flatMap((category) => category.assets)
                .forEach((asset) => groups.set(asset.currency, (groups.get(asset.currency) ?? 0) + asset.amountInMain));
        }

        const total = sum([...groups.values()].filter((value) => value > 0));
        return [...groups.entries()]
            .filter(([, value]) => value > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([label, value], i) => ({id: label, label, value, share: total ? value / total : 0, color: PALETTE[i % PALETTE.length]}));
    }, [categories, groupBy]);
}

export default function AllocationCard({categories, currencies}) {
    const theme = useTheme();
    const {format} = useBalancesVisibility();
    const [groupBy, setGroupBy] = useState("category");
    const slices = useSlices(categories, groupBy);
    const percent = (share) => `${(share * 100).toFixed(share < 0.1 ? 1 : 0)}%`;

    return (
        <Card sx={{height: "100%"}}>
            <CardContent sx={{p: {xs: 2.5, sm: 3}}}>
                <Stack direction="row" sx={{justifyContent: "space-between", alignItems: "center", gap: 1}}>
                    <Typography variant="h6" component="h2">Allocation</Typography>
                    <ToggleButtonGroup size="small" exclusive value={groupBy} onChange={(e, value) => value && setGroupBy(value)} aria-label="Group allocation by">
                        <ToggleButton value="category" sx={{px: 1.5}}>Category</ToggleButton>
                        <ToggleButton value="currency" sx={{px: 1.5}}>Currency</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                {!categories
                    ? <Skeleton variant="circular" width={160} height={160} sx={{mx: "auto", my: 3}}/>
                    : slices.length === 0
                        ? <Typography color="textSecondary" sx={{pt: 4}}>Add assets to see how they're spread.</Typography>
                        : <>
                            <Box sx={{height: 170, mt: 1}}>
                                <PieChart
                                    height={170}
                                    skipAnimation
                                    hideLegend
                                    margin={{top: 4, bottom: 4, left: 4, right: 4}}
                                    series={[{
                                        data: slices.map(({id, label, value, color}) => ({id, label, value, color})),
                                        innerRadius: 52,
                                        outerRadius: 80,
                                        paddingAngle: 1.5,
                                        cornerRadius: 4,
                                        valueFormatter: ({value}) => `${format(value, currencies.main)} · ${percent(value / sum(slices.map((s) => s.value)))}`
                                    }]}
                                    sx={{"& .MuiPieArc-root": {stroke: theme.vars?.palette.background.paper}}}
                                />
                            </Box>
                            <Stack component="ul" spacing={0.75} sx={{listStyle: "none", p: 0, m: 0, mt: 1.5}}>
                                {slices.map((slice) =>
                                    <Stack component="li" key={slice.id} direction="row" spacing={1} sx={{alignItems: "center"}}>
                                        <Box sx={{width: 10, height: 10, borderRadius: "50%", bgcolor: slice.color, flexShrink: 0}}/>
                                        <Typography variant="body2" noWrap sx={{flexGrow: 1, minWidth: 0}}>{slice.label}</Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{fontVariantNumeric: "tabular-nums"}}>
                                            {format(slice.value, currencies.main)}
                                        </Typography>
                                        <Typography variant="body2" sx={{fontWeight: 600, minWidth: 44, textAlign: "right", fontVariantNumeric: "tabular-nums"}}>
                                            {percent(slice.share)}
                                        </Typography>
                                    </Stack>)}
                            </Stack>
                        </>}
            </CardContent>
        </Card>
    );
}
