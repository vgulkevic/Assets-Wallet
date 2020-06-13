import React from 'react';
import ReactPaginate from 'react-paginate';

import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import useStyles from "./tableStyles";

function TablePaginationActions(props) {
    const classes = useStyles();
    const {count, page, rowsPerPage, onChangePage} = props;

    const handleBackButtonClick = event => {
        onChangePage(event, page - 1);
    };

    const handleNextButtonClick = event => {
        onChangePage(event, page + 1);
    };

    const handlePageClick = (data) => {
        onChangePage(null, data.selected);
    };

    return (
        <div className={classes.root}>

            <ReactPaginate
                pageCount={count / rowsPerPage}
                previousLabel={
                    <IconButton onClick={handleBackButtonClick} disabled={page === 0}>
                        <KeyboardArrowLeft/>
                    </IconButton>
                }
                nextLabel={
                    <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}>
                        <KeyboardArrowRight/>
                    </IconButton>
                }
                breakLabel={"..."}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
                marginPagesDisplayed={2}
                pageRangeDisplayed={1}
                initialPage={0}
                onPageChange={handlePageClick}
                containerClassName={classes.paginat}
                pageClassName={classes.pageItem}
                pageLinkClassName={"page-link"}
                activeClassName={classes.active}
            />

        </div>
    );
}

export default TablePaginationActions;