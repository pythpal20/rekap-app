import React from 'react';
import { Modal, Form, Button, Alert, Card } from 'react-bootstrap';

export default function PaymentModal({ show, onHide, targetPickups, proofFile, setProofFile, onConfirm, loading }) {
    return (
        <Modal show={show} onHide={() => !loading && onHide()} size="lg" centered>
            <Modal.Header closeButton={!loading} className="bg-success text-white">
                <Modal.Title className="fw-bold fs-6">
                    <i className="bi bi-shield-check me-2"></i>Konfirmasi Pelunasan Tagihan ({targetPickups.length} Transaksi)
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={onConfirm}>
                <Modal.Body className="p-3 p-md-4">
                    <Alert variant="warning" className="small d-flex align-items-center gap-2 mb-3">
                        <i className="bi bi-exclamation-triangle-fill fs-5 text-warning flex-shrink-0"></i>
                        <div>Pastikan nominal transfer sesuai dengan total tagihan sebelum menandai status sebagai <strong>LUNAS</strong>.</div>
                    </Alert>

                    {targetPickups.length > 0 && (
                        <div className="mb-3">
                            <div className="text-muted small fw-bold text-uppercase mb-2">Rincian Transaksi Pengambilan:</div>
                            <div className="d-flex flex-column gap-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                {targetPickups.map((p) => (
                                    <Card key={p.id} className="border shadow-none bg-light">
                                        <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                                <div><span className="badge bg-secondary me-2">Nota #{p.id}</span><strong>{p.supplier_name}</strong></div>
                                                <span className="small text-muted"><i className="bi bi-calendar-event me-1"></i>{new Date(p.pickup_date).toLocaleDateString('id-ID')}</span>
                                            </div>
                                            <div className="ps-1">
                                                <div className="small text-muted mb-1 fw-semibold">Item Barang:</div>
                                                <div className="d-flex flex-column gap-1">
                                                    {p.items?.map((item, i) => (
                                                        <div key={i} className="d-flex justify-content-between small text-secondary">
                                                            <span>• <strong>{item.product_name}</strong> ({item.size}) &times; {item.qty || item.quantity} pcs</span>
                                                            <span className="text-nowrap">Rp {Number(item.subtotal || (item.qty * item.price)).toLocaleString('id-ID')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top small">
                                                <span className="fw-semibold text-dark">Subtotal Nota:</span>
                                                <strong className="text-dark">Rp {Number(p.total_amount).toLocaleString('id-ID')}</strong>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>

                            <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-10 border border-success rounded-3 p-3 mt-3">
                                <div>
                                    <div className="small text-muted fw-bold text-uppercase">Total Yang Harus Dibayar:</div>
                                    <small className="text-muted">Akumulasi seluruh transaksi terpilih</small>
                                </div>
                                <h4 className="fw-bold text-success mb-0">
                                    Rp {targetPickups.reduce((sum, p) => sum + Number(p.total_amount), 0).toLocaleString('id-ID')}
                                </h4>
                            </div>
                        </div>
                    )}

                    <Form.Group className="mb-2">
                        <Form.Label className="fw-semibold small">Upload Bukti Transfer / Pembayaran <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProofFile(e.target.files[0])} required />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" size="sm" disabled={loading} onClick={onHide}>Batal</Button>
                    <Button variant="success" size="sm" type="submit" className="fw-bold px-3" disabled={loading}>
                        {loading ? 'Menyimpan...' : '✓ Konfirmasi & Lunaskan'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}