import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SUPPORTED_LANGUAGES, LanguageCode } from "../../../shared/countries";

// Translation keys type
type TranslationKey = keyof typeof translations.en;

// Translations object
const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.shop": "Shop",
    "nav.products": "Products",
    "nav.crowdfund": "Crowdfund",
    "nav.franchise": "Franchise",
    "nav.nft": "NFT Gallery",
    "nav.leaderboard": "Leaderboard",
    "nav.blog": "Blog",
    "nav.investors": "Investors",
    "nav.about": "About",
    "nav.login": "Login",
    "nav.profile": "Profile",
    "nav.orders": "Orders",
    "nav.logout": "Logout",
    
    // Common
    "common.loading": "Loading...",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.search": "Search",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.viewMore": "View More",
    "common.learnMore": "Learn More",
    "common.getStarted": "Get Started",
    "common.joinNow": "Join Now",
    "common.preOrder": "Pre-Order Now",
    "common.backRelaunch": "Back the Relaunch",
    
    // Home page
    "home.hero.title": "THE RELAUNCH",
    "home.hero.subtitle": "The legendary energy drink is back. Be part of history.",
    "home.hero.cta": "Pre-Order Now",
    "home.stats.backers": "Backers",
    "home.stats.raised": "Raised",
    "home.stats.preorders": "Pre-Orders",
    "home.stats.countries": "Countries",
    
    // Shop
    "shop.title": "Shop",
    "shop.addToCart": "Add to Cart",
    "shop.checkout": "Checkout",
    "shop.price": "Price",
    "shop.quantity": "Quantity",
    "shop.total": "Total",
    "shop.freeShipping": "Free Shipping",
    
    // Crowdfund
    "crowdfund.title": "Back the Relaunch",
    "crowdfund.subtitle": "Join the movement and help bring NEON back",
    "crowdfund.contribute": "Contribute",
    "crowdfund.rewards": "Rewards",
    
    // Franchise
    "franchise.title": "Franchise Opportunity",
    "franchise.subtitle": "Own your territory and build your empire",
    "franchise.apply": "Apply Now",
    "franchise.territory": "Select Territory",
    
    // NFT
    "nft.title": "NFT Gallery",
    "nft.subtitle": "Exclusive digital collectibles",
    "nft.mint": "Mint NFT",
    "nft.rarity": "Rarity",
    
    // Investors
    "investors.title": "Investor Relations",
    "investors.subtitle": "Join us in revolutionizing the energy drink industry",
    "investors.inquire": "Submit Inquiry",
    
    // Footer
    "footer.rights": "All rights reserved",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.contact": "Contact Us",
    
    // Chat
    "chat.welcome": "Welcome! How can I help you today?",
    "chat.placeholder": "Type your message...",
    "chat.send": "Send",
  },
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.shop": "Tienda",
    "nav.products": "Productos",
    "nav.crowdfund": "Crowdfund",
    "nav.franchise": "Franquicia",
    "nav.nft": "Galería NFT",
    "nav.leaderboard": "Clasificación",
    "nav.blog": "Blog",
    "nav.investors": "Inversores",
    "nav.about": "Acerca de",
    "nav.login": "Iniciar Sesión",
    "nav.profile": "Perfil",
    "nav.orders": "Pedidos",
    "nav.logout": "Cerrar Sesión",
    
    // Common
    "common.loading": "Cargando...",
    "common.submit": "Enviar",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.search": "Buscar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.previous": "Anterior",
    "common.viewMore": "Ver Más",
    "common.learnMore": "Más Información",
    "common.getStarted": "Comenzar",
    "common.joinNow": "Únete Ahora",
    "common.preOrder": "Pre-Ordenar",
    "common.backRelaunch": "Apoya el Relanzamiento",
    
    // Home page
    "home.hero.title": "EL RELANZAMIENTO",
    "home.hero.subtitle": "La legendaria bebida energética ha vuelto. Sé parte de la historia.",
    "home.hero.cta": "Pre-Ordenar Ahora",
    "home.stats.backers": "Patrocinadores",
    "home.stats.raised": "Recaudado",
    "home.stats.preorders": "Pre-Pedidos",
    "home.stats.countries": "Países",
    
    // Shop
    "shop.title": "Tienda",
    "shop.addToCart": "Añadir al Carrito",
    "shop.checkout": "Pagar",
    "shop.price": "Precio",
    "shop.quantity": "Cantidad",
    "shop.total": "Total",
    "shop.freeShipping": "Envío Gratis",
    
    // Crowdfund
    "crowdfund.title": "Apoya el Relanzamiento",
    "crowdfund.subtitle": "Únete al movimiento y ayuda a traer NEON de vuelta",
    "crowdfund.contribute": "Contribuir",
    "crowdfund.rewards": "Recompensas",
    
    // Franchise
    "franchise.title": "Oportunidad de Franquicia",
    "franchise.subtitle": "Posee tu territorio y construye tu imperio",
    "franchise.apply": "Aplicar Ahora",
    "franchise.territory": "Seleccionar Territorio",
    
    // NFT
    "nft.title": "Galería NFT",
    "nft.subtitle": "Coleccionables digitales exclusivos",
    "nft.mint": "Acuñar NFT",
    "nft.rarity": "Rareza",
    
    // Investors
    "investors.title": "Relaciones con Inversores",
    "investors.subtitle": "Únete a nosotros para revolucionar la industria de bebidas energéticas",
    "investors.inquire": "Enviar Consulta",
    
    // Footer
    "footer.rights": "Todos los derechos reservados",
    "footer.privacy": "Política de Privacidad",
    "footer.terms": "Términos de Servicio",
    "footer.contact": "Contáctenos",
    
    // Chat
    "chat.welcome": "¡Bienvenido! ¿Cómo puedo ayudarte hoy?",
    "chat.placeholder": "Escribe tu mensaje...",
    "chat.send": "Enviar",
  },
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.shop": "Boutique",
    "nav.products": "Produits",
    "nav.crowdfund": "Crowdfund",
    "nav.franchise": "Franchise",
    "nav.nft": "Galerie NFT",
    "nav.leaderboard": "Classement",
    "nav.blog": "Blog",
    "nav.investors": "Investisseurs",
    "nav.about": "À Propos",
    "nav.login": "Connexion",
    "nav.profile": "Profil",
    "nav.orders": "Commandes",
    "nav.logout": "Déconnexion",
    
    // Common
    "common.loading": "Chargement...",
    "common.submit": "Soumettre",
    "common.cancel": "Annuler",
    "common.save": "Enregistrer",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",
    "common.search": "Rechercher",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.previous": "Précédent",
    "common.viewMore": "Voir Plus",
    "common.learnMore": "En Savoir Plus",
    "common.getStarted": "Commencer",
    "common.joinNow": "Rejoindre",
    "common.preOrder": "Pré-Commander",
    "common.backRelaunch": "Soutenir le Relancement",
    
    // Home page
    "home.hero.title": "LE RELANCEMENT",
    "home.hero.subtitle": "La légendaire boisson énergétique est de retour. Faites partie de l'histoire.",
    "home.hero.cta": "Pré-Commander",
    "home.stats.backers": "Contributeurs",
    "home.stats.raised": "Collecté",
    "home.stats.preorders": "Pré-Commandes",
    "home.stats.countries": "Pays",
    
    // Shop
    "shop.title": "Boutique",
    "shop.addToCart": "Ajouter au Panier",
    "shop.checkout": "Paiement",
    "shop.price": "Prix",
    "shop.quantity": "Quantité",
    "shop.total": "Total",
    "shop.freeShipping": "Livraison Gratuite",
    
    // Crowdfund
    "crowdfund.title": "Soutenir le Relancement",
    "crowdfund.subtitle": "Rejoignez le mouvement et aidez à ramener NEON",
    "crowdfund.contribute": "Contribuer",
    "crowdfund.rewards": "Récompenses",
    
    // Franchise
    "franchise.title": "Opportunité de Franchise",
    "franchise.subtitle": "Possédez votre territoire et construisez votre empire",
    "franchise.apply": "Postuler",
    "franchise.territory": "Sélectionner Territoire",
    
    // NFT
    "nft.title": "Galerie NFT",
    "nft.subtitle": "Objets de collection numériques exclusifs",
    "nft.mint": "Créer NFT",
    "nft.rarity": "Rareté",
    
    // Investors
    "investors.title": "Relations Investisseurs",
    "investors.subtitle": "Rejoignez-nous pour révolutionner l'industrie des boissons énergétiques",
    "investors.inquire": "Soumettre une Demande",
    
    // Footer
    "footer.rights": "Tous droits réservés",
    "footer.privacy": "Politique de Confidentialité",
    "footer.terms": "Conditions d'Utilisation",
    "footer.contact": "Nous Contacter",
    
    // Chat
    "chat.welcome": "Bienvenue! Comment puis-je vous aider aujourd'hui?",
    "chat.placeholder": "Tapez votre message...",
    "chat.send": "Envoyer",
  },
  de: {
    // Navigation
    "nav.home": "Startseite",
    "nav.shop": "Shop",
    "nav.products": "Produkte",
    "nav.crowdfund": "Crowdfund",
    "nav.franchise": "Franchise",
    "nav.nft": "NFT Galerie",
    "nav.leaderboard": "Rangliste",
    "nav.blog": "Blog",
    "nav.investors": "Investoren",
    "nav.about": "Über Uns",
    "nav.login": "Anmelden",
    "nav.profile": "Profil",
    "nav.orders": "Bestellungen",
    "nav.logout": "Abmelden",
    
    // Common
    "common.loading": "Laden...",
    "common.submit": "Absenden",
    "common.cancel": "Abbrechen",
    "common.save": "Speichern",
    "common.edit": "Bearbeiten",
    "common.delete": "Löschen",
    "common.search": "Suchen",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.previous": "Zurück",
    "common.viewMore": "Mehr Anzeigen",
    "common.learnMore": "Mehr Erfahren",
    "common.getStarted": "Loslegen",
    "common.joinNow": "Jetzt Beitreten",
    "common.preOrder": "Vorbestellen",
    "common.backRelaunch": "Relaunch Unterstützen",
    
    // Home page
    "home.hero.title": "DER RELAUNCH",
    "home.hero.subtitle": "Das legendäre Energy-Drink ist zurück. Sei Teil der Geschichte.",
    "home.hero.cta": "Jetzt Vorbestellen",
    "home.stats.backers": "Unterstützer",
    "home.stats.raised": "Gesammelt",
    "home.stats.preorders": "Vorbestellungen",
    "home.stats.countries": "Länder",
    
    // Shop
    "shop.title": "Shop",
    "shop.addToCart": "In den Warenkorb",
    "shop.checkout": "Zur Kasse",
    "shop.price": "Preis",
    "shop.quantity": "Menge",
    "shop.total": "Gesamt",
    "shop.freeShipping": "Kostenloser Versand",
    
    // Crowdfund
    "crowdfund.title": "Relaunch Unterstützen",
    "crowdfund.subtitle": "Werde Teil der Bewegung und hilf NEON zurückzubringen",
    "crowdfund.contribute": "Beitragen",
    "crowdfund.rewards": "Belohnungen",
    
    // Franchise
    "franchise.title": "Franchise-Möglichkeit",
    "franchise.subtitle": "Besitze dein Gebiet und baue dein Imperium auf",
    "franchise.apply": "Jetzt Bewerben",
    "franchise.territory": "Gebiet Auswählen",
    
    // NFT
    "nft.title": "NFT Galerie",
    "nft.subtitle": "Exklusive digitale Sammlerstücke",
    "nft.mint": "NFT Prägen",
    "nft.rarity": "Seltenheit",
    
    // Investors
    "investors.title": "Investor Relations",
    "investors.subtitle": "Begleiten Sie uns bei der Revolution der Energy-Drink-Industrie",
    "investors.inquire": "Anfrage Senden",
    
    // Footer
    "footer.rights": "Alle Rechte vorbehalten",
    "footer.privacy": "Datenschutzrichtlinie",
    "footer.terms": "Nutzungsbedingungen",
    "footer.contact": "Kontakt",
    
    // Chat
    "chat.welcome": "Willkommen! Wie kann ich Ihnen heute helfen?",
    "chat.placeholder": "Nachricht eingeben...",
    "chat.send": "Senden",
  },
  it: {
    // Navigation
    "nav.home": "Home",
    "nav.shop": "Negozio",
    "nav.products": "Prodotti",
    "nav.crowdfund": "Crowdfund",
    "nav.franchise": "Franchising",
    "nav.nft": "Galleria NFT",
    "nav.leaderboard": "Classifica",
    "nav.blog": "Blog",
    "nav.investors": "Investitori",
    "nav.about": "Chi Siamo",
    "nav.login": "Accedi",
    "nav.profile": "Profilo",
    "nav.orders": "Ordini",
    "nav.logout": "Esci",
    
    // Common
    "common.loading": "Caricamento...",
    "common.submit": "Invia",
    "common.cancel": "Annulla",
    "common.save": "Salva",
    "common.edit": "Modifica",
    "common.delete": "Elimina",
    "common.search": "Cerca",
    "common.back": "Indietro",
    "common.next": "Avanti",
    "common.previous": "Precedente",
    "common.viewMore": "Vedi Altro",
    "common.learnMore": "Scopri di Più",
    "common.getStarted": "Inizia",
    "common.joinNow": "Unisciti Ora",
    "common.preOrder": "Pre-Ordina",
    "common.backRelaunch": "Sostieni il Rilancio",
    
    // Home page
    "home.hero.title": "IL RILANCIO",
    "home.hero.subtitle": "La leggendaria bevanda energetica è tornata. Fai parte della storia.",
    "home.hero.cta": "Pre-Ordina Ora",
    "home.stats.backers": "Sostenitori",
    "home.stats.raised": "Raccolto",
    "home.stats.preorders": "Pre-Ordini",
    "home.stats.countries": "Paesi",
    
    // Shop
    "shop.title": "Negozio",
    "shop.addToCart": "Aggiungi al Carrello",
    "shop.checkout": "Checkout",
    "shop.price": "Prezzo",
    "shop.quantity": "Quantità",
    "shop.total": "Totale",
    "shop.freeShipping": "Spedizione Gratuita",
    
    // Crowdfund
    "crowdfund.title": "Sostieni il Rilancio",
    "crowdfund.subtitle": "Unisciti al movimento e aiuta a riportare NEON",
    "crowdfund.contribute": "Contribuisci",
    "crowdfund.rewards": "Ricompense",
    
    // Franchise
    "franchise.title": "Opportunità di Franchising",
    "franchise.subtitle": "Possiedi il tuo territorio e costruisci il tuo impero",
    "franchise.apply": "Candidati Ora",
    "franchise.territory": "Seleziona Territorio",
    
    // NFT
    "nft.title": "Galleria NFT",
    "nft.subtitle": "Oggetti da collezione digitali esclusivi",
    "nft.mint": "Crea NFT",
    "nft.rarity": "Rarità",
    
    // Investors
    "investors.title": "Relazioni con gli Investitori",
    "investors.subtitle": "Unisciti a noi per rivoluzionare l'industria delle bevande energetiche",
    "investors.inquire": "Invia Richiesta",
    
    // Footer
    "footer.rights": "Tutti i diritti riservati",
    "footer.privacy": "Informativa sulla Privacy",
    "footer.terms": "Termini di Servizio",
    "footer.contact": "Contattaci",
    
    // Chat
    "chat.welcome": "Benvenuto! Come posso aiutarti oggi?",
    "chat.placeholder": "Scrivi il tuo messaggio...",
    "chat.send": "Invia",
  },
  zh: {
    // Navigation
    "nav.home": "首页",
    "nav.shop": "商店",
    "nav.products": "产品",
    "nav.crowdfund": "众筹",
    "nav.franchise": "加盟",
    "nav.nft": "NFT画廊",
    "nav.leaderboard": "排行榜",
    "nav.blog": "博客",
    "nav.investors": "投资者",
    "nav.about": "关于我们",
    "nav.login": "登录",
    "nav.profile": "个人资料",
    "nav.orders": "订单",
    "nav.logout": "退出",
    
    // Common
    "common.loading": "加载中...",
    "common.submit": "提交",
    "common.cancel": "取消",
    "common.save": "保存",
    "common.edit": "编辑",
    "common.delete": "删除",
    "common.search": "搜索",
    "common.back": "返回",
    "common.next": "下一步",
    "common.previous": "上一步",
    "common.viewMore": "查看更多",
    "common.learnMore": "了解更多",
    "common.getStarted": "开始",
    "common.joinNow": "立即加入",
    "common.preOrder": "预订",
    "common.backRelaunch": "支持重新发布",
    
    // Home page
    "home.hero.title": "重新发布",
    "home.hero.subtitle": "传奇能量饮料回归。成为历史的一部分。",
    "home.hero.cta": "立即预订",
    "home.stats.backers": "支持者",
    "home.stats.raised": "已筹集",
    "home.stats.preorders": "预订数",
    "home.stats.countries": "国家",
    
    // Shop
    "shop.title": "商店",
    "shop.addToCart": "加入购物车",
    "shop.checkout": "结账",
    "shop.price": "价格",
    "shop.quantity": "数量",
    "shop.total": "总计",
    "shop.freeShipping": "免费送货",
    
    // Crowdfund
    "crowdfund.title": "支持重新发布",
    "crowdfund.subtitle": "加入运动，帮助NEON回归",
    "crowdfund.contribute": "贡献",
    "crowdfund.rewards": "奖励",
    
    // Franchise
    "franchise.title": "加盟机会",
    "franchise.subtitle": "拥有您的领地，建立您的帝国",
    "franchise.apply": "立即申请",
    "franchise.territory": "选择区域",
    
    // NFT
    "nft.title": "NFT画廊",
    "nft.subtitle": "独家数字收藏品",
    "nft.mint": "铸造NFT",
    "nft.rarity": "稀有度",
    
    // Investors
    "investors.title": "投资者关系",
    "investors.subtitle": "加入我们，革新能量饮料行业",
    "investors.inquire": "提交咨询",
    
    // Footer
    "footer.rights": "版权所有",
    "footer.privacy": "隐私政策",
    "footer.terms": "服务条款",
    "footer.contact": "联系我们",
    
    // Chat
    "chat.welcome": "欢迎！今天我能帮您什么？",
    "chat.placeholder": "输入您的消息...",
    "chat.send": "发送",
  },
  ja: {
    // Navigation
    "nav.home": "ホーム",
    "nav.shop": "ショップ",
    "nav.products": "製品",
    "nav.crowdfund": "クラウドファンド",
    "nav.franchise": "フランチャイズ",
    "nav.nft": "NFTギャラリー",
    "nav.leaderboard": "ランキング",
    "nav.blog": "ブログ",
    "nav.investors": "投資家",
    "nav.about": "会社概要",
    "nav.login": "ログイン",
    "nav.profile": "プロフィール",
    "nav.orders": "注文",
    "nav.logout": "ログアウト",
    
    // Common
    "common.loading": "読み込み中...",
    "common.submit": "送信",
    "common.cancel": "キャンセル",
    "common.save": "保存",
    "common.edit": "編集",
    "common.delete": "削除",
    "common.search": "検索",
    "common.back": "戻る",
    "common.next": "次へ",
    "common.previous": "前へ",
    "common.viewMore": "もっと見る",
    "common.learnMore": "詳細を見る",
    "common.getStarted": "始める",
    "common.joinNow": "今すぐ参加",
    "common.preOrder": "予約注文",
    "common.backRelaunch": "リローンチを支援",
    
    // Home page
    "home.hero.title": "リローンチ",
    "home.hero.subtitle": "伝説のエナジードリンクが復活。歴史の一部になろう。",
    "home.hero.cta": "今すぐ予約",
    "home.stats.backers": "支援者",
    "home.stats.raised": "調達額",
    "home.stats.preorders": "予約数",
    "home.stats.countries": "国",
    
    // Shop
    "shop.title": "ショップ",
    "shop.addToCart": "カートに追加",
    "shop.checkout": "チェックアウト",
    "shop.price": "価格",
    "shop.quantity": "数量",
    "shop.total": "合計",
    "shop.freeShipping": "送料無料",
    
    // Crowdfund
    "crowdfund.title": "リローンチを支援",
    "crowdfund.subtitle": "ムーブメントに参加してNEONを復活させよう",
    "crowdfund.contribute": "貢献する",
    "crowdfund.rewards": "リワード",
    
    // Franchise
    "franchise.title": "フランチャイズ機会",
    "franchise.subtitle": "あなたのテリトリーを所有し、帝国を築こう",
    "franchise.apply": "今すぐ申し込む",
    "franchise.territory": "テリトリーを選択",
    
    // NFT
    "nft.title": "NFTギャラリー",
    "nft.subtitle": "限定デジタルコレクティブル",
    "nft.mint": "NFTを作成",
    "nft.rarity": "レアリティ",
    
    // Investors
    "investors.title": "投資家向け情報",
    "investors.subtitle": "エナジードリンク業界の革命に参加しよう",
    "investors.inquire": "お問い合わせ",
    
    // Footer
    "footer.rights": "全著作権所有",
    "footer.privacy": "プライバシーポリシー",
    "footer.terms": "利用規約",
    "footer.contact": "お問い合わせ",
    
    // Chat
    "chat.welcome": "ようこそ！本日はどのようなご用件でしょうか？",
    "chat.placeholder": "メッセージを入力...",
    "chat.send": "送信",
  },
} as const;

// Add remaining languages with English fallback
const additionalLanguages = ["pt", "ko", "ar", "ru", "nl", "pl", "sv"] as const;
additionalLanguages.forEach(lang => {
  (translations as any)[lang] = translations.en;
});

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  availableLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem("neon-language") as LanguageCode | null;
    if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
      setLanguageState(savedLang);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as LanguageCode;
      if (SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("neon-language", lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  };

  const t = (key: TranslationKey): string => {
    const langTranslations = (translations as any)[language] || translations.en;
    return langTranslations[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export { translations };
