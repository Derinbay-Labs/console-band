import type { Copy } from "./types";

export const tr: Copy = {
  lang: "tr",
  nav: [
    ["#features", "Özellikler"],
    ["#privacy", "Gizlilik"],
    ["#faq", "SSS"],
  ],
  navcta: "Kur",
  gh: "GitHub",
  cmdLabel: "Claude Code istemi için kurulum komutu",
  copy: "Kopyala",
  copied: "Kopyalandı",
  copyFail: "Kopyalamak için komutu seçin",
  cmdNote: "Claude Code isteminde çalıştırın. Ücretsiz, MIT lisanslı.",
  ghBtn: "GitHub’da incele",
  synthetic: "Örnek oturum gösteriliyor.",
  srBand: "Bu örnekte bandın gösterdikleri",
  scenesLabel: "Bandın bölümleri",
  specH: "Bilgiler",
  spec: [
    ["Çalıştırdığı", "Yalnızca git, salt okunur"],
    ["Ağ", "Varsayılan olarak yok"],
    ["Dar terminal", "100 sütunun altında kompakt"],
    ["Lisans", "MIT, açık kaynak"],
  ],
  featH: "Yakından: süren iş.",
  featP:
    "Bağlam, limitler ve önbellek yukarıdaki bantta. Bu satırlar kimin çalıştığını ve neye izin verildiğini gösterir.",
  also: [
    [
      "cols",
      "Kategoriye göre bağlam",
      "Sistem, araçlar, MCP, ajanlar, bellek, beceriler ve mesajlar; pay kesik çizgiyle.",
    ],
    [
      "play",
      "Tempolu limitler",
      "Oturum ve haftalık kullanım eşit tempoya göre, fark işaretli.",
    ],
    [
      "log",
      "Önbellek geri sayımı",
      "Yeşil, kehribar, kırmızı, sonra soğuk. 5 ya da 60 dakika.",
    ],
  ],
  howH: "Bir dakikadan kısa sürede kurulu.",
  howP: "Claude Code isteminde üç adım. Masaüstü uygulamasının yolu SSS’de.",
  steps: [
    ["Kurulum komutunu çalıştırın", "Bir Claude Code terminal oturumunun istemine yapıştırın."],
    [
      "Marketplace’i ekleyin, kapsam seçin",
      "y yanıtını verin, ardından bandın her oturumda yüklenmesi için kullanıcı kapsamını seçin.",
    ],
    ["Çalışmaya devam edin", "Bant istemin üstünde belirir. Sonra tek komutla güncelleyin."],
  ],
  stepChips: [
    "/plugin install console-band --marketplace Derinbay-Labs/console-band",
    "y  ›  user scope",
    "/plugin update console-band",
  ],
  trustH: "Oturumunuzu okur. Hiçbir şey göndermez.",
  trustP:
    "console-band yalnızca gözlemler. Her hook olayı değiştirmeden iletir; hiçbiri Claude Code’u engellemez, yeniden yazmaz ya da onun yerine yanıt vermez.",
  ledger: [
    [
      "terminal",
      "Çalıştırdığı",
      "Yalnızca git; çalışma dizininde üç sabit, salt okunur komutla. Başka hiçbir şey, aldığı hiçbir komut değil.",
    ],
    [
      "globe",
      "Ağ",
      "Varsayılan olarak yok. Enlem ve boylamın ikisi de girilirse 30 dakikada bir open-meteo.com’dan hava durumu ister ve yalnızca bu iki sayıyı gönderir.",
    ],
    [
      "eye",
      "Okuduğu",
      "Model, sürüm, bağlam dağılımı, kullanım limitleri, oturum maliyeti ve klasör adı. Oturumun eklenti durumunda tutulur, diske yazılmaz.",
    ],
    [
      "key",
      "Kimlik bilgileri",
      "Hiçbirini okumaz. Etkinlik günlüğündeki araç girdileri önce yaygın kimlik bilgisi biçimleri için maskelenir.",
    ],
  ],
  faqH: "Sorular",
  faq: [
    [
      "Masaüstü uygulamasında çalışır mı?",
      "Evet. /plugin orada çalışmaz: istem kutusunun yanındaki + simgesine, sonra Plugins’e tıklayın, Add marketplace ile `Derinbay-Labs/console-band` ekleyin, ardından Add plugin.",
    ],
    [
      "Dar bir terminalde ne olur?",
      "100 sütunun altında bant altı kompakt satıra iner: model ve maliyet, canlı durum, bağlam, limitler, önbellek ve klasör.",
    ],
    [
      "Kabuktan kurabilir miyim?",
      "Evet: `claude plugin install console-band --marketplace Derinbay-Labs/console-band`",
    ],
    [
      "Claude Code’un yaptıklarını engelleyebilir ya da değiştirebilir mi?",
      "Hayır. Her hook olayı değiştirmeden iletir ve bant izin kararlarına hiç karışmaz.",
    ],
    [
      "Neleri ayarlayabilirim?",
      "`brand` başlık çizgisindeki adı, `cacheTtlMinutes` 5 ya da 60 dakikalık önbelleği belirler; `city` bir LOC satırı, enlem ve boylam da hava durumunu ekler.",
    ],
  ],
  finalH: "Bandı isteminizin üstüne koyun.",
  finalP: "Claude Code isteminde tek komut. Sonra /plugin update console-band ile güncelleyin.",
  footTag: "Claude Code isteminin üstünde canlı bir durum bandı.",
  footLinks: [
    ["GitHub", "https://github.com/Derinbay-Labs/console-band"],
    ["Gizlilik", "#privacy"],
    ["İletişim", "https://github.com/Derinbay-Labs/console-band/issues"],
    ["MIT lisansı", "https://github.com/Derinbay-Labs/console-band/blob/main/LICENSE"],
  ],
  labs: "Bir Derinbay Labs projesi",
  labsSmall: "Derinbay Labs, tek bir işi iyi yapan küçük yazılımlar geliştirir.",
  copyright: "© 2026 Derinbay Labs",
  footNote: "Bazı bölümler claude-flightdeck’ten (MIT) uyarlanmıştır.",
  footNav: "Alt bilgi",
  title: "console-band: istemin üstünde her şey",
  h1: "İstemin üstünde, her şey.",
  lead: "Claude Code oturumunuzun neyi, ne hızla kullandığını ve neyin çalıştığını, tam yazdığınız yerde gösteren çok satırlı bir bant.",
  scenes: [
    ["session", "Oturum", "Model, döngü, tur"],
    ["usage", "Kullanım", "Bağlam, limit, önbellek"],
    ["work", "İş", "İzin, ajanlar, günlük"],
    ["place", "Konum", "Saat, klasör, git"],
  ],
  notes: {
    session: [
      ["env", "ENV", "Claude Code sürümü, model, oturum maliyeti ve süresi."],
      ["main", "MAIN", "Çalışıyor ya da boşta; efor, izin modu ve istek sayısı."],
      ["turn main", "TURN", "Süren tur; bitince de özeti."],
    ],
    usage: [
      ["ctx", "CONTEXT", "Kategoriye göre bağlam penceresi; pay kesik çizgiyle."],
      ["lim", "SESSION · WEEKLY", "İki limit eşit tempoya göre; fark işaretli."],
      ["cache", "CACHE", "İstem önbelleği soğuyana kadar kalan süre."],
    ],
    work: [
      ["gate", "GATE", "Karara ve türe göre izin kontrolleri."],
      ["agents", "AGENTS", "En fazla üç alt ajan kartı, çalışanlar önde."],
      ["log", "LOG", "Saniyesine kadar zamanlı son üç olay."],
    ],
    place: [
      ["loc", "LOC", "Saat; ayarlarsanız şehir ve hava durumu da."],
      ["foot", "PWD", "Klasör, dal, son commit’in yaşı ve değişmiş dosyalar."],
    ],
  },
  feats: [
    [
      "Alt ajanları çalışırken izleyin",
      "Her alt ajanın bir kartı var: görev, tür ve model, bağlam ve çıktı token’ları, istekler ve geçen süre. Çalışanlar önde.",
    ],
    [
      "Her izin kontrolünü sayın",
      "Geniş terminalde son kararların şeridi; ardından izin verilen, sizin onayladığınız, bekleyen ve reddedilen, dosya, kabuk ve diğer toplamlarıyla.",
    ],
    [
      "Son üç olayı okuyun",
      "Başlatmalar, devirler, düzenlemeler, hatalar ve retler; saniyesine kadar zamanlı ve kimin yaptığıyla etiketli.",
    ],
  ],
  gl: [
    ["✓", "k-gr", "izin verildi"],
    ["✓", "k-cl", "sizin onayınız"],
    ["?", "k-y", "bekliyor"],
    ["✗", "k-r", "reddedildi"],
  ],
  skip: "İçeriğe geç",
  description:
    "Claude Code isteminin üstünde çok satırlı bir durum bandı: bağlam, oturum ve haftalık limitler, önbellek geri sayımı, alt ajanlar ve git. Ücretsiz, MIT lisanslı.",
};
