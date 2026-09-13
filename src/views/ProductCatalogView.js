import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, InputGroup } from 'react-bootstrap';
import TablePagination from '../components/common/TablePagination';

// Palet warna kontras & elegan untuk membedakan badge ukuran tiap supplier
const SUPPLIER_COLOR_PALETTES = [
    { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' }, // Sky Blue
    { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' }, // Amber
    { bg: '#dcfce7', text: '#15803d', border: '#86efac' }, // Emerald / Green
    { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' }, // Purple
    { bg: '#ffe4e6', text: '#be123c', border: '#fda4af' }, // Rose / Pink
    { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' }, // Orange
    { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' }, // Teal
    { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' }, // Violet
    { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' }, // Slate
];

// Helper untuk memilih warna konsisten berdasarkan ID supplier
const getSupplierBadgeStyle = (supplierId) => {
    const idNum = Number(supplierId) || 0;
    const color = SUPPLIER_COLOR_PALETTES[idNum % SUPPLIER_COLOR_PALETTES.length];
    return {
        backgroundColor: color.bg,
        color: color.text,
        borderColor: color.border,
        borderWidth: '1px',
        borderStyle: 'solid'
    };
};

export default function ProductCatalogView({
    allProducts = [],
    suppliers = [],
    isSuperadmin,
    onOpenAddProduct,
    onOpenEditProduct,
    onDeleteProduct,
    onViewHistory
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Filter Data Barang
    const filtered = allProducts.filter((prod) => {
        const q = searchQuery.toLowerCase();
        const matchSearch = (prod.name || '').toLowerCase().includes(q) || (prod.size || '').toLowerCase().includes(q);
        const matchSup = filterSupplier === '' || String(prod.supplier_id) === String(filterSupplier);
        return matchSearch && matchSup;
    });

    // Pagination Slice
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

            {/* Toolbar Filter */}
            <Card className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Body className="p-3">
                    <Row className="g-2 align-items-center">
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

                        <Col xs={5} md={3}>
                            <div className="d-flex align-items-center justify-content-end gap-1">
                                <span className="small text-muted text-nowrap" style={{ fontSize: '0.78rem' }}>Tampil:</span>
                                <Form.Select
                                    size="sm"
                                    style={{ width: 'auto', minWidth: '75px' }}
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
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
                                        
                                        {/* KOLOM UKURAN DENGAN WARNA BERDASARKAN SUPPLIER */}
                                        <td>
                                            <span 
                                                className="badge px-2 py-1 fw-bold shadow-sm" 
                                                style={getSupplierBadgeStyle(prod.supplier_id)}
                                                title={`Ukuran dari ${prod.supplier_name || 'Supplier'}`}
                                            >
                                                {prod.size || '-'}
                                            </span>
                                        </td>

                                        <td>
                                            <Badge bg="light" text="dark" className="border">
                                                <i className="bi bi-building me-1 text-secondary"></i>
                                                {prod.supplier_name}
                                            </Badge>
                                        </td>
                                        <td className="fw-bold text-nowrap text-primary">
                                            Rp {Number(prod.buy_price || 0).toLocaleString('id-ID')}
                                        </td>
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