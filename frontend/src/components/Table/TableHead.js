import React from "react";

import {TableCell, TableHead, TableRow, TableSortLabel} from "@material-ui/core";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import useStyles from "./tableStyles";

export default function EnhancedTableHead({ onRequestSort, order, orderBy, headCells }) {
    const classes = useStyles();

    return (
        <TableHead>
            <TableRow >
                {headCells.map(headCell => {
                    return (
                        <TableCell
                            className={classes.tableCell}
                            key={headCell.id}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                className={classes.sortLabel}
                                classes={{
                                    icon: classes.icon,
                                }}
                                IconComponent={ArrowDropDownIcon}
                                hideSortIcon={orderBy !== headCell.id}
                                active={orderBy === headCell.id}
                                direction={order === 'asc' ? 'desc' : 'asc'}
                                onClick={()=>onRequestSort(headCell.id)}
                            >
                                {headCell.label}
                            </TableSortLabel>
                        </TableCell>)
                })}
            </TableRow>
        </TableHead>
    );
}