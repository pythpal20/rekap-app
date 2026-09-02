import React, { useState } from 'react';
import { Modal, Table, Button } from 'react-bootstrap';
import TablePagination from '../common/TablePagination';

export default function HistoryModal({ show, onHide, product, histories }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const paginated = histories.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(histories.length / rowsPerPage);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-6">Riwayat: {product?.name} ({product?.size})</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <Table responsive hover className="align-middle mb-0 small">
          <thead className="table-light">
            <tr><th className="ps-3">Waktu</th><th>Nama</th><th>Ukuran</th><th>Harga</th></tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-4 text-muted">Belum ada riwayat perubahan.</td></tr>
            ) : (
              paginated.map((h) => (
                <tr key={h.id}>
                  <td className="ps-3 text-muted">{new Date(h.changed_at).toLocaleString('id-ID')}</td>
                  <td>{h.old_name !== h.new_name ? <span><del className="text-danger">{h.old_name}</del> &rarr; <b className="text-success">{h.new_name}</b></span> : h.new_name}</td>
                  <td>{h.old_size !== h.new_size ? <span><del className="text-danger">{h.old_size}</del> &rarr; <b className="text-success">{h.new_size}</b></span> : h.new_size}</td>
                  <td>Rp {Number(h.new_price).toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={histories.length} itemsPerPage={rowsPerPage} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>Tutup</Button>
      </Modal.Footer>
    </Modal>
  );
}