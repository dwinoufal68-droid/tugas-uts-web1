// JavaScript BookStore: login, katalog, checkout, transaksi, dan tracking.
const formatRupiah = nilai => new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(nilai);

function hargaKeAngka(harga) {
    return Number(String(harga).replace(/[^\d]/g, "")) || 0;
}

function bacaPenyimpanan(kunci, nilaiDefault) {
    try {
        const data = localStorage.getItem(kunci);
        return data ? JSON.parse(data) : nilaiDefault;
    } catch (error) {
        console.error(`Gagal membaca ${kunci}:`, error);
        return nilaiDefault;
    }
}

function simpanData() {
    try {
        localStorage.setItem("bookstoreKatalog", JSON.stringify(dataKatalogBuku));
        localStorage.setItem("bookstoreTransaksi", JSON.stringify(dataTransaksi));
        localStorage.setItem("bookstoreTracking", JSON.stringify(dataTracking));
    } catch (error) {
        console.error("Gagal menyimpan data BookStore:", error);
        alert("Data tidak dapat disimpan. Periksa pengaturan penyimpanan browser.");
    }
}

function buatNomorDO() {
    // Format mudah dibaca dan kecil kemungkinan terjadi duplikasi.
    let nomor;
    do {
        const tanggal = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const kodeAcak = Math.floor(100000 + Math.random() * 900000);
        nomor = `DO-${tanggal}-${kodeAcak}`;
    } while (dataTransaksi.some(item => item.nomorDO === nomor) || dataTracking[nomor]);
    return nomor;
}

function formatTanggalWaktu() {
    return new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" });
}

