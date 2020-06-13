import React, {useEffect, useState} from "react";

import {IconButton, Table, TableBody, TableCell, TableContainer, TableRow} from "@material-ui/core";

import EnhancedTableHead from "./TableHead";
import useStyles from "./tableStyles";
import Loader from "react-loader-spinner";
import DeleteIcon from '@material-ui/icons/Delete';
import CreateIcon from '@material-ui/icons/Create';

function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }

    return 0;
}

function stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

//TODO show error message above table
export default function CustomTable({headCells, summaryRowCells, tableElements, isLoading, tableElementOnClick}) {
    const classes = useStyles();
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState(null);

    const handleRequestSort = (property) => {
        const isCurrentOrderDesc = orderBy === property && order === 'desc';
        setOrder(isCurrentOrderDesc ? 'asc' : 'desc');
        setOrderBy(property);
    };

    useEffect(() => {
        if (!orderBy && headCells.length > 0) {
            setOrderBy(headCells[0].id);
        }
    }, [headCells, orderBy]);

    return (
        <>
            <TableContainer>
                <Table
                    className={classes.table}
                    aria-labelledby="tableTitle"
                    size='medium'
                    aria-label="enhanced table"
                >
                    <EnhancedTableHead
                        classes={classes}
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                        productCount={tableElements.length}
                        headCells={headCells}
                    />

                    {isLoading
                        ?
                        null
                        :
                        <TableBody>
                            {stableSort(tableElements, getSorting(order, orderBy))
                                .map((item, index) => {
                                    return (
                                        <TableRow
                                            hover
                                            classes={{hover: classes.rowHover}}
                                            className={index % 2 !== 0 ? classes.rowGrey : classes.rowWhite}
                                            role="checkbox"
                                            tabIndex={-1}
                                            key={index}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (tableElementOnClick) {
                                                    tableElementOnClick(item);
                                                }
                                            }}
                                        >
                                            {headCells.map((el, i) => {
                                                if (el.custom) {
                                                    const {element, cellProps} = el.custom;
                                                    //Fallthrough in case custom element shouldn't render
                                                    let p = cellProps ? cellProps(item) : {};
                                                    if (element)
                                                        return <TableCell key={i} {...p}>
                                                            {element(item)}
                                                        </TableCell>
                                                }

                                                if (el.id !== "delete" && el.id !== "edit") {
                                                    return (
                                                        <TableCell key={i}>
                                                            {
                                                                el.valueGetter
                                                                    ?
                                                                    el.valueGetter(item)
                                                                    :
                                                                    item[el.id]
                                                            }
                                                        </TableCell>
                                                    );
                                                }

                                                return (
                                                    <TableCell key={i}>
                                                        <IconButton color="default"
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        e.currentTarget.blur();
                                                                        el.onClickCallback(item)
                                                                    }}>
                                                            {
                                                                el.id === "delete"
                                                                    ?
                                                                    <DeleteIcon/>
                                                                    :
                                                                    <CreateIcon/>
                                                            }
                                                        </IconButton>
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    );
                                })}

                            {summaryRowCells ?

                                <TableRow tabIndex={-1}>
                                    {summaryRowCells.map((el, i) => {
                                        return (
                                            <TableCell key={i}>
                                                {el.onCalculate ? el.onCalculate(tableElements) : ""}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>

                                : null}
                        </TableBody>
                    }
                </Table>
            </TableContainer>

            {isLoading ?
                <div style={{textAlign: 'center'}}>
                    <Loader className="loader" type="Oval" color="#00BFFF" height="50" width="50"/>
                </div>
                :
                null
            }
        </>
    );
}