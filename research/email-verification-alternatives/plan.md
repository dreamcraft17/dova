# Research plan: alternatif SMTP untuk verifikasi email DOVA

## Keputusan yang ingin dijawab

Bagaimana DOVA mengirim OTP verifikasi tanpa koneksi SMTP Gmail, dengan risiko operasional, biaya, dan perubahan kode seminimal mungkin?

## Hipotesis yang dapat diuji

1. DOVA sudah dapat berpindah dari Gmail SMTP ke HTTP email API dengan perubahan konfigurasi minimal.
2. Provider transactional email API lebih sesuai daripada mailbox Gmail untuk OTP, tetapi tetap memiliki kuota, verifikasi domain, dan aturan deliverability.
3. AWS SES API paling ekonomis pada volume besar, tetapi onboarding dan pengelolaan reputasinya lebih berat.
4. SMS/WhatsApp/TOTP dapat menjadi fallback atau pengganti email, tetapi mengubah UX, biaya, dan bukti kepemilikan yang diverifikasi.

## Ruang lingkup

- Registration OTP, resend OTP, password-reset OTP, dan notifikasi supplier DOVA.
- Fokus pada API HTTPS, bukan server SMTP mandiri.
- Tidak mengubah kode pada tahap riset ini.

## Sumber dan metode

- Dokumentasi resmi provider/API dan dokumentasi kode DOVA.
- Triangulasi per tesis memakai beberapa provider/jenis sumber resmi.
- Counter-argument: API bukan berarti tanpa limit; email provider tetap dapat menahan akun, meminta domain verification, atau membatasi sandbox.

## Stop criteria

Berhenti setelah ditemukan: satu jalur low-change yang langsung kompatibel dengan kode saat ini, satu opsi cost-optimized untuk scale, dan satu fallback non-email yang layak.
