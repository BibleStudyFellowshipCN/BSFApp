
export const CachePolicy = {
  AsyncStorage: 2,
};

const HostServer = 'http://mycbsf.org:3000';
export const Models = {
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
  },
  Logon: {
    key: "LOGON",
    api: "/logon",
    restUri: HostServer + "/logon",
    userKey: '@BsfApp:user'
  },
  Feedback: {
    key: "Feedback",
    api: "/feedback",
    restUri: HostServer + "/feedback"
  },
  Attendance: {
    key: "Attendance",
    api: "/attendance",
    restUri: HostServer + "/attendance"
  },
  Poke: {
    key: "Poke",
    api: "/poke",
    restUri: HostServer + "/poke"
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
  Recover: {
    key: "RECOVER",
    api: "/recover",
    restUri: HostServer + "/recover",
  },
  GetAnswer: {
    key: "GET_ANSWER",
    api: "/get_answer",
    restUri: "http://192.168.1.147:3000/get_answer",
  },
  UploadAnswer: {
    key: "UPLOAD_ANSWER",
    api: "/save_answer",
    restUri: "http://192.168.1.147:3000/save_answer",
  },

  DefaultLanguage: "chs",
  ValidLanguages: ["chs", "cht", "eng", "spa"],
  Languages: [
    { DisplayName: "简体中文", Value: "chs" },
    { DisplayName: "繁體中文", Value: "cht" },
    { DisplayName: "English", Value: "eng" },
    { DisplayName: "Español", Value: "spa" }
  ],
  DefaultBibleVersion: "rcuvss",
  ValidBibleVersionsLanguages: ['afr53', 'afr83', 'akjv', 'alab', 'amp', 'ampc', 'apsd', 'arc09', 'asv', 'avddv', 'bcnd', 'bdc', 'bdk', 'bds', 'bhn', 'bhti', 'bimk', 'bjb', 'bk', 'bl92', 'bm', 'bmdc', 'bpt', 'bpv', 'bysb', 'ccb', 'ceb', 'cev', 'cevd', 'cjb', 'cnvs', 'cnvt', 'csbs', 'cunpss', 'cunpts', 'darby', 'dhh', 'dnb1930', 'dra', 'erv', 'ervar', 'ervhi', 'ervmr', 'ervne', 'ervor', 'ervpa', 'ervta', 'ervur', 'esv', 'exb', 'fnvdc', 'gnt', 'gnv', 'gw', 'hau', 'hcsb', 'hcv', 'hhh', 'hlgn', 'hnzri', 'htb', 'icb', 'igbob', 'isv', 'jnt', 'jub', 'kj21', 'kjv', 'kpxnt', 'leb', 'lsg', 'maori', 'mbb05', 'mev', 'mounce', 'msg', 'n11bm', 'n78bm', 'nabre', 'nasb', 'natwi', 'nav', 'nbg51', 'nblh', 'ncv', 'neg1979', 'net', 'ngude', 'nirv', 'niv1984', 'niv2011', 'nivuk', 'nkjv', 'nlt', 'nlt2013', 'nlv', 'nog', 'nr2006', 'nrsv', 'nrsva', 'nrt', 'nso00', 'nso51', 'ntlr', 'ntv', 'nvi', 'nvipt', 'ojb', 'okyb', 'ondb', 'phillips', 'pmpv', 'pnpv', 'rcpv', 'rcuvss', 'rcuvts', 'ripv', 'rnksv', 'rsv', 'rsvce', 'rvc', 'rvr1995', 'rvr60', 'rvr95', 'rvv11', 'rwv', 'sblgnt', 'sch2000', 'seb', 'sg21', 'snd', 'snd12', 'spynt', 'sso89so', 'suv', 'swt', 'synod', 'tb', 'tbov', 'tcl02', 'th1971', 'tla', 'tlb', 'tlv', 'tr1550', 'tr1894', 'tso29no', 'tso89', 'tsw08no', 'tsw70', 'urd', 'ven98', 'voice', 'web', 'webbe', 'wlc', 'wyc', 'xho75', 'xho96', 'ylt', 'zomi', 'zul59'],
  BibleVersions: [
    { DisplayName: "和合本修订版(简体)", Value: "rcuvss" },
    { DisplayName: "当代译本(简体)", Value: "ccb" },
    { DisplayName: "和合本修訂版(繁體)", Value: "rcuvts" },
    { DisplayName: "新譯本(繁體)", Value: "cnvt" },
    { DisplayName: "New International Version 2011", Value: "niv2011" },
    { DisplayName: "New International Version 1984", Value: "niv1984" },
    { DisplayName: "English Standard Version", Value: "esv" },
    { DisplayName: "King James Version", Value: "kjv" },
    { DisplayName: "Nueva Versión Internacional", Value: "nvi" },
    { DisplayName: "Reina-Valera 1995", Value: "rvr1995" },
  ],
  DefaultFontSize: 2,  // 1 - small, 2 - medium, 3 - large
  AudioBibles: [
    { DisplayName: "普通话(CUV)", Value: "4" },
    { DisplayName: "广东话(CUV)", Value: "13" },
    { DisplayName: "English(KJV)", Value: "1" },
    { DisplayName: "Spanish", Value: "6" },
  ],
  DownloadUrl: "http://mycbsf.org/data/",
  DownloadList: [
    'eng',
    'chs',
    'cht',
    'spa',
    'niv2011',
    'rcuvss',
    'rcuvts',
    'esv',
    'rvr1995',
    'ccb',
    'cnvt',
    'kjv',
    'niv1984',
    'nvi',
    'version'
  ]
}
