import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePickupPDF = (filteredPickups, filterSupplierName, startDate, endDate) => {
    if (filteredPickups.length === 0) return alert('Tidak ada data untuk dicetak.');

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REKAP PENGAMBILAN BARANG', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Aplikasi SiRekap - PerMaKo243', 14, 24);

    const supplierText = filterSupplierName || 'Semua Supplier';
    const periodeText = (startDate || endDate) ? `${startDate || 'Awal'} s/d ${endDate || 'Hari ini'}` : 'Semua Tanggal';

    doc.text(`Supplier : ${supplierText}`, 14, 32);
    doc.text(`Periode  : ${periodeText}`, 14, 38);

    const aggregated = {};
    let totalSeluruhPcs = 0;
    filteredPickups.forEach(pickup => {
        if (pickup.items) {
            pickup.items.forEach(item => {
                const name = item.product_name || item.name || 'Produk';
                const size = item.size || '-';
                const qtyVal = Number(item.qty || item.quantity || 0);
                const key = `${name}__${size}`;
                if (!aggregated[key]) aggregated[key] = { name, size, totalQty: 0 };
                aggregated[key].totalQty += qtyVal;
                totalSeluruhPcs += qtyVal;
            });
        }
    });

    const tableRows = Object.values(aggregated).map((item, index) => [index + 1, item.name, item.size, `${item.totalQty} pcs`]);
    autoTable(doc, {
        startY: 44,
        head: [['No', 'Nama Barang / Produk', 'Ukuran', 'Jumlah (Qty)']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Jumlah Seluruh Item yang Diambil: ${totalSeluruhPcs} pcs`, 14, doc.lastAutoTable.finalY + 8);
    doc.save(`Rekap_Barang_${supplierText}_${new Date().toISOString().split('T')[0]}.pdf`);
};