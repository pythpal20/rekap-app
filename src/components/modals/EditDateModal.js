import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default function EditDateModal({ show, onHide, pickup, newDate, setNewDate, onSave, loading }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave();
    };

    return (
        <Modal show={show} onHide={() => !loading && onHide()} centered size="sm">
            <Modal.Header closeButton={!loading}>
                <Modal.Title className="fw-bold fs-6">
                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                    Edit Tanggal Nota #{pickup?.id}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="small text-muted mb-2">
                        Supplier: <strong>{pickup?.supplier_name}</strong>
                    </div>
                    <Form.Group>
                        <Form.Label className="small fw-semibold">Tanggal Pengambilan Baru</Form.Label>
                        <Form.Control
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="bg-light p-2">
                    <Button variant="secondary" size="sm" disabled={loading} onClick={onHide}>
                        Batal
                    </Button>
                    <Button variant="primary" size="sm" type="submit" className="fw-bold" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan Tanggal'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}