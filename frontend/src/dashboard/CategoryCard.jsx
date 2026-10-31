import React, {useMemo, useState} from "react";
import {enqueueSnackbar} from "notistack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {useDeleteCategoryMutation} from "../api/assetManagerApi";
import {formatMoney} from "../utils/money";
import ConfirmDialog from "../common/ConfirmDialog";
import AssetDialog from "./AssetDialog";
import CategoryDialog from "./CategoryDialog";

const NEW_ASSET = "new";

function useSortedAssets(assets) {
    const [sort, setSort] = useState({by: "name", direction: "asc"});

    const sorted = useMemo(() => {
        const compare = sort.by === "name"
            ? (a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: "base"})
            : (a, b) => a[sort.by] - b[sort.by];
        const result = [...assets].sort(compare);
        return sort.direction === "asc" ? result : result.reverse();
    }, [assets, sort]);

    const toggle = (by) => setSort((current) => ({
        by,
        // numbers read best biggest-first, names A-Z
        direction: current.by === by ? (current.direction === "asc" ? "desc" : "asc") : (by === "name" ? "asc" : "desc")
    }));

    return [sorted, sort, toggle];
}

export default function CategoryCard({category, currencies}) {
    const isPhone = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    const [sortedAssets, sort, toggleSort] = useSortedAssets(category.assets);
    // NEW_ASSET, an asset being edited, or null
    const [assetInDialog, setAssetInDialog] = useState(null);
    const [renaming, setRenaming] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [deleteCategory, {isLoading: deleting}] = useDeleteCategoryMutation();

    const removeCategory = async () => {
        try {
            await deleteCategory(category.id).unwrap();
            enqueueSnackbar(`"${category.name}" deleted`, {variant: "success"});
        } catch {
            setConfirmDelete(false);
        }
    };

    const assetCount = category.assets.length;

    return (
        <Card>
            <Stack direction="row" spacing={1} sx={{alignItems: "center", px: {xs: 2, sm: 3}, py: 2}}>
                <Box sx={{flexGrow: 1, minWidth: 0}}>
                    <Typography variant="h6" component="h2" noWrap>{category.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {assetCount} {assetCount === 1 ? "asset" : "assets"}
                    </Typography>
                </Box>
                <Box sx={{textAlign: "right", fontVariantNumeric: "tabular-nums"}}>
                    <Typography sx={{fontWeight: 700}}>{formatMoney(category.totalInMain, currencies.main)}</Typography>
                    <Typography variant="body2" color="text.secondary">{formatMoney(category.totalInSecondary, currencies.secondary)}</Typography>
                </Box>
                <IconButton aria-label={`Actions for ${category.name}`} onClick={(e) => setMenuAnchor(e.currentTarget)}>
                    <MoreVertIcon/>
                </IconButton>
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                    <MenuItem onClick={() => {
                        setMenuAnchor(null);
                        setRenaming(true);
                    }}>
                        <ListItemIcon><EditOutlinedIcon fontSize="small"/></ListItemIcon>Rename
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setMenuAnchor(null);
                        setConfirmDelete(true);
                    }} sx={{color: "error.main"}}>
                        <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error"/></ListItemIcon>Delete category
                    </MenuItem>
                </Menu>
            </Stack>
            <Divider/>

            {assetCount === 0
                ? <Typography color="text.secondary" sx={{px: 3, py: 3}}>No assets yet.</Typography>
                : isPhone
                    ? <AssetList assets={sortedAssets} currencies={currencies} onSelect={setAssetInDialog}/>
                    : <AssetTable assets={sortedAssets} currencies={currencies} sort={sort} onSort={toggleSort} onSelect={setAssetInDialog}/>
            }

            <Box sx={{px: {xs: 1, sm: 2}, py: 1}}>
                <Button startIcon={<AddIcon/>} onClick={() => setAssetInDialog(NEW_ASSET)}>Add asset</Button>
            </Box>

            {assetInDialog &&
                <AssetDialog categoryId={category.id} asset={assetInDialog === NEW_ASSET ? null : assetInDialog}
                             defaultCurrency={currencies.main} onClose={() => setAssetInDialog(null)}/>}
            {renaming && <CategoryDialog category={category} onClose={() => setRenaming(false)}/>}
            <ConfirmDialog open={confirmDelete} title={`Delete "${category.name}"?`} busy={deleting}
                           description={assetCount > 0
                               ? `This also deletes its ${assetCount} ${assetCount === 1 ? "asset" : "assets"}. This can't be undone.`
                               : "This can't be undone."}
                           onConfirm={removeCategory} onCancel={() => setConfirmDelete(false)}/>
        </Card>
    );
}

function AssetTable({assets, currencies, sort, onSort, onSelect}) {
    const columns = [
        {id: "name", label: "Name", width: "34%"},
        {id: "holding", label: "Holding", align: "right", width: "22%"},
        {id: "amountInMain", label: currencies.main, align: "right", sortable: true, width: "20%"},
        {id: "amountInSecondary", label: currencies.secondary, align: "right", sortable: true, width: "20%"}
    ];

    return (
        // fixed layout so the columns line up across all category cards
        <Table size="small" sx={{
            tableLayout: "fixed",
            "& td, & th": {px: 3, overflow: "hidden", textOverflow: "ellipsis"},
            "& .MuiTableCell-paddingCheckbox": {px: 1}
        }}>
            <TableHead>
                <TableRow>
                    {columns.map((column) =>
                        <TableCell key={column.id} align={column.align} width={column.width} sortDirection={sort.by === column.id ? sort.direction : false}>
                            {column.id === "name" || column.sortable
                                ? <TableSortLabel active={sort.by === column.id} direction={sort.by === column.id ? sort.direction : "asc"}
                                                  onClick={() => onSort(column.id)}>{column.label}</TableSortLabel>
                                : column.label}
                        </TableCell>)}
                    <TableCell padding="checkbox" width={56}/>
                </TableRow>
            </TableHead>
            <TableBody>
                {assets.map((asset) =>
                    <TableRow key={asset.id} hover onClick={() => onSelect(asset)} sx={{cursor: "pointer", "&:last-child td": {border: 0}}}>
                        <TableCell sx={{whiteSpace: "nowrap"}} title={asset.name}>{asset.name}</TableCell>
                        <TableCell align="right" sx={{color: "text.secondary"}}>{formatMoney(parseFloat(asset.amount), asset.currency)}</TableCell>
                        <TableCell align="right">{formatMoney(asset.amountInMain, currencies.main)}</TableCell>
                        <TableCell align="right">{formatMoney(asset.amountInSecondary, currencies.secondary)}</TableCell>
                        <TableCell padding="checkbox">
                            <IconButton size="small" aria-label={`Edit ${asset.name}`}>
                                <EditOutlinedIcon fontSize="small"/>
                            </IconButton>
                        </TableCell>
                    </TableRow>)}
            </TableBody>
        </Table>
    );
}

function AssetList({assets, currencies, onSelect}) {
    return (
        <List disablePadding>
            {assets.map((asset) =>
                <ListItemButton key={asset.id} onClick={() => onSelect(asset)} divider>
                    <ListItemText primary={asset.name} secondary={formatMoney(parseFloat(asset.amount), asset.currency)}/>
                    <Box sx={{textAlign: "right", fontVariantNumeric: "tabular-nums", ml: 2}}>
                        <Typography variant="body2" sx={{fontWeight: 600}}>{formatMoney(asset.amountInMain, currencies.main)}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatMoney(asset.amountInSecondary, currencies.secondary)}</Typography>
                    </Box>
                </ListItemButton>)}
        </List>
    );
}
