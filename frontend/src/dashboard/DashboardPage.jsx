import React, {useState} from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import TopBar from "./TopBar";
import SummaryCard from "./SummaryCard";
import CategoryCard from "./CategoryCard";
import CategoryDialog from "./CategoryDialog";
import useDashboardData from "./useDashboardData";
import {BalancesVisibilityProvider} from "./balancesVisibility";

export default function DashboardPage() {
    return (
        <BalancesVisibilityProvider>
            <Dashboard/>
        </BalancesVisibilityProvider>
    );
}

function Dashboard() {
    const {currencies, categories, totals, ratesDate, isLoading, isError, retry} = useDashboardData();
    const [addingCategory, setAddingCategory] = useState(false);

    return (
        <Box sx={{minHeight: "100vh", bgcolor: "background.default"}}>
            <TopBar/>
            <Container maxWidth="lg" sx={{py: {xs: 2, sm: 4}}}>
                <Stack spacing={3}>
                    {isError && !isLoading &&
                        <Alert severity="error" action={<Button color="inherit" size="small" onClick={retry}>Retry</Button>}>
                            Couldn't load your assets or the currency rates.
                        </Alert>}

                    <SummaryCard currencies={currencies} totals={totals} categoryCount={categories?.length ?? 0} ratesDate={ratesDate}/>

                    <Stack direction="row" sx={{justifyContent: "space-between", alignItems: "center"}}>
                        <Typography variant="h6" component="h2">Categories</Typography>
                        <Button variant="contained" startIcon={<AddIcon/>} onClick={() => setAddingCategory(true)}>
                            New category
                        </Button>
                    </Stack>

                    {!categories && !isError && [0, 1].map((i) =>
                        <Card key={i} sx={{p: 3}}>
                            <Skeleton variant="text" width={200} sx={{fontSize: "1.3rem"}}/>
                            <Skeleton variant="text" width={80}/>
                            <Skeleton variant="rounded" height={88} sx={{mt: 2}}/>
                        </Card>)}

                    {categories?.length === 0 &&
                        <Card sx={{p: 4, textAlign: "center"}}>
                            <Typography sx={{mb: 2}}>You don't have any categories yet.</Typography>
                            <Button variant="outlined" startIcon={<AddIcon/>} onClick={() => setAddingCategory(true)}>
                                Create your first category
                            </Button>
                        </Card>}

                    {categories?.map((category) =>
                        <CategoryCard key={category.id} category={category} currencies={currencies}/>)}
                </Stack>
            </Container>

            {addingCategory && <CategoryDialog onClose={() => setAddingCategory(false)}/>}
        </Box>
    );
}
