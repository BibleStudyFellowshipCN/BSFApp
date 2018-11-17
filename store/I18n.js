import { Models } from '../dataStorage/models';
import { getCurrentUser } from '../store/user';

const text = {
  chs: [
    "BSF课程",
    "课",
    "我",
    "有声圣经",
    "设置",
    "显示语言",
    "圣经版本",
    "反馈意见",
    "版本",
    "提交",
    "请选择显示语言",
    "请选择圣经版本",
    "提示：选择后程序将重新启动",
    "缺少内容",
    "请输入反馈意见内容",
    "谢谢您的反馈意见！",
    "背诵经文：",
    "一", "二", "三", "四", "五", "六",
    "暂停",
    "播放",
    "第",
    "章",
    "离线模式",
    "提示",
    "请先关闭离线模式",
    "检查更新",
    "发现更新",
    "程序将重新启动",
    "您已经在使用最新版本",
    "考勤表",
    "讲道录音",
    "手机号码",
    "设置",
    "更改",
    "字体大小",
    "大",
    "中",
    "小",
    "\n请强制关闭程序：\n\n1. 双击Home按钮\n\n2.向上划CBSF的预览界面关闭程序",
    "课程没有更新",
    "是否重新下载？",
    "下载课程",
    "设置手机号码",
    "问题讨论",
    "聊天室",
    "教养孩童指南",
    "家庭查经讨论",
    "基本真理：",
    "属灵原则：",
    "经文释义",
    "请在以下粘贴导出的答案用于导入",
    "请全选以下文本后复制，或者导出",
    "导出",
    "导入",
    "错误",
    "答案格式不正确",
    "导入成功",
    "如果本机已有对应的答案，内容将会被覆盖，请确认是否导入答案？",
    "没有答案",
    "答案管理",
    "确认",
    "清空下载文件",
    "完成",
    "正在下载圣经",
    "下载圣经",
    "下载失败",
  ],
  cht: [
    "BSF課程",
    "課",
    "我",
    "有聲聖經",
    "設置",
    "顯示語言",
    "聖經版本",
    "反饋意見",
    "版本",
    "提交",
    "請選擇顯示語言",
    "請選擇聖經版本",
    "提示：選擇後程式將重新啟動",
    "缺少內容",
    "請輸入反饋意見內容",
    "謝謝您的反饋意見！",
    "背誦經文：",
    "一", "二", "三", "四", "五", "六",
    "暫停",
    "播放",
    "第",
    "章",
    "離線模式",
    "提示",
    "請先關閉離線模式",
    "檢查更新",
    "發現更新",
    "程式將重新啟動",
    "您已經在使用最新版本",
    "考勤表",
    "講道錄音",
    "手機號碼",
    "設置",
    "更改",
    "字體大小",
    "大",
    "中",
    "小",
    "\n請強制關閉程式：\n\n1. 雙擊Home按鈕\n\n2.向上劃CBSF的預覽界面關閉程式",
    "課程沒有更新",
    "是否重新下載？",
    "下載課程",
    "設置手機號碼",
    "問題討論",
    "聊天室",
    "教養孩童指南",
    "家庭查經討論",
    "基本真理：",
    "屬靈原則：",
    "經文釋義",
    "請在以下粘貼導出的答案用於導入",
    "請全選以下文本後復制，或者導出",
    "導出",
    "導入",
    "錯誤",
    "答案格式不正確",
    "導入成功",
    "如果本機已有對應的答案，內容將會被覆蓋，請確認是否導入答案？",
    "沒有答案",
    "答案管理",
    "確認",
    "清空下載文件",
    "完成",
    "正在下載聖經",
    "下載聖經",
    "下載失敗",
  ],
  eng: [
    "BSF Lessons",
    "Lessons",
    "Me",
    "AudioBible",
    "Settings",
    "Display Language",
    "Bible Version",
    "Feedback",
    "Version",
    "Submit",
    "Please select display language",
    "Please select bible version",
    "Note: App will restart",
    "Missing content",
    "Please enter feedback content",
    "Thank you for your feedback!",
    "Scripture Memory Verse: ",
    "1ST", "2ND", "3RD", "4TH", "5TH", "6TH",
    "Pause",
    "Play",
    "Chapter ",
    " ",
    "Offline Mode",
    "Information",
    "Please turn off offline mode first",
    "Check for update",
    "Found update",
    "We will restart the app",
    "Your're already using the latest app",
    "Attendance",
    "Sermon recording",
    "Cellphone",
    "Setup",
    "Update",
    "Font size",
    "Big",
    "Medium",
    "Small",
    "\nPlease force close the app:\n\n1. Double-click the Home button\n\n2.Swipe up on the CBSF's preview to close the app",
    "No update on lessons",
    "Do you want to re-download?",
    "Download lessons",
    "Set up cellphone",
    "Discussion",
    "Chat room",
    "Home Training",
    "Home Discussion",
    "Main Truth: ",
    "Principles: ",
    "Notes",
    "Please paste the exported answers below to import",
    "Please select all text and copy, or export",
    "Export",
    "Import",
    "Error",
    "Wrong answer format",
    "Succeed",
    "If you already have the answers, the content will be overwritten, please confirm if you want to continue?",
    "No answers",
    "Answer management",
    "Confirm",
    "Remove downloaded files",
    "Done",
    "Downloading bible",
    "Download bible",
    "Failed to download",
  ],
  spa: [
    "BSF Lecciones",
    "Lecciones",
    "Yo",
    "Audio biblia",
    "Las configuraciónes",
    "idioma de la pantalla",
    "Biblia  versión",
    "Realimentación",
    "Versión",
    "Enviar",
    "Por favor seleccione Seleccione el idioma de visualización",
    "Por favor seleccione la versión bíblica",
    "Nota: la aplicación se reiniciará",
    "Contenido faltante",
    "Por favor Introduzca el contenido de comentarios",
    "Gracias por tus comentarios",
    "Verso de la memoria de las Escrituras: ",
    "1ER", "2DO", "3TE", "4TO", "5TO", "6TO",
    "Pausa",
    "Jugar",
    "Capítulo",
    " ",
    "Modo offline",
    "Información",
    "Por favor apague el modo fuera de línea primero",
    "Buscar actualizaciones",
    "Actualización encontrada",
    "Vamos a reiniciar la aplicación",
    "Tu ya estás usando la última aplicación",
    "Asistencia",
    "Grabación de sermón",
    "Teléfono móvil",
    "Preparar",
    "Actualizar",
    "Tamaño de fuente",
    "Grande",
    "Medio",
    "Pequeña",
    "\nPor favor, cierre la aplicación:\n\n1. Haga doble clic en el botón de Inicio\n\n2. Descargue la vista previa de CBSF para cerrar la aplicación",
    "Sin actualizaciones en las lecciones",
    "¿Quieres volver a descargar?",
    "Descargar lecciones",
    "Configurar el teléfono celular",
    "Discusión",
    "Sala de chat",
    "Entrenamiento en casa",
    "Discusión en casa",
    "Verdad principal:",
    "Principios:",
    "Notes",
    "Pegue las respuestas exportadas a continuación para importar",
    "Seleccione todo el texto y copie, o exporte",
    "Exportar",
    "Importar",
    "Error",
    "Formato de respuesta incorrecta",
    "Tener éxito",
    "Si ya tiene las respuestas, se sobrescribirá el contenido, confirme si desea continuar?",
    "Sin respuestas",
    "Administración de respuestas",
    "Confirmar",
    "Eliminar archivos descargados",
    "Hecho",
    "Descarga de la Biblia",
    "Descargar Biblia",
    "Error al descargar",
  ]
};

