import * as XLSX from 'xlsx';

export const generatePickupExcel = (filteredPickups, filterSupplierName, startDate, endDate) => {
    if (!filteredPickups || filteredPickups.length === 0) {
        alert('Tidak ada data pengambilan untuk di-export ke Excel.');
        return;
    }

    const supplierText = filterSupplierName || 'Semua Supplier';
    const periodeText = (startDate || endDate)
        ? `${startDate || 'Awal'} s/d ${endDate || 'Hari ini'}`
        : 'Semua Tanggal';

    // 1. Baris Judul & Metadata Laporan
    const sheetData = [
        ['REKAP PENGAMBILAN BARANG - INSPIRESHOPI'],
        [`Supplier: ${supplierText}`],
        [`Periode: ${periodeText}`],
        [], // Baris kosong pemisah
        // Header Tabel Utama
        ['No', 'Tanggal Pengambilan', 'Nama Produk', 'Ukuran', 'Qty (Pcs)', 'Harga/Pcs (Rp)', 'Total Harga (Rp)']
    ];

    let totalQty = 0;
    let grandTotal = 0;
    let no = 1;

    // 2. Iterasi Data Pengambilan (Detail per item barang)
    filteredPickups.forEach((pickup) => {
        const pickupDateStr = new Date(pickup.pickup_date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        if (pickup.items && pickup.items.length > 0) {
            pickup.items.forEach((item) => {
                const qtyVal = Number(item.qty || item.quantity || 0);
                const priceVal = Number(item.price || item.price_at_pickup || 0);
                const subtotalVal = Number(item.subtotal || qtyVal * priceVal);

                totalQty += qtyVal;
                grandTotal += subtotalVal;

                sheetData.push([
                    no++,
                    pickupDateStr,
                    item.product_name || item.name || '-',
                    item.size || '-',
                    qtyVal,
                    priceVal,
                    subtotalVal
                ]);
            });
        }
    });

    // 3. Tambahkan Baris Kosong & Tabel Ringkasan (Bawah)
    sheetData.push([]);
    sheetData.push(['RINGKASAN REKAPITULASI']);
    sheetData.push(['Periode', periodeText]);
    sheetData.push(['Total Qty', `${totalQty} Pcs`]);
    sheetData.push(['Total Keseluruhan yang Harus Dibayar', grandTotal]);

    // Buat Sheet & Workbook
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Atur lebar kolom otomatis agar rapi
    worksheet['!cols'] = [
        { wch: 6 },  // No
        { wch: 22 }, // Tanggal
        { wch: 28 }, // Nama Produk
        { wch: 12 }, // Ukuran
        { wch: 12 }, // Qty
        { wch: 18 }, // Harga/Pcs
        { wch: 22 }  // Total Harga
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Pengambilan');

    // Download File Excel
    const safeSupplierName = supplierText.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Rekap_Barang_${safeSupplierName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
};