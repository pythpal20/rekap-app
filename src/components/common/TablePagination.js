import React from 'react';
import { Pagination } from 'react-bootstrap';

export default function TablePagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
    if (totalPages <= 1) return null;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 p-3 bg-white border-top">
            <small className="text-muted text-center text-sm-start">
                Menampilkan <strong>{startItem}-{endItem}</strong> dari <strong>{totalItems}</strong> data
            </small>
            <Pagination size="sm" className="mb-0 flex-wrap justify-content-center">
                <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
                {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                        return (
                            <Pagination.Item key={pageNum} active={pageNum === currentPage} onClick={() => onPageChange(pageNum)}>
                                {pageNum}
                            </Pagination.Item>
                        );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <Pagination.Ellipsis key={pageNum} disabled />;
                    }
                    return null;
                })}
                <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
        </div>
    );
}