const BibleBookText = {
  chs: [
    "创世记", "出埃及记", "利未记", "民数记", "申命记", "约书亚记", "士师记", "路得记", "撒母耳记上", "撒母耳记下", "列王纪上", "列王纪下", "历代志上", "历代志下", "以斯拉记", "尼希米记", "以斯帖记", "约伯记", "诗篇", "箴言", "传道书", "雅歌", "以赛亚书", "耶利米书", "耶利米哀歌", "以西结书", "但以理书", "何西阿书", "约珥书", "阿摩司书", "俄巴底亚书", "约拿书", "弥迦书", "那鸿书", "哈巴谷书", "西番雅书", "哈该书", "撒迦利亚书", "玛拉基书", "马太福音", "马可福音", "路加福音", "约翰福音", "使徒行传", "罗马书", "哥林多前书", "哥林多后书", "加拉太书", "以弗所书", "腓立比书", "歌罗西书", "帖撒罗尼迦前书", "帖撒罗尼迦后书", "提摩太前书", "提摩太后书", "提多书", "腓利门书", "希伯来书", "雅各书", "彼得前书", "彼得后书", "约翰一书", "约翰二书", "约翰三书", "犹大书", "启示录",
  ],
  cht: [
    "創世記", "出埃及記", "利未記", "民數記", "申命記", "約書亞記", "士師記", "路得記", "撒母耳記上", "撒母耳記下", "列王紀上", "列王紀下", "歷代志上", "歷代志下", "以斯拉記", "尼希米記", "以斯帖記", "約伯記", "詩篇", "箴言", "傳道書", "雅歌", "以賽亞書", "耶利米書", "耶利米哀歌", "以西結書", "但以理書", "何西阿書", "約珥書", "阿摩司書", "俄巴底亞書", "約拿書", "彌迦書", "那鴻書", "哈巴谷書", "西番雅書", "哈該書", "撒迦利亞書", "瑪拉基書", "馬太福音", "馬可福音", "路加福音", "約翰福音", "使徒行傳", "羅馬書", "哥林多前書", "哥林多後書", "加拉太書", "以弗所書", "腓立比書", "歌羅西書", "帖撒羅尼迦前書", "帖撒羅尼迦後書", "提摩太前書", "提摩太後書", "提多書", "腓利門書", "希伯來書", "雅各書", "彼得前書", "彼得後書", "約翰一書", "約翰二書", "約翰三書", "猶大書", "啟示錄",
  ],
  eng: [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3rd John", "Jude", "Revelation",
  ],
  spa: [
    "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio", "Josué", "Jueces", "Rut", "1 Samuel", "2 Samuel", "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras", "Nehemías", "Ester", "Job", "Salmos", "Proverbios", "Eclesiastés", "Cantares", "Isaías", "Jeremías", "Lamentaciones", "Ezequiel", "Daniel", "Oseas", "Joel", "Amós", "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc", "Sofonías", "Hageo", "Zacarías", "Malaquías", "Mateo", "Marcos", "Lucas", "Juan", "Hechos", "Romanos", "1 Corintios", "2 Corintios", "Gálatas", "Efesios", "Filipenses", "Colosenses", "1 Tesalonicenses", "2 Tesalonicenses", "1 Timoteo", "2 Timoteo", "Tito", "Filemón", "Hebreos", "Santiago", "1 Pedro", "2 Pedro", "1 Juan", "2 Juan", "3 Juan", "Judas", "Apocalipsis",
  ]
};

