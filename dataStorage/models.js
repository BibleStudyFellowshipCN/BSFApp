
export const CachePolicy = {
  AsyncStorage: 2,
};

const HostServer = 'http://bsf.turbozv.com';
const HostHttpsServer = 'https://mycbsf.org';
export const Models = {
  HostServer,
  HostHttpsServer,
  Book: {
    key: "BOOK",
    api: "/lessons",
    restUri: HostServer + "/lessons",
    useLanguage: true
  },
  Lesson: {
    key: "LESSON",
    api: "/lessons",
    restUri: HostServer + "/lessons",
    useLanguage: true
  },
  Passage: {
    key: "PASSAGE",
    api: "/verse",
    restUri: HostServer + "/verse",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  Logon: {
    key: "LOGON",
    api: "/logon",
    restUri: HostServer + "/logon",
    userKey: '@BsfApp:user'
  },
  User: {
    key: "User",
    api: "/user",
    restUri: HostServer + "/user"
  },
  Answer: {
    key: "ANSWER",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  AudioInfo: {
    key: "AudioInfo",
    api: "/audioInfo",
    restUri: HostServer + "/audioInfo",
  },
  DeleteMessage: {
    key: "DeleteMessage",
    api: "/deleteMessage",
    restUri: HostServer + "/deleteMessage",
  },
  DefaultLanguage: "eng",
  ValidLanguages: ["chs", "cht", "eng", "spa"],
  Languages: [
    { DisplayName: "简体中文", Value: "chs" },
    { DisplayName: "繁體中文", Value: "cht" },
    { DisplayName: "English", Value: "eng" },
    { DisplayName: "Español", Value: "spa" }
  ],
  DefaultBibleVersion: "niv2011",
  DefaultBibleVersion2: null,
  BibleVersions: {
    "Simplified Chinese":
      [
        { name: "和合本修订版", id: "rcuvss" },
        { name: "当代译本", id: "ccb" },
        //{ name: "新译本", id: "cnvs" },
        //{ name: "中文标准译本", id: "csbs" },
        //{ name: "新标点和合本", id: "cunpss" },
      ],
    "Traditional Chinese":
      [
        { name: "和合本修訂版", id: "rcuvts" },
        { name: "新譯本", id: "cnvt" },
        //{ name: "新標點和合本", id: "cunpts" },
      ],
    "English":
      [
        //{ name: "Authorized King James Version", id: "akjv" },
        { name: "Amplified Bible", id: "amp" },
        //{ name: "Amplified Bible Classic Edition", id: "ampc" },
        // { name: "American Standard Version", id: "asv" },
        // { name: "Common English Bible", id: "ceb" },
        // { name: "Contemporary English Version", id: "cev" },
        // { name: "Contemporary English Version", id: "cevd" },
        // { name: "Complete Jewish Bible", id: "cjb" },
        // { name: "Darby Translation", id: "darby" },
        // { name: "Douay-Rheims 1899 American Edition", id: "dra" },
        // { name: "Easy-to-Read Version", id: "erv" },
        { name: "New International Version 2011", id: "niv2011" },
        { name: "English Standard Version", id: "esv" },
        // { name: "Expanded Bible", id: "exb" },
        // { name: "Good News Translation", id: "gnt" },
        // { name: "1599 Geneva Bible", id: "gnv" },
        // { name: "GOD'S WORD Translation", id: "gw" },
        // { name: "Holman Christian Standard Bible", id: "hcsb" },
        // { name: "International Children’s Bible", id: "icb" },
        // { name: "International Standard Version", id: "isv" },
        // { name: "Jubilee Bible 2000", id: "jub" },
        // { name: "21st Century King James Version", id: "kj21" },
        { name: "King James Version", id: "kjv" },
        // { name: "Lexham English Bible", id: "leb" },
        // { name: "Modern English Version", id: "mev" },
        // { name: "Mounce Reverse-Interlinear New Testament", id: "mounce" },
        { name: "The Message", id: "msg" },
        // { name: "New American Bible Revised Edition", id: "nabre" },
        // { name: "New American Standard Bible", id: "nasb" },
        // { name: "New Century Version", id: "ncv" },
        // { name: "New English Translation", id: "net" },
        // { name: "New International Reader's Version", id: "nirv" },
        { name: "New International Version 1984", id: "niv1984" },
        // { name: "New International Version - UK", id: "nivuk" },
        // { name: "New King James Version", id: "nkjv" },
        // { name: "New Living Translation", id: "nlt" },
        { name: "New Living Translation 2013", id: "nlt2013" },
        // { name: "New Life Version", id: "nlv" },
        // { name: "Names of God Bible", id: "nog" },
        // { name: "New Revised Standard Version", id: "nrsv" },
        // { name: "New Revised Standard Version Anglicised", id: "nrsva" },
        // { name: "Orthodox Jewish Bible", id: "ojb" },
        // { name: "J.B. Phillips New Testament", id: "phillips" },
        // { name: "Revised Standard Version", id: "rsv" },
        // { name: "Revised Standard Version Catholic Edition", id: "rsvce" },
        // { name: "The Living Bible", id: "tlb" },
        // { name: "Tree of Life Version", id: "tlv" },
        // { name: "The Voice", id: "voice" },
        // { name: "World English Bible", id: "web" },
        // { name: "World English Bible British Edition", id: "webbe" },
        // { name: "Wycliffe Bible", id: "wyc" },
        // { name: "Young's Literal Translation", id: "ylt" },
      ],
    "Spanish":
      [
        //{ name: "La Biblia Hispanoamericana Traducción Interconfesional", id: "bhti" },
        // { name: "Buku Lopatulika 1992", id: "bl92" },
        // { name: "Biblia Dios Habla Hoy", id: "dhh" },
        // { name: "Nueva Biblia Latinoamericana de Hoy", id: "nblh" },
        // { name: "Nueva Traducción Viviente", id: "ntv" },
        { name: "Nueva Versión Internacional", id: "nvi" },
        // { name: "Reina Valera Contemporánea", id: "rvc" },
        { name: "Reina-Valera 1995", id: "rvr1995" },
        // { name: "Biblia Reina Valera 1960", id: "rvr60" },
        // { name: "Biblia Reina Valera 1995", id: "rvr95" },
        // { name: "Traducción en Lenguaje Actual", id: "tla" },
      ],
    "Japanese":
      [
        { name: "Japanese Living Bible", id: "jlb" },
      ],
    // "Afrikaans":
    // [{ name: "Afrikaans 1933/1953", id: "afr53" },
    // { name: "Afrikaans 1983", id: "afr83" },],
    // "Arabic":
    // [{ name: "Arabic Life Application Bible", id: "alab" },
    // { name: "New Van Dyck Bible Reduced Vocalization with Helps", id: "avddv" },
    // { name: "Easy-to-Read Version", id: "ervar" },
    // { name: "Ketab El Hayat", id: "nav" },],
    // "Central Bicolano":
    // [{ name: "Marahay na Bareta Biblia", id: "bpv" },],
    // "Cebuano":
    // [{ name: "Ang Pulong Sa Dios", id: "apsd" },
    // { name: "Ang Bag-ong Maayong Balita Biblia", id: "rcpv" },],
    // "Welsh":
    // [{ name: "Beibl Cymraeg Newydd Diwygiedig 2004", id: "bcnd" },],
    // "German":
    // [{ name: "Neue Genfer Übersetzung", id: "ngude" },
    // { name: "Schlachter 2000", id: "sch2000" },],
    // "Boros Dusun":
    // [{ name: "Buuk Do Kinorohingan", id: "bdk" },],
    // "Greek":
    // [{ name: "1550 Stephanus New Testament", id: "tr1550" },
    // { name: "1894 Scrivener New Testament", id: "tr1894" },
    // { name: "SBL Greek New Testament", id: "sblgnt" },],
    // "Fijian":
    // [{ name: "Vakavakadewa Vou kei na iVola tale eso", id: "fnvdc" },],
    // "French":
    // [{ name: "La Bible du Semeur", id: "bds" },
    // { name: "Bible Segond 1910", id: "lsg" },
    // { name: "Nouvelle Edition de Genève – NEG1979", id: "neg1979" },
    // { name: "Segond 21", id: "sg21" },],
    // "Hausa":
    // [{ name: "Littafi Mai Tsarki", id: "hau" },],
    // "Hebrew":
    // [{ name: "Habrit Hakhadasha/Haderekh", id: "hhh" },
    // { name: "The Westminster Leningrad Codex", id: "wlc" },],
    // "Hindi":
    // [{ name: "Hindi Bible: Easy-to-Read Version", id: "ervhi" },],
    // "Hiligaynon":
    // [{ name: "Ang Pulong Sang Dios", id: "hlgn" },],
    // "Croatian":
    // [{ name: "Hrvatski Novi Zavjet – Rijeka 2001", id: "hr" },],
    // "Haitian Creole":
    // [{ name: "Haitian Creole Version", id: "hcv" },],
    // "Iban":
    // [{ name: "Bup Kudus", id: "bk" },],
    // "Indonesian":
    // [{ name: "Alkitab dalam Bahasa Indonesia Masa Kini", id: "bimk" },
    // { name: "Alkitab Terjemahan Baru", id: "tb" },],
    // "Igbo":
    // [{ name: "Bible Nso", id: "igbob" },],
    // "Iloko":
    // [{ name: "Ti Baro a Naimbag a Damag Biblia", id: "ripv" },],
    // "Italian":
    // [{ name: "Nuova Riveduta 2006", id: "nr2006" },],
    // "Jarai":
    // [{ name: "Jarai NT", id: "jnt" },],
    // "Kwanyama":
    // [{ name: "Ombibeli Iyapuki", id: "okyb" },],
    // "Mountain Koiali":
    // [{ name: "Iesu Keliso Hotoe Tumu", id: "kpxnt" },],
    // "Korean":
    // [{ name: "Revised New Korean Standard Version", id: "rnksv" },],
    // "Maori":
    // [{ name: "Maori Bible", id: "maori" },],
    // "Marathi":
    // [{ name: "Easy-to-Read Version", id: "ervmr" },],
    // "Malay":
    // [{ name: "Alkitab Berita Baik +Deuterokanonika", id: "bmdc" },],
    // "Burmese":
    // [{ name: "Judson Bible", id: "bjb" },],
    // "Southern Ndebele":
    // [{ name: "IsiNdebele 2012 Translation", id: "snd12" },],
    // "Nepali":
    // [{ name: "Nepali Bible Easy-to-Read Version", id: "ervne" },],
    // "Ndonga":
    // [{ name: "Ombiimbeli Ondjapuki", id: "ondb" },],
    // "Dutch":
    // [{ name: "Het Boek", id: "htb" },
    // { name: "NBG-vertaling 1951", id: "nbg51" },],
    // "Norwegian":
    // [{ name: "Det Norsk Bibelselskap 1930", id: "dnb1930" },],
    // "Book Norwegian":
    // [{ name: "Bibelen 2011 bokmål", id: "n11bm" },
    // { name: "The Bible in Norwegian 1978/85 bokmål", id: "n78bm" },],
    // "Northern Sotho":
    // [{ name: "BIBELE Taba yea Botse", id: "nso00" },
    // { name: "BIBELE", id: "nso51" },],
    // "Oriya":
    // [{ name: "Oriya Bible: Easy-to-Read Version", id: "ervor" },],
    // "Punjabi":
    // [{ name: "Easy-to-Read Version", id: "ervpa" },],
    // "Pangasinan":
    // [{ name: "Maung a Balita Biblia", id: "pnpv" },],
    // "Kapampangan":
    // [{ name: "Ing Mayap a Balita Biblia", id: "pmpv" },],
    // "Portuguese":
    // [{ name: "Almeida Revista e Corrigida 2009", id: "arc09" },
    // { name: "Nova Versão Internacional", id: "nvipt" },],
    // "Romanian":
    // [{ name: "Biblia sau Sfânta Scriptură cu Trimiteri 1924", id: "bdc" },
    // { name: "Nouă Traducere În Limba Română", id: "ntlr" },],
    // "Russian":
    // [{ name: "New Russian Translation", id: "nrt" },
    // { name: "Синодальный перевод", id: "synod" },],
    // "Kinyarwanda":
    // [{ name: "Bibiliya Yera", id: "bysb" },],
    // "Slovak":
    // [{ name: "Slovenský Ekumenický Biblia", id: "seb" },],
    // "Southern Sotho":
    // [{ name: "BIBELE", id: "sso89so" },],
    // "Sabaot":
    // [{ name: "Biibilya Nyēē Tiliil", id: "spynt" },],
    // "Swati":
    // [{ name: "Siswati 1996 Bible", id: "swt" },],
    // "Swahili":
    // [{ name: "Biblia Habari Njema", id: "bhn" },
    // { name: "Swahili Union Version", id: "suv" },],
    // "Tamil":
    // [{ name: "Easy-to-Read Version", id: "ervta" },
    // { name: "Bible Tamil Old Version", id: "tbov" },],
    "Thai":
      [{ name: "ฉบับ1971", id: "th1971" },],
    // "Tagalog":
    //   [{ name: "Magandang Balita Biblia 2005", id: "mbb05" },
    //   { name: "Ang Salita ng Diyos", id: "snd" },],
    // "Tswana":
    //   [{ name: "BAEBELE e e Boitshepo", id: "tsw08no" },
    //   { name: "BEIBELE", id: "tsw70" },],
    // "Tongan":
    //   [{ name: "Tongan Bible Revised West Version", id: "rwv" },],
    // "Turkish":
    //   [{ name: "Kutsal Kitap Yeni Ceviri", id: "tcl02" },],
    // "Tsonga":
    //   [{ name: "Bibele", id: "tso29no" },
    //   { name: "BIBELE Mahungu Lamanene", id: "tso89" },],
    // "Twi":
    //   [{ name: "Nkwa Asem", id: "natwi" },],
    // "Urdu":
    //   [{ name: "Urdu Bible: Easy-to-Read Version", id: "ervur" },
    //   { name: "Revised Urdu Bible", id: "urd" },],
    // "Venda":
    //   [{ name: "BIVHILI KHETHWA Mafhungo Madifha", id: "ven98" },],
    "Vietnamese":
      [{ name: "Vietnamese Bible Easy-to-Read Version", id: "bpt" },
      { name: "Revised Vietnamese Version Bible", id: "rvv11" },],
    // "Xhosa":
    //   [{ name: "IZIBHALO EZINGCWELE", id: "xho75" },
    //   { name: "IBHAYIBHILE", id: "xho96" },],
    // "Yoruba":
    //   [{ name: "BIBELI MIMỌ", id: "bm" },],
    // "Zou":
    //   [{ name: "Laisiengthou", id: "zomi" },],
    // "Zulu":
    //   [{ name: "IBHAYIBHELI ELINGCWELE", id: "zul59" },],
  },
  DefaultFontSize: 2,  // 1 - small, 2 - medium, 3 - large
  AudioBibles: [
    { DisplayName: "English(NIV)", Value: "1" },
    { DisplayName: "普通话(CUV)", Value: "4" },
    { DisplayName: "广东话(CUV)", Value: "13" },
    { DisplayName: "Spanish", Value: "6" },
  ],
  DownloadUrl: "http://mycbsf.org/data/",
  DownloadList: [
    'books',
    'eng',
    'chs',
    'cht',
    'spa',
    'version'
  ],
  DownloadBibleUrl: "http://mycbsf.org/bible/",
  EmbedBibleList: [
  ],
}
