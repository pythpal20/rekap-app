import React, { useState } from 'react';
import { Container, Card, Button, Table } from 'react-bootstrap';
import TablePagination from '../components/common/TablePagination';

export default function SupplierView({
    suppliers,
    isSuperadmin,
    onOpenAddSupplier,
    onOpenEditSupplier,
    onDeleteSupplier
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const paginated = suppliers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(suppliers.length / rowsPerPage);

    return (
        <Container fluid className="p-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Data Penyedia (Supplier)</h5>
                {isSuperadmin && (
                    <Button variant="primary" className="fw-bold" onClick={onOpenAddSupplier}>
                        + Tambah Supplier
                    </Button>
                )}
            </div>

            <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-0">
                    <Table responsive hover className="align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3 ps-md-4">ID</th>
                                <th>Nama Supplier</th>
                                <th>Kontak / No. WA</th>
                                {isSuperadmin && <th className="text-center pe-3 pe-md-4">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperadmin ? 4 : 3} className="text-center py-4 text-muted">Belum ada data supplier.</td>
                                </tr>
                            ) : (
                                paginated.map((sup) => (
                                    <tr key={sup.id}>
                                        <td className="ps-3 ps-md-4 fw-bold">#{sup.id}</td>
                                        <td className="fw-semibold text-nowrap">{sup.name}</td>
                                        <td className="text-nowrap">{sup.contact || '-'}</td>
                                        {isSuperadmin && (
                                            <td className="text-center pe-3 pe-md-4 text-nowrap">
                                                <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onOpenEditSupplier(sup)}>
                                                    Edit
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => onDeleteSupplier(sup.id)}>
                                                    Hapus
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={suppliers.length}
                    itemsPerPage={rowsPerPage}
                />
            </Card>
        </Container>
    );
}