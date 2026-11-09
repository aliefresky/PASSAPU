// Kamus dasar Konjo -> Indonesia. Tambahkan entri baru pada daftar di bawah.
window.KONJO_DICT = {
  categories: ["Ganti", "Benda", "Kerja", "Sifat", "Angka", "Lainnya"],

  words: [
    // Kata ganti
    { k: "nakke", i: "saya", c: "Ganti" },
    { k: "ikau", i: "kamu", c: "Ganti" },
    { k: "ia", i: "dia", c: "Ganti" },
    { k: "ikambe", i: "kami", c: "Ganti" },
    { k: "ikatte", i: "kita", c: "Ganti" },
    { k: "anne", i: "ini", c: "Ganti" },
    { k: "anjo", i: "itu", c: "Ganti" },
    { k: "inai", i: "siapa", c: "Ganti" },
    { k: "apa", i: "apa", c: "Ganti" },

    // Benda
    { k: "bola", i: "rumah", c: "Benda" },
    { k: "je'ne'", i: "air", c: "Benda" },
    { k: "ana'", i: "anak", c: "Benda" },
    { k: "ambo'", i: "ayah", c: "Benda" },
    { k: "indo'", i: "ibu", c: "Benda" },
    { k: "tau", i: "orang", c: "Benda" },
    { k: "bura'ne", i: "laki-laki", c: "Benda" },
    { k: "baine", i: "perempuan", c: "Benda" },
    { k: "kareba", i: "kabar", c: "Benda" },
    { k: "kana", i: "kata", c: "Benda" },
    { k: "bangngi", i: "malam", c: "Benda" },
    { k: "allo", i: "hari", c: "Benda" },
    { k: "karaeng", i: "tuan", c: "Benda" },
    { k: "lino", i: "dunia", c: "Benda" },
    { k: "tana", i: "tanah", c: "Benda" },
    { k: "langi'", i: "langit", c: "Benda" },
    { k: "bulang", i: "bulan", c: "Benda" },
    { k: "jarang", i: "kuda", c: "Benda" },
    { k: "bembe", i: "kambing", c: "Benda" },
    { k: "jangang", i: "ayam", c: "Benda" },
    { k: "juku'", i: "ikan", c: "Benda" },
    { k: "loka", i: "pisang", c: "Benda" },

    // Kerja
    { k: "kanre", i: "makan", c: "Kerja" },
    { k: "inung", i: "minum", c: "Kerja" },
    { k: "lampa", i: "pergi", c: "Kerja" },
    { k: "battu", i: "datang", c: "Kerja" },
    { k: "tinro", i: "tidur", c: "Kerja" },
    { k: "a'kana", i: "berbicara", c: "Kerja" },
    { k: "bangung", i: "bangun", c: "Kerja" },
    { k: "cini'", i: "lihat", c: "Kerja" },
    { k: "alle", i: "ambil", c: "Kerja" },
    { k: "boli", i: "beli", c: "Kerja" },
    { k: "a'jama", i: "bekerja", c: "Kerja" },
    { k: "tarima", i: "terima", c: "Kerja" },
    { k: "antama", i: "masuk", c: "Kerja" },
    { k: "bunting", i: "menikah", c: "Kerja" },
    { k: "sambayang", i: "sholat", c: "Kerja" },

    // Sifat
    { k: "bajik", i: "baik", c: "Sifat" },
    { k: "kodi", i: "jelek", c: "Sifat" },
    { k: "lompo", i: "besar", c: "Sifat" },
    { k: "caddi", i: "kecil", c: "Sifat" },
    { k: "jarre'", i: "banyak", c: "Sifat" },
    { k: "kedde'", i: "sedikit", c: "Sifat" },
    { k: "kalumannyang", i: "kaya", c: "Sifat" },
    { k: "garring", i: "sakit", c: "Sifat" },
    { k: "matoa", i: "tua", c: "Sifat" },
    { k: "macca", i: "pintar", c: "Sifat" },
    { k: "lambusu'", i: "jujur", c: "Sifat" },
    { k: "marasa", i: "enak", c: "Sifat" },
    { k: "sallo", i: "lama", c: "Sifat" },

    // Angka
    { k: "se're", i: "satu", c: "Angka" },
    { k: "rua", i: "dua", c: "Angka" },
    { k: "tallu", i: "tiga", c: "Angka" },
    { k: "appa'", i: "empat", c: "Angka" },
    { k: "lima", i: "lima", c: "Angka" },
    { k: "annang", i: "enam", c: "Angka" },
    { k: "tujuang", i: "tujuh", c: "Angka" },
    { k: "sampulo", i: "sepuluh", c: "Angka" },

    // Lainnya
    { k: "iyo", i: "ya", c: "Lainnya" },
    { k: "tea", i: "tidak mau", c: "Lainnya" },
    { k: "taena", i: "tidak ada", c: "Lainnya" },
    { k: "tabe'", i: "permisi", c: "Lainnya" },
    { k: "salama'", i: "selamat", c: "Lainnya" },
    { k: "ri", i: "di", c: "Lainnya" },
    { k: "pole", i: "dari", c: "Lainnya" },
    { k: "sallang", i: "nanti", c: "Lainnya" },
    { k: "ampa", i: "baru", c: "Lainnya" },
    { k: "nampa", i: "kemudian", c: "Lainnya" },
    { k: "sikali", i: "sekali", c: "Lainnya" },
    { k: "na", i: "dan", c: "Lainnya" },
    { k: "siagang", i: "dengan", c: "Lainnya" },
    { k: "kamma", i: "seperti", c: "Lainnya" },
    { k: "anrinni", i: "di sini", c: "Lainnya" }
  ],

  phrases: [
    { k: "apa kareba", i: "apa kabar" },
    { k: "karebaji", i: "kabar baik" },
    { k: "kareba bajik", i: "kabar baik" },
    { k: "salama' battu", i: "selamat datang" },
    { k: "salama' bangngi", i: "selamat malam" },
    { k: "tarima kasi'", i: "terima kasih" }
  ],

  samples: [
    "Apa kareba?",
    "Nakke lampa ri bola.",
    "Ikau kanre na inung je'ne'.",
    "Salama' battu ri anrinni.",
    "Anjo ana' bajik sikali."
  ]
};
