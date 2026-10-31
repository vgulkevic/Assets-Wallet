import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {useUpdateUserProfileMutation} from "../api/assetManagerApi";
import {SUPPORTED_CURRENCIES} from "../utils/currencies";
import {formatMoney} from "../utils/money";

const ratesDateFormat = new Intl.DateTimeFormat("en-GB", {day: "numeric", month: "short", year: "numeric"});

function CurrencySelect({label, value, onChange}) {
    return (
        <TextField select size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)} sx={{minWidth: 130}}>
            {SUPPORTED_CURRENCIES.map((currency) => <MenuItem key={currency.id} value={currency.id}>{currency.name}</MenuItem>)}
        </TextField>
    );
}

export default function SummaryCard({currencies, totals, categoryCount, ratesDate}) {
    const [updateProfile] = useUpdateUserProfileMutation();

    return (
        <Card>
            <CardContent sx={{p: {xs: 2.5, sm: 3}}}>
                <Stack direction={{xs: "column", md: "row"}} spacing={3} sx={{justifyContent: "space-between", alignItems: {md: "flex-end"}}}>
                    <div>
                        <Typography variant="overline" color="text.secondary">Net worth</Typography>
                        {totals ? <>
                            <Typography variant="h4" component="p" sx={{fontVariantNumeric: "tabular-nums"}}>
                                {formatMoney(totals.main, currencies.main)}
                            </Typography>
                            <Typography variant="h6" component="p" color="text.secondary" sx={{fontWeight: 500, fontVariantNumeric: "tabular-nums"}}>
                                {formatMoney(totals.secondary, currencies.secondary)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                {totals.assetCount} {totals.assetCount === 1 ? "asset" : "assets"} in {categoryCount} {categoryCount === 1 ? "category" : "categories"}
                                {ratesDate && ` · ECB rates of ${ratesDateFormat.format(new Date(ratesDate))}`}
                            </Typography>
                        </> : <>
                            <Skeleton variant="text" width={220} sx={{fontSize: "2.2rem"}}/>
                            <Skeleton variant="text" width={140} sx={{fontSize: "1.3rem"}}/>
                            <Skeleton variant="text" width={260}/>
                        </>}
                    </div>

                    {currencies &&
                        <Stack direction="row" spacing={1.5}>
                            <CurrencySelect label="Main currency" value={currencies.main}
                                            onChange={(main) => updateProfile({...currencies, main})}/>
                            <CurrencySelect label="Secondary" value={currencies.secondary}
                                            onChange={(secondary) => updateProfile({...currencies, secondary})}/>
                        </Stack>
                    }
                </Stack>
            </CardContent>
        </Card>
    );
}
