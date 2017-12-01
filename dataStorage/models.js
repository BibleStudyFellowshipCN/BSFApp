
export const CachePolicy = {
  None: 0,
  Memory: 1,
  AsyncStorage: 2,
};

const HostServer = 'http://cbsf.southcentralus.cloudapp.azure.com:3000';
export const Models = {
  Book: {
    key: "BOOK",
    restUri: HostServer + "/lessons",
    cachePolicy: CachePolicy.AsyncStorage,
    useLanguage: true
  },
  Lesson: {
    key: "LESSON",
    restUri: HostServer + "/lessons",
    cachePolicy: CachePolicy.AsyncStorage,
    useLanguage: true
  },
  Passage: {
    key: "PASSAGE",
    restUri: HostServer + "/verse",
    cachePolicy: CachePolicy.AsyncStorage
  },
  Logon: {
    key: "LOGON",
    restUri: HostServer + "/logon",
    cachePolicy: CachePolicy.AsyncStorage,
    userKey: '@BsfApp:user'
  },
  Feedback: {
    key: "Feedback",
    restUri: HostServer + "/feedback"
  },
  Poke: {
    key: "Poke",
    restUri: HostServer + "/poke"
  },
  Answer: {
    key: "ANSWER",
    cachePolicy: CachePolicy.AsyncStorage,
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
  ]
}
