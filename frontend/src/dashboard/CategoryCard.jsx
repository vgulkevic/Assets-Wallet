import React, {useMemo, useState} from "react";
import {enqueueSnackbar} from "notistack";
import {closestCenter, DndContext} from "@dnd-kit/core";
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {useDeleteCategoryMutation, useReorderAssetsMutation} from "../api/assetManagerApi";
import {DragHandle, useDragSensors} from "../common/sortable";
import {isStale, STALE_AFTER_DAYS, timeAgo} from "../utils/time";
import ConfirmDialog from "../common/ConfirmDialog";
import {useBalancesVisibility} from "./balancesVisibility";
import AssetDialog from "./AssetDialog";
import CategoryDialog from "./CategoryDialog";

const NEW_ASSET = "new";
const CUSTOM = "custom";

// "custom" is the user's saved order (drag to change); clicking a column sorts by it for now.
function useSortedAssets(assets) {
    const [sort, setSort] = useState({by: CUSTOM});

    const sorted = useMemo(() => {
        if (sort.by === CUSTOM) {
            return assets;
        }
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

    return [sorted, sort, toggle, () => setSort({by: CUSTOM})];
}

// "Updated 3 days ago", amber once it's older than STALE_AFTER_DAYS
function UpdatedLabel({updatedAt}) {
    if (!updatedAt) {
        // assets that haven't been edited since history tracking began (Nov 2026)
        return <Typography variant="caption" color="textSecondary">Updated before Nov 2026</Typography>;
    }
    const stale = isStale(updatedAt);
    const label = <Typography variant="caption" sx={{color: stale ? "warning.main" : "text.secondary"}}>Updated {timeAgo(updatedAt)}</Typography>;
    return stale ? <Tooltip title={`Not updated for over ${STALE_AFTER_DAYS} days`}>{label}</Tooltip> : label;
}

// drag*: sortable props for moving the whole card (from DashboardPage), absent when it can't be moved
export default function CategoryCard({category, currencies, dragAttributes, dragListeners, dragActivatorRef}) {
    const {format} = useBalancesVisibility();
    const isPhone = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    const [sortedAssets, sort, toggleSort, resetSort] = useSortedAssets(category.assets);
    // NEW_ASSET, an asset being edited, or null
    const [assetInDialog, setAssetInDialog] = useState(null);
    const [renaming, setRenaming] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [deleteCategory, {isLoading: deleting}] = useDeleteCategoryMutation();
    const [reorderAssets] = useReorderAssetsMutation();
    const sensors = useDragSensors();

    const removeCategory = async () => {
        try {
            await deleteCategory(category.id).unwrap();
            enqueueSnackbar(`"${category.name}" deleted`, {variant: "success"});
        } catch {
            setConfirmDelete(false);
        }
    };

    const moveAsset = ({active, over}) => {
        if (over && active.id !== over.id) {
            const ids = category.assets.map((asset) => asset.id);
            reorderAssets({categoryId: category.id, assetIds: arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id))});
        }
    };

    const assetCount = category.assets.length;
    const listProps = {assets: sortedAssets, currencies, onSelect: setAssetInDialog, draggable: sort.by === CUSTOM && assetCount > 1};

    return (
        <Card>
            <Stack direction="row" spacing={1} sx={{alignItems: "center", pl: {xs: 1, sm: 1.5}, pr: {xs: 1, sm: 2}, py: 2}}>
                {dragListeners &&
                    <DragHandle attributes={dragAttributes} listeners={dragListeners} activatorRef={dragActivatorRef} label={`Move category ${category.name}`}/>}
                <Box sx={{flexGrow: 1, minWidth: 0}}>
                    <Typography variant="h6" component="h2" noWrap>{category.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {assetCount} {assetCount === 1 ? "asset" : "assets"}
                    </Typography>
                </Box>
                <Box sx={{textAlign: "right", fontVariantNumeric: "tabular-nums"}}>
                    <Typography sx={{fontWeight: 700}}>{format(category.totalInMain, currencies.main)}</Typography>
                    <Typography variant="body2" color="textSecondary">{format(category.totalInSecondary, currencies.secondary)}</Typography>
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
                ? <Typography color="textSecondary" sx={{px: 3, py: 3}}>No assets yet.</Typography>
                : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={moveAsset}>
                    <SortableContext items={sortedAssets.map((asset) => asset.id)} strategy={verticalListSortingStrategy}>
                        {isPhone
                            ? <AssetList {...listProps}/>
                            : <AssetTable {...listProps} sort={sort} onSort={toggleSort} onResetSort={resetSort}/>}
                    </SortableContext>
                </DndContext>
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

function AssetTable({assets, currencies, sort, onSort, onResetSort, onSelect, draggable}) {
    const columns = [
        // no width: the name column takes whatever the others leave
        {id: "name", label: "Name"},
        {id: "holding", label: "Holding", align: "right", width: "20%"},
        {id: "amountInMain", label: currencies.main, align: "right", sortable: true, width: "19%"},
        {id: "amountInSecondary", label: currencies.secondary, align: "right", sortable: true, width: "19%"}
    ];

    return (
        // fixed layout so the columns line up across all category cards
        <Table size="small" sx={{
            tableLayout: "fixed",
            // long names and amounts get "…"
            "& td, & th": {px: 2, overflow: "hidden", textOverflow: "ellipsis"},
            // ...but not the icon columns
            "& .icon-cell": {width: 52, px: 1, textAlign: "center", overflow: "visible", textOverflow: "clip"}
        }}>
            <TableHead>
                <TableRow>
                    <TableCell className="icon-cell">
                        {sort.by !== CUSTOM &&
                            <Tooltip title="Back to your order">
                                <IconButton size="small" onClick={onResetSort} aria-label="Back to your order">
                                    <FormatListNumberedIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>}
                    </TableCell>
                    {columns.map((column) =>
                        <TableCell key={column.id} align={column.align} width={column.width} sortDirection={sort.by === column.id ? sort.direction : false}>
                            {column.id === "name" || column.sortable
                                ? <TableSortLabel active={sort.by === column.id} direction={sort.by === column.id ? sort.direction : "asc"}
                                                  onClick={() => onSort(column.id)}>{column.label}</TableSortLabel>
                                : column.label}
                        </TableCell>)}
                    <TableCell className="icon-cell"/>
                </TableRow>
            </TableHead>
            <TableBody>
                {assets.map((asset) => <AssetRow key={asset.id} asset={asset} currencies={currencies} onSelect={onSelect} draggable={draggable}/>)}
            </TableBody>
        </Table>
    );
}

function AssetRow({asset, currencies, onSelect, draggable}) {
    const {format} = useBalancesVisibility();
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging} = useSortable({id: asset.id, disabled: !draggable});

    return (
        <TableRow ref={setNodeRef} style={{transform: CSS.Translate.toString(transform), transition}} hover onClick={() => onSelect(asset)}
                  sx={{cursor: "pointer", position: "relative", zIndex: isDragging ? 1 : undefined, "&:last-child td": {border: 0}, bgcolor: isDragging ? "action.selected" : undefined}}>
            <TableCell className="icon-cell">
                {draggable && <DragHandle attributes={attributes} listeners={listeners} activatorRef={setActivatorNodeRef} label={`Move ${asset.name}`}/>}
            </TableCell>
            <TableCell title={asset.name}>
                <Box sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{asset.name}</Box>
                <UpdatedLabel updatedAt={asset.updatedAt}/>
            </TableCell>
            <TableCell align="right" sx={{color: "text.secondary"}}>{format(parseFloat(asset.amount), asset.currency)}</TableCell>
            <TableCell align="right">{format(asset.amountInMain, currencies.main)}</TableCell>
            <TableCell align="right">{format(asset.amountInSecondary, currencies.secondary)}</TableCell>
            <TableCell className="icon-cell">
                <IconButton size="small" aria-label={`Edit ${asset.name}`}>
                    <EditOutlinedIcon fontSize="small"/>
                </IconButton>
            </TableCell>
        </TableRow>
    );
}

function AssetList({assets, currencies, onSelect, draggable}) {
    return (
        <List disablePadding>
            {assets.map((asset) => <AssetListItem key={asset.id} asset={asset} currencies={currencies} onSelect={onSelect} draggable={draggable}/>)}
        </List>
    );
}

function AssetListItem({asset, currencies, onSelect, draggable}) {
    const {format} = useBalancesVisibility();
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging} = useSortable({id: asset.id, disabled: !draggable});

    return (
        <ListItemButton ref={setNodeRef} style={{transform: CSS.Translate.toString(transform), transition}} onClick={() => onSelect(asset)} divider
                        sx={{pl: draggable ? 0.5 : 2, position: "relative", zIndex: isDragging ? 1 : undefined, bgcolor: isDragging ? "action.selected" : undefined}}>
            {draggable && <DragHandle attributes={attributes} listeners={listeners} activatorRef={setActivatorNodeRef} label={`Move ${asset.name}`}/>}
            <ListItemText primary={asset.name} secondary={<>
                {format(parseFloat(asset.amount), asset.currency)}
                <br/>
                <UpdatedLabel updatedAt={asset.updatedAt}/>
            </>}/>
            <Box sx={{textAlign: "right", fontVariantNumeric: "tabular-nums", ml: 2}}>
                <Typography variant="body2" sx={{fontWeight: 600}}>{format(asset.amountInMain, currencies.main)}</Typography>
                <Typography variant="caption" color="textSecondary">{format(asset.amountInSecondary, currencies.secondary)}</Typography>
            </Box>
        </ListItemButton>
    );
}
