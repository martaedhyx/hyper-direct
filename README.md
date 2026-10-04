# HD Gallery — Hyper-Direct P2P Sharing

Kirim foto & video **langsung HP ke HP** (WebRTC P2P), kualitas asli, tanpa server penyimpanan.

**Live:** https://martaedhyx.github.io/hd-gallery/

## Cara pakai
1. HP A: buka link → **Buat Room** → kirim link / tunjukkan QR (atau sebutkan kode 6 huruf).
2. HP B: buka link / scan QR / ketik kode → status jadi **Terhubung**.
3. Masing-masing tap **Pilih Foto / Video** → foto muncul di album teman → tap → **Simpan**.

## Teknis
- Satu file `index.html` (vanilla JS), PeerJS 1.5.4 (CDN) + server signaling publik PeerJS, STUN Google (+ TURN publik PeerJS sebagai cadangan).
- File dipotong 64 KB, backpressure via `RTCDataChannel.bufferedAmount` (jeda > 1 MB, lanjut < 256 KB).
- Sinkronisasi manifest saat (re)connect: file yang belum diterima dikirim ulang otomatis.
- Cache lokal di IndexedDB browser (opsional) agar reload tidak menghilangkan foto. Tidak ada upload ke server.
- Hanya pemilik foto yang bisa menghentikan pembagian fotonya; pesan hapus dari orang lain diabaikan.

## Batasan
- Kedua HP harus tetap membuka halaman selama transfer (Safari di background memutus koneksi; akan tersambung lagi otomatis saat dibuka).
- Jaringan seluler/kantor yang ketat bisa memblokir P2P tanpa server TURN sendiri.
- Browser tidak bisa membaca galeri otomatis; pengguna memilih file sendiri. iPhone bisa mengonversi HEIC → JPEG saat memilih foto.
