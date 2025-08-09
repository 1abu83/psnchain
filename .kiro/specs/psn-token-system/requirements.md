# Requirements Document - PSN Token System

## Introduction

Sistem token PSN Chain yang komprehensif dengan native coin PSN dan kemampuan untuk membuat custom token dengan contract address. Sistem ini akan mendukung pembuatan, transfer, dan manajemen berbagai jenis token dalam blockchain PSN Chain, dengan PSN sebagai native coin untuk gas fees dan custom token dengan contract address unik.

## Requirements

### Requirement 1: Native PSN Coin System

**User Story:** Sebagai pengguna blockchain PSN Chain, saya ingin memiliki native coin PSN yang berfungsi sebagai mata uang utama untuk gas fees dan reward mining, sehingga saya dapat melakukan transaksi dan mining di network.

#### Acceptance Criteria

1. WHEN sistem blockchain diinisialisasi THEN PSN coin SHALL tersedia sebagai native currency tanpa contract address
2. WHEN user melakukan mining THEN sistem SHALL memberikan reward 100 PSN per block yang berhasil dimining
3. WHEN user melakukan transaksi THEN sistem SHALL menggunakan PSN sebagai gas fee
4. WHEN user melihat balance THEN sistem SHALL menampilkan PSN balance tanpa contract address identifier
5. IF user melakukan transfer PSN THEN sistem SHALL memvalidasi balance dan memproses transaksi langsung di blockchain

### Requirement 2: Custom Token Creation System

**User Story:** Sebagai developer atau project owner, saya ingin dapat membuat custom token dengan contract address unik, sehingga saya dapat meluncurkan token project saya di PSN Chain.

#### Acceptance Criteria

1. WHEN user membuat custom token THEN sistem SHALL generate contract address unik dengan format "PSN" + 40 karakter hexadecimal
2. WHEN token dibuat THEN sistem SHALL menyimpan metadata token (name, symbol, total supply, decimals) dengan contract address
3. WHEN contract address di-generate THEN sistem SHALL memastikan uniqueness dan tidak ada duplikasi
4. IF user input invalid token parameters THEN sistem SHALL menolak pembuatan dan memberikan error message
5. WHEN token berhasil dibuat THEN sistem SHALL menambahkan initial supply ke wallet creator

### Requirement 3: Token Transfer and Balance Management

**User Story:** Sebagai pengguna, saya ingin dapat mengirim dan menerima berbagai jenis token (PSN dan custom token), sehingga saya dapat bertransaksi dengan berbagai aset digital.

#### Acceptance Criteria

1. WHEN user melakukan transfer token THEN sistem SHALL memvalidasi balance sender untuk token yang ditransfer
2. WHEN transfer PSN THEN sistem SHALL memproses tanpa contract address reference
3. WHEN transfer custom token THEN sistem SHALL menggunakan contract address untuk identifikasi token
4. IF balance tidak mencukupi THEN sistem SHALL menolak transaksi dan memberikan error message
5. WHEN transaksi berhasil THEN sistem SHALL update balance sender dan receiver di blockchain

### Requirement 4: Token Discovery and Management

**User Story:** Sebagai pengguna, saya ingin dapat melihat semua token yang saya miliki dan mengelola portfolio token saya, sehingga saya dapat memantau aset digital saya.

#### Acceptance Criteria

1. WHEN user membuka wallet THEN sistem SHALL menampilkan semua token balance (PSN + custom tokens)
2. WHEN user mencari token THEN sistem SHALL dapat mencari berdasarkan contract address atau symbol
3. WHEN user menambah token ke wallet THEN sistem SHALL memvalidasi contract address existence
4. IF contract address tidak valid THEN sistem SHALL memberikan error message
5. WHEN token ditambahkan THEN sistem SHALL menampilkan balance dan metadata token

### Requirement 5: Contract Address Validation System

**User Story:** Sebagai pengguna, saya ingin sistem memvalidasi contract address dengan benar, sehingga saya tidak dapat berinteraksi dengan token yang tidak valid atau tidak ada.

#### Acceptance Criteria

1. WHEN user input contract address THEN sistem SHALL memvalidasi format "PSN" + 40 hex characters
2. WHEN contract address divalidasi THEN sistem SHALL check existence di blockchain storage
3. IF contract address format salah THEN sistem SHALL memberikan error "Invalid contract address format"
4. IF contract address tidak ditemukan THEN sistem SHALL memberikan error "Token contract not found"
5. WHEN contract address valid THEN sistem SHALL return token metadata

### Requirement 6: Token Metadata and Information System

**User Story:** Sebagai pengguna, saya ingin dapat melihat informasi lengkap tentang token (nama, symbol, supply, decimals), sehingga saya dapat memahami karakteristik token sebelum bertransaksi.

#### Acceptance Criteria

1. WHEN user melihat token details THEN sistem SHALL menampilkan name, symbol, total supply, decimals
2. WHEN token adalah PSN THEN sistem SHALL menampilkan "Native PSN Coin" sebagai identifier
3. WHEN token adalah custom token THEN sistem SHALL menampilkan contract address dan creator information
4. IF token metadata tidak lengkap THEN sistem SHALL menampilkan default values
5. WHEN user export token info THEN sistem SHALL provide JSON format dengan semua metadata

### Requirement 7: Gas Fee System Integration

**User Story:** Sebagai pengguna, saya ingin sistem gas fee yang transparan menggunakan PSN, sehingga saya dapat memahami biaya transaksi sebelum melakukan transfer.

#### Acceptance Criteria

1. WHEN user melakukan transaksi apapun THEN sistem SHALL calculate gas fee dalam PSN
2. WHEN gas fee dihitung THEN sistem SHALL menampilkan estimasi biaya sebelum konfirmasi
3. IF PSN balance tidak cukup untuk gas fee THEN sistem SHALL menolak transaksi
4. WHEN transaksi dikonfirmasi THEN sistem SHALL deduct gas fee dari PSN balance
5. WHEN transaksi selesai THEN sistem SHALL menampilkan total gas fee yang digunakan