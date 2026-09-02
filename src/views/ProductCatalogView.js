import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, InputGroup } from 'react-bootstrap';
import TablePagination from '../components/common/TablePagination';

export default function ProductCatalogView({
    allProducts,
    suppliers,
    isSuperadmin,
    onOpenAddProduct,
    onOpenEditProduct,
    onDeleteProduct,
    onViewHistory
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5); // Pilihan baris dinamis

    // Filter Data Barang
    const filtered = allProducts.filter((prod) => {
        const q = searchQuery.toLowerCase();
        const matchSearch = prod.name.toLowerCase().includes(q) || prod.size.toLowerCase().includes(q);
        const matchSup = filterSupplier === '' || prod.supplier_id === parseInt(filterSupplier);
        return matchSearch && matchSup;
    });

    // Pagination Slice berdasarkan rowsPerPage yang dipilih
    const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    return (
        <Container fluid className="p-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Katalog Data Barang</h5>
                {isSuperadmin && (
                    <Button variant="primary" className="fw-bold" onClick={onOpenAddProduct}>
                        + Tambah Barang
                    </Button>
                )}
            </div>

            {/* Toolbar Filter & Pengaturan Limit Baris */}
            <Card className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Body className="p-3">
                    <Row className="g-2 align-items-center">
                        {/* 1. Input Pencarian */}
                        <Col xs={12} md={5}>
                            <InputGroup size="sm">
                                <InputGroup.Text className="bg-light"><i className="bi bi-search"></i></InputGroup.Text>
                                <Form.Control
                                    placeholder="Cari nama atau ukuran..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                />
                                {searchQuery && (
                                    <Button variant="outline-secondary" onClick={() => { setSearchQuery(''); setCurrentPage(1); }}>
                                        Reset
                                    </Button>
                                )}
                            </InputGroup>
                        </Col>

                        {/* 2. Filter Supplier */}
                        <Col xs={7} md={4}>
                            <Form.Select
                                size="sm"
                                value={filterSupplier}
                                onChange={(e) => { setFilterSupplier(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">-- Semua Supplier --</option>
                                {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                            </Form.Select>
                        </Col>

                        {/* 3. Pilihan Tampilan Baris (5, 10, 15, 20, 50, 100) */}
                        <Col xs={5} md={3}>
                            <div className="d-flex align-items-center justify-content-end gap-1">
                                <span className="small text-muted text-nowrap" style={{ fontSize: '0.78rem' }}>Tampil:</span>
                                <Form.Select
                                    size="sm"
                                    style={{ width: 'auto', minWidth: '75px' }}
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Reset ke halaman pertama saat jumlah baris diubah
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </Form.Select>
                                <span className="small text-muted" style={{ fontSize: '0.78rem' }}>baris</span>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabel Data Barang */}
            <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <span className="fw-semibold small">Daftar Barang</span>
                    <Badge bg="secondary">
                        {filtered.length} total barang ({rowsPerPage} baris/halaman)
                    </Badge>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3 ps-md-4">ID</th>
                                <th>Nama Barang</th>
                                <th>Ukuran</th>
                                <th>Supplier</th>
                                <th>Harga Modal</th>
                                <th className="text-center pe-3 pe-md-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">Data barang tidak ditemukan.</td>
                                </tr>
                            ) : (
                                paginated.map((prod) => (
                                    <tr key={prod.id}>
                                        <td className="ps-3 ps-md-4 fw-bold">#{prod.id}</td>
                                        <td className="fw-semibold text-nowrap">{prod.name}</td>
                                        <td><Badge bg="secondary">{prod.size}</Badge></td>
                                        <td><Badge bg="light" text="dark" className="border">{prod.supplier_name}</Badge></td>
                                        <td className="fw-bold text-nowrap">Rp {Number(prod.buy_price).toLocaleString('id-ID')}</td>
                                        <td className="text-center pe-3 pe-md-4 text-nowrap">
                                            <Button variant="outline-info" size="sm" className="me-1" onClick={() => onViewHistory(prod)} title="Lihat Riwayat Perubahan">
                                                <i className="bi bi-clock-history"></i>
                                            </Button>
                                            {isSuperadmin && (
                                                <>
                                                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onOpenEditProduct(prod)}>
                                                        Edit
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => onDeleteProduct(prod.id)}>
                                                        Hapus
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination Dinamis */}
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filtered.length}
                    itemsPerPage={rowsPerPage}
                />
            </Card>
        </Container>
    );
}