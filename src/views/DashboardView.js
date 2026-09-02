import React, { useMemo } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, ProgressBar } from 'react-bootstrap';

export default function DashboardView({ currentUser, pickups = [], allProducts = [], suppliers = [], countBelumLunas = 0, onNavigate }) {
    const stats = useMemo(() => {
        let totalHutangVal = 0;
        let totalLunasVal = 0;
        let totalItemPcs = 0;
        const supplierSummary = {};
        const productSummary = {};
        const monthlySummary = {};

        pickups.forEach((p) => {
            const amount = Number(p.total_amount || 0);
            if (p.status === 'PAID') totalLunasVal += amount;
            else totalHutangVal += amount;

            const supName = p.supplier_name || 'Tanpa Supplier';
            if (!supplierSummary[supName]) supplierSummary[supName] = { name: supName, count: 0, total: 0 };
            supplierSummary[supName].count += 1;
            supplierSummary[supName].total += amount;

            if (p.pickup_date) {
                const d = new Date(p.pickup_date);
                const monthKey = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
                if (!monthlySummary[monthKey]) monthlySummary[monthKey] = { label: monthKey, total: 0, count: 0, timestamp: d.getTime() };
                monthlySummary[monthKey].total += amount;
                monthlySummary[monthKey].count += 1;
            }

            if (p.items && Array.isArray(p.items)) {
                p.items.forEach((item) => {
                    const q = Number(item.qty || item.quantity || 0);
                    totalItemPcs += q;
                    const prodKey = `${item.product_name} (${item.size})`;
                    if (!productSummary[prodKey]) productSummary[prodKey] = { name: item.product_name, size: item.size, qty: 0 };
                    productSummary[prodKey].qty += q;
                });
            }
        });

        const totalAkumulasi = totalHutangVal + totalLunasVal;
        const topProducts = Object.values(productSummary).sort((a, b) => b.qty - a.qty).slice(0, 5);
        const monthlyList = Object.values(monthlySummary).sort((a, b) => a.timestamp - b.timestamp).slice(-6);
        const maxMonthlyVal = Math.max(...monthlyList.map((m) => m.total), 1);

        return {
            totalHutangVal,
            totalLunasVal,
            totalAkumulasi,
            totalItemPcs,
            supplierList: Object.values(supplierSummary).sort((a, b) => b.total - a.total),
            topProducts,
            monthlyList,
            maxMonthlyVal
        };
    }, [pickups]);

    return (
        <Container fluid className="p-0">
            {/* Banner Selamat Datang */}
            <div className="bg-primary text-white rounded-4 p-4 mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
                <Row className="align-items-center">
                    <Col md={8}>
                        <h4 className="fw-bold mb-1">Selamat Datang, {currentUser.name}! 👋</h4>
                        <p className="mb-0 text-white-50 small">Ikhtisar ringkasan stok busana, status pelunasan hutang, dan grafik aktivitas toko Anda.</p>
                    </Col>
                    <Col md={4} className="text-md-end mt-3 mt-md-0">
                        <span className="badge bg-white text-dark py-2 px-3 fw-bold shadow-sm">
                            Role: {currentUser.role.toUpperCase()}
                        </span>
                    </Col>
                </Row>
            </div>

            {/* KPI Stat Cards */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 border-start border-danger border-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Total Belum Lunas</div>
                                <h4 className="text-danger fw-bold mt-1 mb-0">Rp {stats.totalHutangVal.toLocaleString('id-ID')}</h4>
                                <small className="text-muted">{countBelumLunas} transaksi belum lunas</small>
                            </div>
                            <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle"><i className="bi bi-cash-stack fs-4"></i></div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 border-start border-success border-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Total Pembelian Lunas</div>
                                <h4 className="text-success fw-bold mt-1 mb-0">Rp {stats.totalLunasVal.toLocaleString('id-ID')}</h4>
                                <small className="text-muted">{pickups.length - countBelumLunas} transaksi lunas</small>
                            </div>
                            <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle"><i className="bi bi-check-circle-fill fs-4"></i></div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 border-start border-primary border-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Total Barang Diambil</div>
                                <h4 className="text-primary fw-bold mt-1 mb-0">{stats.totalItemPcs} pcs</h4>
                                <small className="text-muted">Dari seluruh transaksi</small>
                            </div>
                            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle"><i className="bi bi-box-seam fs-4"></i></div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 border-start border-warning border-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Master Katalog</div>
                                <h4 className="text-warning fw-bold mt-1 mb-0">{allProducts.length} Produk</h4>
                                <small className="text-muted">{suppliers.length} Supplier aktif</small>
                            </div>
                            <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle"><i className="bi bi-tags-fill fs-4"></i></div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Visualisasi Grafik */}
            <Row className="g-3 mb-4">
                <Col xs={12} lg={7}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0"><i className="bi bi-bar-chart-fill text-primary me-2"></i>Tren Pengambilan Barang</h6>
                            <Badge bg="light" text="dark" className="border">Nilai (Rp)</Badge>
                        </Card.Header>
                        <Card.Body className="p-4 d-flex flex-column justify-content-between">
                            {stats.monthlyList.length === 0 ? (
                                <div className="text-center py-5 text-muted">Belum ada riwayat bulanan.</div>
                            ) : (
                                <div className="d-flex align-items-end justify-content-around h-100 gap-2 pt-4" style={{ minHeight: '220px' }}>
                                    {stats.monthlyList.map((m, idx) => {
                                        const barHeight = Math.max(Math.round((m.total / stats.maxMonthlyVal) * 100), 8);
                                        return (
                                            <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ maxWidth: '70px' }}>
                                                <small className="text-muted fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Rp {(m.total / 1000).toFixed(0)}k</small>
                                                <div className="w-100 bg-light rounded-top position-relative" style={{ height: '150px' }}>
                                                    <div className="w-100 bg-primary rounded-top position-absolute bottom-0" style={{ height: `${barHeight}%`, background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' }} />
                                                </div>
                                                <span className="small fw-semibold text-dark mt-2" style={{ fontSize: '0.75rem' }}>{m.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} lg={5}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-white py-3 border-bottom">
                            <h6 className="fw-bold mb-0"><i className="bi bi-pie-chart-fill text-success me-2"></i>Komposisi Tagihan per Supplier</h6>
                        </Card.Header>
                        <Card.Body className="p-3 overflow-auto" style={{ maxHeight: '290px' }}>
                            {stats.supplierList.length === 0 ? (
                                <div className="text-center py-4 text-muted">Belum ada data supplier.</div>
                            ) : (
                                stats.supplierList.map((s, idx) => {
                                    const percent = stats.totalAkumulasi > 0 ? Math.round((s.total / stats.totalAkumulasi) * 100) : 0;
                                    return (
                                        <div key={idx} className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center small mb-1">
                                                <span className="fw-bold text-dark">{s.name} ({s.count}x)</span>
                                                <span className="text-muted">Rp {s.total.toLocaleString('id-ID')} ({percent}%)</span>
                                            </div>
                                            <ProgressBar now={percent} variant={idx % 2 === 0 ? 'success' : 'info'} style={{ height: '8px' }} />
                                        </div>
                                    );
                                })
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Baris Ringkasan Top 5 Produk & 5 Transaksi Terakhir */}
            <Row className="g-3">
                <Col xs={12} md={5}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-white py-3 border-bottom">
                            <h6 className="fw-bold mb-0"><i className="bi bi-trophy-fill text-warning me-2"></i>Top 5 Produk Terbanyak Diambil</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="align-middle mb-0 small">
                                <thead className="table-light">
                                    <tr><th className="ps-3">Produk</th><th>Ukuran</th><th className="text-end pe-3">Jumlah</th></tr>
                                </thead>
                                <tbody>
                                    {stats.topProducts.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-3 text-muted">Belum ada barang diambil.</td></tr>
                                    ) : (
                                        stats.topProducts.map((tp, i) => (
                                            <tr key={i}>
                                                <td className="ps-3 fw-semibold text-truncate" style={{ maxWidth: '140px' }}>{tp.name}</td>
                                                <td><Badge bg="secondary">{tp.size}</Badge></td>
                                                <td className="text-end pe-3 fw-bold text-primary">{tp.qty} pcs</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={7}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0"><i className="bi bi-clock-history text-info me-2"></i>5 Transaksi Terakhir</h6>
                            <Button variant="link" size="sm" className="p-0 text-decoration-none fw-semibold" onClick={() => onNavigate('rekap-riwayat')}>
                                Buka Menu Riwayat &rarr;
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="align-middle mb-0 small">
                                <thead className="table-light">
                                    <tr><th className="ps-3">Tanggal</th><th>Supplier</th><th>Total Tagihan</th><th className="text-center pe-3">Status</th></tr>
                                </thead>
                                <tbody>
                                    {pickups.slice(0, 5).map((p) => (
                                        <tr key={p.id}>
                                            <td className="ps-3 text-nowrap">{new Date(p.pickup_date).toLocaleDateString('id-ID')}</td>
                                            <td className="fw-semibold text-nowrap">{p.supplier_name}</td>
                                            <td className="fw-bold text-nowrap">Rp {Number(p.total_amount).toLocaleString('id-ID')}</td>
                                            <td className="text-center pe-3">
                                                <Badge bg={p.status === 'PAID' ? 'success' : 'danger'}>{p.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}