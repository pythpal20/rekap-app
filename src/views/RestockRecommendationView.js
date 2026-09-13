import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Card, Table, Form, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import Select from 'react-select';

export default function RestockRecommendationView({ suppliers = [], currentUser }) {
    const isSupplier = currentUser?.role === 'supplier';
    const [budgetInput, setBudgetInput] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('all');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [result, setResult] = useState(null);

    // State untuk Select2 (Filter Nama Artikel)
    const [selectedArticleOption, setSelectedArticleOption] = useState(null);

    const handleCalculate = async (e) => {
        e?.preventDefault();
        const cleanBudget = Number(budgetInput.toString().replace(/[^0-9]/g, ''));
        if (!cleanBudget || cleanBudget <= 0) {
            setErrorMsg('Masukkan nominal modal belanja yang valid!');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const token = localStorage.getItem('token');
            const params = { budget: cleanBudget };
            if (!isSupplier && selectedSupplier !== 'all') {
                params.supplier_id = selectedSupplier;
            }

            const res = await axios.get('http://localhost:5001/api/recommendations/restock', {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });

            setResult(res.data);
            setSelectedArticleOption(null); // Reset filter saat kalkulasi ulang
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Gagal menghitung rekomendasi');
        } finally {
            setLoading(false);
        }
    };

    // Buat daftar opsi unik untuk Select2 (Autocomplete Nama Artikel)
    const articleOptions = useMemo(() => {
        if (!result?.recommendations) return [];

        // Ambil nama artikel unik
        const uniqueNames = Array.from(
            new Set(result.recommendations.map((r) => r.product_name))
        ).sort();

        return uniqueNames.map((name) => ({
            value: name,
            label: name
        }));
    }, [result]);

    // Filter rekomendasi berdasarkan pilihan Select2
    const displayedRecommendations = useMemo(() => {
        if (!result?.recommendations) return [];
        if (!selectedArticleOption) return result.recommendations;

        return result.recommendations.filter(
            (item) => item.product_name === selectedArticleOption.value
        );
    }, [result, selectedArticleOption]);

    // Perhitungan total dinamis sesuai filter yang dipilih
    const dynamicTotalQty = useMemo(() => {
        return displayedRecommendations.reduce((sum, item) => sum + (item.recommended_qty || 0), 0);
    }, [displayedRecommendations]);

    const dynamicSubtotalBudget = useMemo(() => {
        return displayedRecommendations.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    }, [displayedRecommendations]);

    // Export ke Excel (.xlsx)
    const handleExportExcel = () => {
        if (!displayedRecommendations.length) {
            alert('Tidak ada data rekomendasi yang dapat diekspor!');
            return;
        }

        const excelRows = displayedRecommendations.map((rec, index) => ({
            No: index + 1,
            'Nama Artikel': rec.product_name,
            'Ukuran / Seri': rec.size || 'All Size',
            'Nama Supplier': rec.supplier_name,
            'Harga Beli (Rp)': rec.buy_price,
            'Riwayat Ambil (1 Thn)': rec.annual_history_qty,
            'Rasio Permintaan (%)': `${rec.demand_share_pct}%`,
            'Rekomendasi Pesan (Pcs)': rec.recommended_qty,
            'Subtotal Biaya (Rp)': rec.subtotal
        }));

        // Baris Total
        excelRows.push({
            No: '',
            'Nama Artikel': 'TOTAL ALOKASI',
            'Ukuran / Seri': '',
            'Nama Supplier': '',
            'Harga Beli (Rp)': '',
            'Riwayat Ambil (1 Thn)': '',
            'Rasio Permintaan (%)': '',
            'Rekomendasi Pesan (Pcs)': dynamicTotalQty,
            'Subtotal Biaya (Rp)': dynamicSubtotalBudget
        });

        const worksheet = XLSX.utils.json_to_sheet(excelRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekomendasi Restock');

        worksheet['!cols'] = [
            { wch: 6 },
            { wch: 30 },
            { wch: 15 },
            { wch: 22 },
            { wch: 18 },
            { wch: 22 },
            { wch: 20 },
            { wch: 24 },
            { wch: 20 }
        ];

        const dateStr = new Date().toISOString().slice(0, 10);
        const filterSuffix = selectedArticleOption
            ? `_artikel-${selectedArticleOption.value.replace(/\s+/g, '_')}`
            : '_semua';
        const fileName = `Rekomendasi_Restock_${dateStr}${filterSuffix}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    // Kustomisasi style Select2 agar senada dengan Bootstrap
    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '38px',
            borderRadius: '0.375rem',
            borderColor: '#dee2e6',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#86b7fe'
            }
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999
        })
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                <div>
                    <h4 className="fw-bold mb-1">
                        <i className="bi bi-calculator-fill text-primary me-2"></i>
                        Rekomendasi Restock Modal
                    </h4>
                    <p className="text-muted small mb-0">
                        Kalkulasi kuantitas pemesanan barang per ukuran berdasarkan rotasi pengambilan 1 tahun terakhir.
                    </p>
                </div>
            </div>

            {/* Form Input Modal */}
            <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Body className="p-3 p-md-4">
                    <Form onSubmit={handleCalculate}>
                        <Row className="g-3 align-items-end">
                            <Col md={5}>
                                <Form.Label className="small fw-bold">Nominal Modal Belanja (Rp)</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light fw-bold">Rp</span>
                                    <Form.Control
                                        type="text"
                                        className="form-control-lg fw-bold text-primary"
                                        placeholder="Contoh: 50000000"
                                        value={budgetInput ? Number(budgetInput.replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                                        onChange={(e) => setBudgetInput(e.target.value.replace(/[^0-9]/g, ''))}
                                        required
                                    />
                                </div>
                            </Col>

                            {!isSupplier && (
                                <Col md={4}>
                                    <Form.Label className="small fw-bold">Filter Khusus Supplier</Form.Label>
                                    <Form.Select
                                        className="form-select-lg"
                                        value={selectedSupplier}
                                        onChange={(e) => setSelectedSupplier(e.target.value)}
                                    >
                                        <option value="all">Semua Supplier (Global)</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            )}

                            <Col md={isSupplier ? 7 : 3}>
                                <Button variant="primary" type="submit" className="w-100 py-2 fw-bold" disabled={loading}>
                                    {loading ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <>
                                            <i className="bi bi-lightning-charge-fill me-1"></i> Hitung Alokasi
                                        </>
                                    )}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {errorMsg && <Alert variant="danger" dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

            {result && (
                <>
                    {/* Summary Cards */}
                    <Row className="g-3 mb-4">
                        <Col sm={6} md={3}>
                            <Card className="border-0 shadow-sm bg-primary text-white p-3 rounded-3">
                                <small className="text-white-50">Total Modal Diinput</small>
                                <h5 className="fw-bold mb-0 mt-1">Rp {Number(result.total_budget).toLocaleString('id-ID')}</h5>
                            </Card>
                        </Col>
                        <Col sm={6} md={3}>
                            <Card className="border-0 shadow-sm bg-success text-white p-3 rounded-3">
                                <small className="text-white-50">Modal Teralokasi</small>
                                <h5 className="fw-bold mb-0 mt-1">Rp {Number(result.allocated_budget).toLocaleString('id-ID')}</h5>
                            </Card>
                        </Col>
                        <Col sm={6} md={3}>
                            <Card className="border-0 shadow-sm bg-warning text-dark p-3 rounded-3">
                                <small className="text-muted">Sisa Modal Belanja</small>
                                <h5 className="fw-bold mb-0 mt-1">Rp {Number(result.remaining_budget).toLocaleString('id-ID')}</h5>
                            </Card>
                        </Col>
                        <Col sm={6} md={3}>
                            <Card className="border-0 shadow-sm bg-dark text-white p-3 rounded-3">
                                <small className="text-white-50">Total Barang Dipesan</small>
                                <h5 className="fw-bold mb-0 mt-1">{Number(result.total_items_to_buy).toLocaleString('id-ID')} Pcs</h5>
                            </Card>
                        </Col>
                    </Row>

                    {/* Tabel Rekomendasi Restock dengan Filter Select2 & Export Excel */}
                    <Card className="border-0 shadow-sm rounded-3">
                        <Card.Header className="bg-white py-3 border-0">
                            <Row className="g-2 align-items-center justify-content-between">
                                {/* Searchable Select (Select2) */}
                                <Col xs={12} md={6}>
                                    <Select
                                        options={articleOptions}
                                        value={selectedArticleOption}
                                        onChange={(option) => setSelectedArticleOption(option)}
                                        isClearable
                                        placeholder="-- Ketik / Pilih Nama Artikel --"
                                        styles={customSelectStyles}
                                        noOptionsMessage={() => 'Artikel tidak ditemukan'}
                                    />
                                </Col>

                                <Col xs={12} md="auto" className="d-flex align-items-center gap-2">
                                    <Badge bg="secondary" className="px-2 py-2">
                                        {displayedRecommendations.length} dari {result.recommendations.length} barang
                                    </Badge>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        className="fw-bold d-flex align-items-center gap-1 shadow-sm"
                                        onClick={handleExportExcel}
                                    >
                                        <i className="bi bi-file-earmark-excel-fill"></i>
                                        <span>Export ke Excel</span>
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Header>

                        <div className="table-responsive">
                            <Table hover align="middle" className="mb-0">
                                <thead className="table-light text-secondary small text-uppercase">
                                    <tr>
                                        <th className="text-center" style={{ width: '50px' }}>No</th>
                                        <th>Nama Artikel</th>
                                        <th>Ukuran</th>
                                        <th>Supplier</th>
                                        <th className="text-end">Harga Beli</th>
                                        <th className="text-center">Riwayat 1 Thn</th>
                                        <th className="text-center bg-primary-subtle text-primary">Rekomendasi Qty</th>
                                        <th className="text-end">Subtotal Biaya</th>
                                    </tr>
                                </thead>
                                <tbody className="small">
                                    {displayedRecommendations.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4 text-muted">
                                                Tidak ada artikel yang cocok dengan pilihan yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedRecommendations.map((rec, idx) => (
                                            <tr key={rec.product_id}>
                                                <td className="text-center text-muted">{idx + 1}</td>
                                                <td className="fw-bold text-dark">{rec.product_name}</td>
                                                <td>
                                                    <Badge bg="light" text="dark" className="border">
                                                        {rec.size || 'All Size'}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <span className="badge bg-secondary-subtle text-secondary border">
                                                        {rec.supplier_name}
                                                    </span>
                                                </td>
                                                <td className="text-end">Rp {Number(rec.buy_price).toLocaleString('id-ID')}</td>
                                                <td className="text-center text-muted">
                                                    {rec.annual_history_qty} pcs <small className="text-muted">({rec.demand_share_pct}%)</small>
                                                </td>
                                                <td className="text-center bg-primary-subtle fw-bold text-primary fs-6">
                                                    {rec.recommended_qty} pcs
                                                </td>
                                                <td className="text-end fw-bold text-dark">
                                                    Rp {Number(rec.subtotal).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {displayedRecommendations.length > 0 && (
                                    <tfoot className="table-light fw-bold small">
                                        <tr>
                                            <td colSpan="6" className="text-end text-uppercase">Total Terpilih:</td>
                                            <td className="text-center text-primary fs-6">{dynamicTotalQty} pcs</td>
                                            <td className="text-end text-dark fs-6">Rp {dynamicSubtotalBudget.toLocaleString('id-ID')}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </Table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}