function getI18nText(origText) {
  const lang = getCurrentUser().getLanguage();
  //console.log("[I18n]" + lang + "{" + origText + "}");
  const UILanguage = 'chs';
  if (lang == UILanguage) {
    return origText;
  }

  for (var i in text[UILanguage]) {
    if (text[UILanguage][i] == origText) {
      return text[lang][i] ? text[lang][i] : origText;
    }
  }

  return origText;
}

function getI18nBibleBook(origText) {
  const lang = getCurrentUser().getLanguage();
  //console.log("[getI18nBibleBook]" + lang + "{" + origText + "}");
  if (lang == 'chs') {
    return origText;
  }

  for (var j in Models.ValidLanguages) {
    const checkLang = Models.ValidLanguages[j];
    for (var i in BibleBookText[checkLang]) {
      if (BibleBookText[checkLang][i] == origText) {
        //console.log("=>" + BibleBookText[lang][i]);
        return BibleBookText[lang][i];
      }
    }
  }

  return origText;
}

function getI18nBibleBookFromLang(origText, lang) {
  //console.log("[getI18nBibleBook]" + lang + "{" + origText + "}");
  if (lang == 'chs') {
    return origText;
  }

  for (var j in Models.ValidLanguages) {
    const checkLang = Models.ValidLanguages[j];
    for (var i in BibleBookText[checkLang]) {
      if (BibleBookText[checkLang][i] == origText) {
        //console.log("=>" + BibleBookText[lang][i]);
        return BibleBookText[lang][i];
      }
    }
  }

  return origText;
}

export { getI18nText, getI18nBibleBook, getI18nBibleBookFromLang };