document.addEventListener("DOMContentLoaded", () => {
    // Pulihkan data yang pernah diubah di browser.
    const bukuTersimpan = bacaPenyimpanan("bookstoreKatalog", null);
    dataTransaksi = bacaPenyimpanan("bookstoreTransaksi", dataTransaksi);
    const trackingTersimpan = bacaPenyimpanan("bookstoreTracking", {});
    if (bukuTersimpan) dataKatalogBuku.splice(0, dataKatalogBuku.length, ...bukuTersimpan);

    // Gabungkan data demo dengan data tracking hasil checkout yang tersimpan.
    dataTracking = { ...dataTracking, ...trackingTersimpan };
    // Migrasi transaksi lama: jika transaksi sudah tersimpan tetapi tracking belum ada,
    // buat data tracking dari transaksi tersebut agar nomor DO lama tetap dapat dicari.
    dataTransaksi.forEach(transaksi => {
        if (transaksi.nomorDO && !dataTracking[transaksi.nomorDO]) {
            dataTracking[transaksi.nomorDO] = {
                nomorDO: transaksi.nomorDO,
                nama: transaksi.nama || "Pelanggan",
                status: transaksi.status || "Pesanan diproses",
                ekspedisi: transaksi.ekspedisi || "JNE",
                tanggalKirim: transaksi.tanggal || "Belum tersedia",
                paket: transaksi.paket || "Reguler",
                total: formatRupiah(Number(transaksi.total) || 0),
                items: transaksi.items || [],
                perjalanan: [{ waktu: formatTanggalWaktu(), keterangan: "Data pesanan dipulihkan dari riwayat transaksi." }]
            };
        }
    });
    simpanData();

    // LOGIN
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const pengguna = dataPengguna.find(p => p.email.toLowerCase() === email && p.password === password);
            if (pengguna) {
                sessionStorage.setItem("bookstoreLogin", "true");
                sessionStorage.setItem("bookstoreNama", pengguna.nama);
                sessionStorage.setItem("bookstoreRole", pengguna.role);
                window.location.href = "dashboard.html";
            } else {
                alert("email/password yang anda masukkan salah");
            }
        });
    }

    // MODAL
    document.querySelectorAll("[data-modal]").forEach(button => {
        button.addEventListener("click", () => document.getElementById(button.dataset.modal).showModal());
    });
    document.querySelectorAll(".close-btn").forEach(button => {
        button.addEventListener("click", () => button.closest("dialog").close());
    });
    const forgotSubmit = document.getElementById("forgotSubmit");
    if (forgotSubmit) forgotSubmit.addEventListener("click", () => {
        const email = document.getElementById("forgotEmail");
        if (!email.checkValidity()) return email.reportValidity();
        const ada = dataPengguna.some(p => p.email.toLowerCase() === email.value.trim().toLowerCase());
        alert(ada ? "Email terdaftar. Ini hanya simulasi pemulihan password." : "Email tidak ditemukan.");
        email.closest("dialog").close();
    });
    const registerSubmit = document.getElementById("registerSubmit");
    if (registerSubmit) registerSubmit.addEventListener("click", () => {
        const nama = document.getElementById("regName");
        const email = document.getElementById("regEmail");
        const password = document.getElementById("regPassword");
        if (!nama.value.trim() || !email.checkValidity() || !password.checkValidity()) {
            alert("Lengkapi data dengan benar. Password minimal 6 karakter."); return;
        }
        if (dataPengguna.some(p => p.email.toLowerCase() === email.value.trim().toLowerCase())) {
            alert("Email sudah terdaftar."); return;
        }
        dataPengguna.push({ id: Date.now(), nama: nama.value.trim(), email: email.value.trim(), password: password.value, role: "User" });
        alert("Pendaftaran demo berhasil. Silakan login.");
        registerSubmit.closest("dialog").close();
    });

    // DASHBOARD
    const greeting = document.getElementById("greeting");
    if (greeting) {
        const jam = new Date().getHours();
        const sapaan = jam < 11 ? "Selamat pagi" : jam < 15 ? "Selamat siang" : jam < 18 ? "Selamat sore" : "Selamat malam";
        greeting.textContent = `${sapaan}, ${sessionStorage.getItem("bookstoreNama") || "Sobat Buku"}!`;
        document.getElementById("totalBooks").textContent = dataKatalogBuku.length;
        document.getElementById("totalStock").textContent = dataKatalogBuku.reduce((sum, b) => sum + Number(b.stok), 0);
        document.getElementById("totalUsers").textContent = dataPengguna.length;
    }
    const logout = document.getElementById("logoutBtn");
    if (logout) logout.addEventListener("click", () => {
        sessionStorage.clear(); window.location.href = "login.html";
    });

    // KATALOG
    const bookBody = document.getElementById("bookTableBody");
    function renderBooks() {
        if (!bookBody) return;
        const keyword = document.getElementById("searchBook").value.toLowerCase();
        const jenis = document.getElementById("categoryFilter").value;
        const hasil = dataKatalogBuku.filter(b =>
            (b.kodeBarang + " " + b.namaBarang).toLowerCase().includes(keyword) &&
            (!jenis || b.jenisBarang === jenis)
        );
        bookBody.innerHTML = "";
        hasil.forEach((b, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${i + 1}</td><td>${b.kodeBarang}</td><td><b>${b.namaBarang}</b></td>
                <td>${b.jenisBarang}</td><td>${b.edisi}</td><td>${b.harga}</td><td>${b.stok}</td>
                <td><button class="text-btn danger" data-delete="${b.kodeBarang}">Hapus</button></td>`;
            bookBody.appendChild(row);
        });
        document.getElementById("emptyBooks").classList.toggle("hidden", hasil.length > 0);
    }
    if (bookBody) {
        renderBooks();
        document.getElementById("searchBook").addEventListener("input", renderBooks);
        document.getElementById("categoryFilter").addEventListener("change", renderBooks);
        document.getElementById("openBookForm").addEventListener("click", () => document.getElementById("bookModal").showModal());
        document.getElementById("closeBookModal").addEventListener("click", () => document.getElementById("bookModal").close());
        document.getElementById("bookForm").addEventListener("submit", event => {
            event.preventDefault();
            const kode = document.getElementById("bookCode").value.trim().toUpperCase();
            if (dataKatalogBuku.some(b => b.kodeBarang === kode)) {
                alert("Kode barang sudah digunakan."); return;
            }
            const harga = Number(document.getElementById("bookPrice").value);
            const buku = {
                kodeBarang: kode,
                namaBarang: document.getElementById("bookTitle").value.trim(),
                jenisBarang: document.getElementById("bookType").value.trim(),
                edisi: document.getElementById("bookEdition").value,
                stok: Number(document.getElementById("bookStock").value),
                harga: formatRupiah(harga),
                cover: ""
            };
            dataKatalogBuku.push(buku);
            simpanData(); renderBooks(); event.target.reset();
            document.getElementById("bookModal").close();
            alert("Buku berhasil ditambahkan.");
        });
        bookBody.addEventListener("click", event => {
            const kode = event.target.dataset.delete;
            if (!kode) return;
            if (confirm("Yakin ingin menghapus buku ini?")) {
                const index = dataKatalogBuku.findIndex(b => b.kodeBarang === kode);
                if (index >= 0) dataKatalogBuku.splice(index, 1);
                simpanData(); renderBooks();
            }
        });
    }

    // CHECKOUT
    const orderBook = document.getElementById("orderBook");
    let keranjang = [];
    function renderCart() {
        const body = document.getElementById("cartBody");
        if (!body) return;
        body.innerHTML = "";
        keranjang.forEach((item, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${item.kodeBarang}</td><td>${item.namaBarang}</td><td>${item.qty}</td>
                <td>${formatRupiah(item.hargaAngka * item.qty)}</td>
                <td><button class="text-btn danger" data-remove="${i}">Hapus</button></td>`;
            body.appendChild(row);
        });
        const total = keranjang.reduce((sum, item) => sum + item.hargaAngka * item.qty, 0);
        document.getElementById("cartTotal").textContent = formatRupiah(total);
    }
    function renderHistory() {
        const body = document.getElementById("historyBody");
        if (!body) return;
        body.innerHTML = "";
        dataTransaksi.forEach(t => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${t.nomorDO}</td><td>${t.nama}</td><td>${t.tanggal}</td><td>${formatRupiah(t.total)}</td><td>${t.status}</td>`;
            body.appendChild(row);
        });
    }
    if (orderBook) {
        function fillBooks() {
            orderBook.innerHTML = "";
            dataKatalogBuku.forEach(b => {
                const option = document.createElement("option");
                option.value = b.kodeBarang;
                option.textContent = `${b.namaBarang} — ${b.harga} (stok ${b.stok})`;
                orderBook.appendChild(option);
            });
        }
        fillBooks(); renderCart(); renderHistory();
        document.getElementById("addOrderItem").addEventListener("click", () => {
            const buku = dataKatalogBuku.find(b => b.kodeBarang === orderBook.value);
            const qty = Number(document.getElementById("orderQty").value);
            if (!buku) return alert("Buku tidak tersedia.");
            if (!Number.isInteger(qty) || qty < 1) return alert("Jumlah minimal 1.");
            const existing = keranjang.find(item => item.kodeBarang === buku.kodeBarang);
            if ((existing ? existing.qty : 0) + qty > buku.stok) return alert("Stok tidak mencukupi.");
            const hargaAngka = hargaKeAngka(buku.harga);
            if (existing) existing.qty += qty;
            else keranjang.push({ kodeBarang: buku.kodeBarang, namaBarang: buku.namaBarang, hargaAngka, qty });
            renderCart();
        });
        document.getElementById("cartBody").addEventListener("click", event => {
            if (event.target.dataset.remove !== undefined) {
                keranjang.splice(Number(event.target.dataset.remove), 1); renderCart();
            }
        });
        document.getElementById("checkoutForm").addEventListener("submit", event => {
            event.preventDefault();
            if (!keranjang.length) return alert("Tambahkan buku ke keranjang terlebih dahulu.");
            const nomorDO = buatNomorDO();
            const itemPesanan = keranjang.map(item => ({
                kodeBarang: item.kodeBarang,
                namaBarang: item.namaBarang,
                qty: item.qty,
                harga: item.hargaAngka
            }));
            const total = keranjang.reduce((sum, item) => sum + item.hargaAngka * item.qty, 0);
            const transaksi = {
                nomorDO,
                nama: document.getElementById("customerName").value.trim(),
                email: document.getElementById("customerEmail").value.trim(),
                alamat: document.getElementById("customerAddress").value.trim(),
                tanggal: new Date().toLocaleDateString("id-ID"),
                total,
                status: "Pesanan diproses",
                ekspedisi: "JNE",
                paket: "Reguler",
                metode: document.getElementById("paymentMethod").value,
                items: itemPesanan
            };
            keranjang.forEach(item => {
                const buku = dataKatalogBuku.find(b => b.kodeBarang === item.kodeBarang);
                if (buku) buku.stok -= item.qty;
            });
            dataTransaksi.push(transaksi);
            dataTracking[nomorDO] = {
                nomorDO, nama: transaksi.nama, status: "Pesanan diproses",
                ekspedisi: transaksi.ekspedisi, tanggalKirim: transaksi.tanggal,
                paket: transaksi.paket, total: formatRupiah(total),
                items: itemPesanan,
                perjalanan: [{ waktu: formatTanggalWaktu(), keterangan: "Pesanan diterima oleh BookStore. Nomor pesanan berhasil dibuat." }]
            };
            simpanData();
            alert("Pesanan berhasil dibuat. Nomor DO: " + nomorDO);
            keranjang = []; renderCart(); renderHistory(); fillBooks(); event.target.reset();
        });
    }

    // TRACKING: data demo dari dataTracking + transaksi baru.
    const trackingForm = document.getElementById("trackingForm");
    if (trackingForm) trackingForm.addEventListener("submit", event => {
        event.preventDefault();
        const nomor = document.getElementById("doNumber").value.trim().toUpperCase();
        const hasil = dataTracking[nomor];
        const result = document.getElementById("trackingResult");
        result.classList.remove("hidden");
        if (!hasil) {
            result.innerHTML = "<h2>Nomor DO tidak ditemukan</h2><p class='muted'>Periksa kembali nomor Delivery Order.</p>";
            return;
        }
        const perjalanan = (hasil.perjalanan || []).map(item =>
            `<li><b>${item.waktu}</b><p>${item.keterangan}</p></li>`
        ).join("");
        const daftarItem = (hasil.items || []).map(item =>
            `<li>${item.namaBarang} (${item.kodeBarang}) — ${item.qty} buku</li>`
        ).join("");
        result.innerHTML = `<div class="result-head"><div><p class="eyebrow">DETAIL PENGIRIMAN</p><h2>${hasil.nomorDO}</h2></div><span class="tag success">${hasil.status}</span></div>
            <div class="detail-grid">
            <div><small>Nama pemesan</small><b>${hasil.nama}</b></div>
            <div><small>Ekspedisi</small><b>${hasil.ekspedisi}</b></div>
            <div><small>Tanggal pesanan</small><b>${hasil.tanggalKirim}</b></div>
            <div><small>Jenis paket</small><b>${hasil.paket}</b></div>
            <div><small>Total pembayaran</small><b>${hasil.total}</b></div></div>
            ${daftarItem ? `<h3 class="history-title">Rincian buku</h3><ul>${daftarItem}</ul>` : ""}
            <h3 class="history-title">Riwayat perjalanan</h3><ol class="timeline">${perjalanan || "<li>Belum ada pembaruan perjalanan.</li>"}</ol>`;
    });
});
