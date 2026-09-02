import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import TablePagination from '../components/common/TablePagination';
import { FILE_BASE } from '../api/axiosConfig';
import { generatePickupPDF } from '../utils/pdfGenerator';
import { generatePickupExcel } from '../utils/excelGenerator';

export default function HistoryPickupView({
    pickups = [],
    suppliers = [],
    isSuperadmin = false,
    isAdmin = false,
    totalHutang = 0,
    onOpenSinglePay,
    onOpenBatchPay,
    onUnpay,
    onOpenEditDate,
    selectedPickupIds = [],
    setSelectedPickupIds
}) {
    const [filterSupplier, setFilterSupplier] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const canEditDate = isSuperadmin || isAdmin;

    // Helper konversi tanggal lokal aman (YYYY-MM-DD)
    const formatLocalDateString = (rawDate) => {
        if (!rawDate) return '';
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Filter Data Transaksi
    const filtered = pickups.filter((p) => {
        const matchSupplier = !filterSupplier || String(p.supplier_id) === String(filterSupplier);
        const matchStatus = !filterStatus || p.status === filterStatus;
        const itemDate = formatLocalDateString(p.pickup_date);
        const matchStart = !filterStartDate || itemDate >= filterStartDate;
        const matchEnd = !filterEndDate || itemDate <= filterEndDate;
        return matchSupplier && matchStatus && matchStart && matchEnd;
    });

    const totalFilteredNominal = filtered.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    const unpaidInTable = filtered.filter((p) => p.status === 'UNPAID');

    const handleToggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPickupIds(unpaidInTable.map((p) => p.id));
        } else {
            setSelectedPickupIds([]);
        }
    };

    const handleToggleOne = (id) => {
        if (selectedPickupIds.includes(id)) {
            setSelectedPickupIds(selectedPickupIds.filter((i) => i !== id));
        } else {
            setSelectedPickupIds([...selectedPickupIds, id]);
        }
    };

    const handleResetFilter = () => {
        setFilterSupplier('');
        setFilterStatus('');
        setFilterStartDate('');
        setFilterEndDate('');
        setCurrentPage(1);
    };

    const handlePDF = () => {
        const supObj = suppliers.find((s) => String(s.id) === String(filterSupplier));
        generatePickupPDF(filtered, supObj?.name, filterStartDate, filterEndDate);
    };

    const handleExcel = () => {
        const supObj = suppliers.find((s) => String(s.id) === String(filterSupplier));
        generatePickupExcel(filtered, supObj?.name, filterStartDate, filterEndDate);
    };

    return (
        <Container fluid className="p-0">
            {/* KPI Ringkasan Hutang & Transaksi */}
            <Row className="mb-4 g-3">
                <Col xs={12} sm={6}>
                    <Card className="border-0 shadow-sm rounded-4 border-start border-danger border-4">
                        <Card.Body className="p-3">
                            <div className="text-muted small fw-bold text-uppercase">Total Hutang</div>
                            <h4 className="text-danger fw-bold mt-1 mb-0">
                                Rp {Number(totalHutang || 0).toLocaleString('id-ID')}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="border-0 shadow-sm rounded-4 border-start border-primary border-4">
                        <Card.Body className="p-3">
                            <div className="text-muted small fw-bold text-uppercase">Total Riwayat</div>
                            <h4 className="text-primary fw-bold mt-1 mb-0">{pickups.length} Transaksi</h4>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Tabel Rekapitulasi & Pembayaran</h6>
                    <Badge bg="dark">Terfilter: Rp {totalFilteredNominal.toLocaleString('id-ID')}</Badge>
                </Card.Header>

                {/* Toolbar Filter, Download PDF, Download Excel, dan Reset Filter */}
                <div className="p-3 bg-light border-bottom">
                    <Row className="g-2 align-items-end">
                        <Col xs={12} sm={6} lg={3}>
                            <Form.Label className="mb-1 small fw-bold">Supplier:</Form.Label>
                            <Form.Select
                                size="sm"
                                value={filterSupplier}
                                onChange={(e) => { setFilterSupplier(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">-- Semua Supplier --</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col xs={6} sm={6} lg={2}>
                            <Form.Label className="mb-1 small fw-bold">Status:</Form.Label>
                            <Form.Select
                                size="sm"
                                value={filterStatus}
                                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">-- Semua Status --</option>
                                <option value="UNPAID">Belum Dibayar</option>
                                <option value="PAID">Lunas</option>
                            </Form.Select>
                        </Col>
                        <Col xs={6} sm={6} lg={2}>
                            <Form.Label className="mb-1 small fw-bold">Dari Tanggal:</Form.Label>
                            <Form.Control
                                type="date"
                                size="sm"
                                value={filterStartDate}
                                onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
                            />
                        </Col>
                        <Col xs={6} sm={6} lg={2}>
                            <Form.Label className="mb-1 small fw-bold">Sampai Tanggal:</Form.Label>
                            <Form.Control
                                type="date"
                                size="sm"
                                value={filterEndDate}
                                onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
                            />
                        </Col>
                        <Col xs={12} lg={3}>
                            <div className="d-flex gap-2">
                                {/* Tombol PDF */}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="fw-bold d-flex align-items-center justify-content-center gap-1 w-50 shadow-sm"
                                    onClick={handlePDF}
                                    title="Download Rekap PDF"
                                >
                                    <i className="bi bi-file-earmark-pdf-fill"></i> PDF
                                </Button>

                                {/* Tombol Excel */}
                                <Button
                                    variant="success"
                                    size="sm"
                                    className="fw-bold d-flex align-items-center justify-content-center gap-1 w-50 shadow-sm"
                                    onClick={handleExcel}
                                    title="Download Rekap Excel"
                                >
                                    <i className="bi bi-file-earmark-excel-fill"></i> Excel
                                </Button>

                                {/* Tombol Reset */}
                                {(filterSupplier || filterStatus || filterStartDate || filterEndDate) && (
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="d-flex align-items-center justify-content-center px-3"
                                        onClick={handleResetFilter}
                                        title="Reset Filter"
                                    >
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Action Bar Batch Pay */}
                {isSuperadmin && selectedPickupIds.length > 0 && (
                    <div className="bg-success bg-opacity-10 border-bottom p-3 d-flex justify-content-between align-items-center">
                        <div className="text-success fw-bold small">
                            {selectedPickupIds.length} transaksi dipilih
                        </div>
                        <Button variant="success" size="sm" className="fw-bold shadow-sm" onClick={onOpenBatchPay}>
                            ✓ Lunaskan Sekaligus ({selectedPickupIds.length})
                        </Button>
                    </div>
                )}

                {/* Tabel Data */}
                <Card.Body className="p-0">
                    <Table responsive hover className="align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                {isSuperadmin && (
                                    <th className="ps-3 ps-md-4" style={{ width: '40px' }}>
                                        <Form.Check
                                            type="checkbox"
                                            checked={unpaidInTable.length > 0 && selectedPickupIds.length === unpaidInTable.length}
                                            onChange={handleToggleSelectAll}
                                            disabled={unpaidInTable.length === 0}
                                        />
                                    </th>
                                )}
                                <th>Tanggal</th>
                                <th>Supplier</th>
                                <th>Rincian Barang</th>
                                <th>Total Tagihan</th>
                                <th>Status</th>
                                {isSuperadmin && <th className="text-center pe-3 pe-md-4">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperadmin ? 7 : 6} className="text-center py-5 text-muted">
                                        Tidak ada data pengambilan yang sesuai dengan filter.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((p) => (
                                    <tr key={p.id}>
                                        {isSuperadmin && (
                                            <td className="ps-3 ps-md-4">
                                                {p.status === 'UNPAID' && (
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={selectedPickupIds.includes(p.id)}
                                                        onChange={() => handleToggleOne(p.id)}
                                                    />
                                                )}
                                            </td>
                                        )}
                                        <td className="text-nowrap">
                                            <div className="d-flex align-items-center gap-2">
                                                <span>
                                                    {new Date(p.pickup_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                {canEditDate && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 text-secondary text-decoration-none"
                                                        onClick={() => onOpenEditDate(p)}
                                                        title="Edit Tanggal Pengambilan"
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="fw-semibold text-nowrap">{p.supplier_name}</td>
                                        <td>
                                            <div className="d-flex flex-column gap-1 py-1" style={{ minWidth: '200px' }}>
                                                {p.items?.map((item, i) => (
                                                    <span key={i} className="small">
                                                        • <strong>{item.product_name}</strong> ({item.size}) - {item.qty || item.quantity} pcs &times; Rp {Number(item.price || item.price_at_pickup || 0).toLocaleString('id-ID')}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="fw-bold text-nowrap">
                                            Rp {Number(p.total_amount || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td>
                                            <Badge bg={p.status === 'PAID' ? 'success' : 'danger'}>
                                                {p.status === 'PAID' ? '✓ LUNAS' : '✕ BELUM DIBAYAR'}
                                            </Badge>
                                            {p.payment_proof && (
                                                <div>
                                                    <a
                                                        href={`${FILE_BASE}/${p.payment_proof}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="small text-primary text-nowrap text-decoration-none"
                                                    >
                                                        <i className="bi bi-paperclip"></i> Bukti Bayar
                                                    </a>
                                                </div>
                                            )}
                                        </td>
                                        {isSuperadmin && (
                                            <td className="text-center pe-3 pe-md-4 text-nowrap">
                                                {p.status === 'PAID' ? (
                                                    <Button size="sm" variant="outline-secondary" onClick={() => onUnpay(p.id)}>
                                                        Belum Lunas
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="success" className="fw-bold" onClick={() => onOpenSinglePay(p)}>
                                                        ✓ Lunaskan
                                                    </Button>
                                                )}
                                            </td>
                                        )}
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