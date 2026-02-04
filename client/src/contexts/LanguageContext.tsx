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
    
    // Products page
    "products.title": "Our Products",
    "products.subtitle": "Clean energy for every lifestyle",
    "products.original": "NEON Original",
    "products.organic": "NEON Organic",
    "products.ingredients": "Natural Ingredients",
    "products.caffeine": "Natural Caffeine",
    "products.sugar": "Zero Sugar",
    "products.calories": "Low Calories",
    "products.vegan": "100% Vegan",
    "products.nonGmo": "Non-GMO",
    
    // About page
    "about.title": "Our Story",
    "about.subtitle": "The journey of NEON Energy",
    "about.mission": "Our Mission",
    "about.missionText": "To provide clean, sustainable energy without compromise",
    "about.vision": "Our Vision",
    "about.visionText": "A world where energy drinks are healthy and sustainable",
    "about.values": "Our Values",
    "about.quality": "Quality",
    "about.sustainability": "Sustainability",
    "about.innovation": "Innovation",
    "about.community": "Community",
    
    // Compensation page
    "compensation.title": "Compensation Plan",
    "compensation.subtitle": "Build your business with NEON",
    "compensation.unilevel": "Unilevel Plan",
    "compensation.binary": "Binary Bonus",
    "compensation.rank": "Rank Advancement",
    "compensation.commission": "Commission",
    "compensation.bonus": "Bonus",
    "compensation.requirements": "Requirements",
    "compensation.downloadPdf": "Download PDF",
    
    // Distributor portal
    "distributor.dashboard": "Dashboard",
    "distributor.team": "My Team",
    "distributor.sales": "Sales",
    "distributor.commissions": "Commissions",
    "distributor.marketing": "Marketing Materials",
    "distributor.training": "Training",
    "distributor.profile": "Profile",
    "distributor.genealogy": "Team Genealogy",
    "distributor.enrollNew": "Enroll New Member",
    "distributor.totalSales": "Total Sales",
    "distributor.teamSize": "Team Size",
    "distributor.currentRank": "Current Rank",
    "distributor.nextRank": "Next Rank",
    
    // Countdown
    "countdown.days": "Days",
    "countdown.hours": "Hours",
    "countdown.minutes": "Minutes",
    "countdown.seconds": "Seconds",
    "countdown.launching": "Launching In",
    
    // Forms
    "form.firstName": "First Name",
    "form.lastName": "Last Name",
    "form.email": "Email Address",
    "form.phone": "Phone Number",
    "form.address": "Address",
    "form.city": "City",
    "form.state": "State/Province",
    "form.zip": "ZIP/Postal Code",
    "form.country": "Country",
    "form.message": "Message",
    "form.required": "Required",
    "form.optional": "Optional",
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
    
    // Products page
    "products.title": "Nuestros Productos",
    "products.subtitle": "Energía limpia para cada estilo de vida",
    "products.original": "NEON Original",
    "products.organic": "NEON Orgánico",
    "products.ingredients": "Ingredientes Naturales",
    "products.caffeine": "Cafeína Natural",
    "products.sugar": "Sin Azúcar",
    "products.calories": "Bajas Calorías",
    "products.vegan": "100% Vegano",
    "products.nonGmo": "Sin OGM",
    
    // About page
    "about.title": "Nuestra Historia",
    "about.subtitle": "El viaje de NEON Energy",
    "about.mission": "Nuestra Misión",
    "about.missionText": "Proporcionar energía limpia y sostenible sin compromisos",
    "about.vision": "Nuestra Visión",
    "about.visionText": "Un mundo donde las bebidas energéticas son saludables y sostenibles",
    "about.values": "Nuestros Valores",
    "about.quality": "Calidad",
    "about.sustainability": "Sostenibilidad",
    "about.innovation": "Innovación",
    "about.community": "Comunidad",
    
    // Compensation page
    "compensation.title": "Plan de Compensación",
    "compensation.subtitle": "Construye tu negocio con NEON",
    "compensation.unilevel": "Plan Uninivel",
    "compensation.binary": "Bono Binario",
    "compensation.rank": "Avance de Rango",
    "compensation.commission": "Comisión",
    "compensation.bonus": "Bono",
    "compensation.requirements": "Requisitos",
    "compensation.downloadPdf": "Descargar PDF",
    
    // Distributor portal
    "distributor.dashboard": "Panel de Control",
    "distributor.team": "Mi Equipo",
    "distributor.sales": "Ventas",
    "distributor.commissions": "Comisiones",
    "distributor.marketing": "Materiales de Marketing",
    "distributor.training": "Capacitación",
    "distributor.profile": "Perfil",
    "distributor.genealogy": "Genealogía del Equipo",
    "distributor.enrollNew": "Inscribir Nuevo Miembro",
    "distributor.totalSales": "Ventas Totales",
    "distributor.teamSize": "Tamaño del Equipo",
    "distributor.currentRank": "Rango Actual",
    "distributor.nextRank": "Siguiente Rango",
    
    // Countdown
    "countdown.days": "Días",
    "countdown.hours": "Horas",
    "countdown.minutes": "Minutos",
    "countdown.seconds": "Segundos",
    "countdown.launching": "Lanzamiento En",
    
    // Forms
    "form.firstName": "Nombre",
    "form.lastName": "Apellido",
    "form.email": "Correo Electrónico",
    "form.phone": "Teléfono",
    "form.address": "Dirección",
    "form.city": "Ciudad",
    "form.state": "Estado/Provincia",
    "form.zip": "Código Postal",
    "form.country": "País",
    "form.message": "Mensaje",
    "form.required": "Requerido",
    "form.optional": "Opcional",
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
    
    // Products page
    "products.title": "Nos Produits",
    "products.subtitle": "Énergie propre pour chaque style de vie",
    "products.original": "NEON Original",
    "products.organic": "NEON Bio",
    "products.ingredients": "Ingrédients Naturels",
    "products.caffeine": "Caféine Naturelle",
    "products.sugar": "Sans Sucre",
    "products.calories": "Faibles Calories",
    "products.vegan": "100% Végan",
    "products.nonGmo": "Sans OGM",
    
    // About page
    "about.title": "Notre Histoire",
    "about.subtitle": "Le parcours de NEON Energy",
    "about.mission": "Notre Mission",
    "about.missionText": "Fournir une énergie propre et durable sans compromis",
    "about.vision": "Notre Vision",
    "about.visionText": "Un monde où les boissons énergétiques sont saines et durables",
    "about.values": "Nos Valeurs",
    "about.quality": "Qualité",
    "about.sustainability": "Durabilité",
    "about.innovation": "Innovation",
    "about.community": "Communauté",
    
    // Compensation page
    "compensation.title": "Plan de Rémunération",
    "compensation.subtitle": "Construisez votre entreprise avec NEON",
    "compensation.unilevel": "Plan Unilevel",
    "compensation.binary": "Bonus Binaire",
    "compensation.rank": "Avancement de Rang",
    "compensation.commission": "Commission",
    "compensation.bonus": "Bonus",
    "compensation.requirements": "Exigences",
    "compensation.downloadPdf": "Télécharger PDF",
    
    // Distributor portal
    "distributor.dashboard": "Tableau de Bord",
    "distributor.team": "Mon Équipe",
    "distributor.sales": "Ventes",
    "distributor.commissions": "Commissions",
    "distributor.marketing": "Matériels Marketing",
    "distributor.training": "Formation",
    "distributor.profile": "Profil",
    "distributor.genealogy": "Généalogie de l'Équipe",
    "distributor.enrollNew": "Inscrire Nouveau Membre",
    "distributor.totalSales": "Ventes Totales",
    "distributor.teamSize": "Taille de l'Équipe",
    "distributor.currentRank": "Rang Actuel",
    "distributor.nextRank": "Rang Suivant",
    
    // Countdown
    "countdown.days": "Jours",
    "countdown.hours": "Heures",
    "countdown.minutes": "Minutes",
    "countdown.seconds": "Secondes",
    "countdown.launching": "Lancement Dans",
    
    // Forms
    "form.firstName": "Prénom",
    "form.lastName": "Nom",
    "form.email": "Adresse Email",
    "form.phone": "Téléphone",
    "form.address": "Adresse",
    "form.city": "Ville",
    "form.state": "État/Province",
    "form.zip": "Code Postal",
    "form.country": "Pays",
    "form.message": "Message",
    "form.required": "Requis",
    "form.optional": "Optionnel",
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
    
    // Products page
    "products.title": "Unsere Produkte",
    "products.subtitle": "Saubere Energie für jeden Lebensstil",
    "products.original": "NEON Original",
    "products.organic": "NEON Bio",
    "products.ingredients": "Natürliche Zutaten",
    "products.caffeine": "Natürliches Koffein",
    "products.sugar": "Ohne Zucker",
    "products.calories": "Wenig Kalorien",
    "products.vegan": "100% Vegan",
    "products.nonGmo": "Ohne GVO",
    
    // About page
    "about.title": "Unsere Geschichte",
    "about.subtitle": "Die Reise von NEON Energy",
    "about.mission": "Unsere Mission",
    "about.missionText": "Saubere, nachhaltige Energie ohne Kompromisse liefern",
    "about.vision": "Unsere Vision",
    "about.visionText": "Eine Welt, in der Energy-Drinks gesund und nachhaltig sind",
    "about.values": "Unsere Werte",
    "about.quality": "Qualität",
    "about.sustainability": "Nachhaltigkeit",
    "about.innovation": "Innovation",
    "about.community": "Gemeinschaft",
    
    // Compensation page
    "compensation.title": "Vergütungsplan",
    "compensation.subtitle": "Bauen Sie Ihr Geschäft mit NEON auf",
    "compensation.unilevel": "Unilevel-Plan",
    "compensation.binary": "Binärbonus",
    "compensation.rank": "Rangaufstieg",
    "compensation.commission": "Provision",
    "compensation.bonus": "Bonus",
    "compensation.requirements": "Anforderungen",
    "compensation.downloadPdf": "PDF Herunterladen",
    
    // Distributor portal
    "distributor.dashboard": "Dashboard",
    "distributor.team": "Mein Team",
    "distributor.sales": "Verkäufe",
    "distributor.commissions": "Provisionen",
    "distributor.marketing": "Marketing-Materialien",
    "distributor.training": "Schulung",
    "distributor.profile": "Profil",
    "distributor.genealogy": "Team-Genealogie",
    "distributor.enrollNew": "Neues Mitglied Einschreiben",
    "distributor.totalSales": "Gesamtumsatz",
    "distributor.teamSize": "Teamgröße",
    "distributor.currentRank": "Aktueller Rang",
    "distributor.nextRank": "Nächster Rang",
    
    // Countdown
    "countdown.days": "Tage",
    "countdown.hours": "Stunden",
    "countdown.minutes": "Minuten",
    "countdown.seconds": "Sekunden",
    "countdown.launching": "Start In",
    
    // Forms
    "form.firstName": "Vorname",
    "form.lastName": "Nachname",
    "form.email": "E-Mail-Adresse",
    "form.phone": "Telefon",
    "form.address": "Adresse",
    "form.city": "Stadt",
    "form.state": "Bundesland",
    "form.zip": "Postleitzahl",
    "form.country": "Land",
    "form.message": "Nachricht",
    "form.required": "Erforderlich",
    "form.optional": "Optional",
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
    
    // Products page
    "products.title": "I Nostri Prodotti",
    "products.subtitle": "Energia pulita per ogni stile di vita",
    "products.original": "NEON Original",
    "products.organic": "NEON Biologico",
    "products.ingredients": "Ingredienti Naturali",
    "products.caffeine": "Caffeina Naturale",
    "products.sugar": "Senza Zucchero",
    "products.calories": "Poche Calorie",
    "products.vegan": "100% Vegano",
    "products.nonGmo": "Senza OGM",
    
    // About page
    "about.title": "La Nostra Storia",
    "about.subtitle": "Il viaggio di NEON Energy",
    "about.mission": "La Nostra Missione",
    "about.missionText": "Fornire energia pulita e sostenibile senza compromessi",
    "about.vision": "La Nostra Visione",
    "about.visionText": "Un mondo dove le bevande energetiche sono sane e sostenibili",
    "about.values": "I Nostri Valori",
    "about.quality": "Qualità",
    "about.sustainability": "Sostenibilità",
    "about.innovation": "Innovazione",
    "about.community": "Comunità",
    
    // Compensation page
    "compensation.title": "Piano di Compensazione",
    "compensation.subtitle": "Costruisci il tuo business con NEON",
    "compensation.unilevel": "Piano Unilevel",
    "compensation.binary": "Bonus Binario",
    "compensation.rank": "Avanzamento di Grado",
    "compensation.commission": "Commissione",
    "compensation.bonus": "Bonus",
    "compensation.requirements": "Requisiti",
    "compensation.downloadPdf": "Scarica PDF",
    
    // Distributor portal
    "distributor.dashboard": "Pannello di Controllo",
    "distributor.team": "Il Mio Team",
    "distributor.sales": "Vendite",
    "distributor.commissions": "Commissioni",
    "distributor.marketing": "Materiali Marketing",
    "distributor.training": "Formazione",
    "distributor.profile": "Profilo",
    "distributor.genealogy": "Genealogia del Team",
    "distributor.enrollNew": "Iscrivere Nuovo Membro",
    "distributor.totalSales": "Vendite Totali",
    "distributor.teamSize": "Dimensione Team",
    "distributor.currentRank": "Grado Attuale",
    "distributor.nextRank": "Prossimo Grado",
    
    // Countdown
    "countdown.days": "Giorni",
    "countdown.hours": "Ore",
    "countdown.minutes": "Minuti",
    "countdown.seconds": "Secondi",
    "countdown.launching": "Lancio Tra",
    
    // Forms
    "form.firstName": "Nome",
    "form.lastName": "Cognome",
    "form.email": "Indirizzo Email",
    "form.phone": "Telefono",
    "form.address": "Indirizzo",
    "form.city": "Città",
    "form.state": "Stato/Provincia",
    "form.zip": "CAP",
    "form.country": "Paese",
    "form.message": "Messaggio",
    "form.required": "Obbligatorio",
    "form.optional": "Opzionale",
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
    
    // Products page
    "products.title": "我们的产品",
    "products.subtitle": "适合每种生活方式的清洁能量",
    "products.original": "NEON 原版",
    "products.organic": "NEON 有机",
    "products.ingredients": "天然成分",
    "products.caffeine": "天然咖啡因",
    "products.sugar": "零糖",
    "products.calories": "低卡路里",
    "products.vegan": "100% 素食",
    "products.nonGmo": "非转基因",
    
    // About page
    "about.title": "我们的故事",
    "about.subtitle": "NEON Energy 的旅程",
    "about.mission": "我们的使命",
    "about.missionText": "提供清洁、可持续的能量，永不妥协",
    "about.vision": "我们的愿景",
    "about.visionText": "一个能量饮料健康可持续的世界",
    "about.values": "我们的价值观",
    "about.quality": "质量",
    "about.sustainability": "可持续性",
    "about.innovation": "创新",
    "about.community": "社区",
    
    // Compensation page
    "compensation.title": "薪酬计划",
    "compensation.subtitle": "与 NEON 一起建立您的事业",
    "compensation.unilevel": "单层计划",
    "compensation.binary": "双轨奖金",
    "compensation.rank": "级别晋升",
    "compensation.commission": "佣金",
    "compensation.bonus": "奖金",
    "compensation.requirements": "要求",
    "compensation.downloadPdf": "下载 PDF",
    
    // Distributor portal
    "distributor.dashboard": "仪表板",
    "distributor.team": "我的团队",
    "distributor.sales": "销售",
    "distributor.commissions": "佣金",
    "distributor.marketing": "营销材料",
    "distributor.training": "培训",
    "distributor.profile": "个人资料",
    "distributor.genealogy": "团队家谱",
    "distributor.enrollNew": "注册新成员",
    "distributor.totalSales": "总销售额",
    "distributor.teamSize": "团队规模",
    "distributor.currentRank": "当前级别",
    "distributor.nextRank": "下一级别",
    
    // Countdown
    "countdown.days": "天",
    "countdown.hours": "小时",
    "countdown.minutes": "分钟",
    "countdown.seconds": "秒",
    "countdown.launching": "启动倒计时",
    
    // Forms
    "form.firstName": "名",
    "form.lastName": "姓",
    "form.email": "电子邮箱",
    "form.phone": "电话",
    "form.address": "地址",
    "form.city": "城市",
    "form.state": "省/州",
    "form.zip": "邮编",
    "form.country": "国家",
    "form.message": "消息",
    "form.required": "必填",
    "form.optional": "可选",
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
    
    // Products page
    "products.title": "製品一覧",
    "products.subtitle": "あらゆるライフスタイルにクリーンエネルギー",
    "products.original": "NEON オリジナル",
    "products.organic": "NEON オーガニック",
    "products.ingredients": "天然成分",
    "products.caffeine": "天然カフェイン",
    "products.sugar": "無糖",
    "products.calories": "低カロリー",
    "products.vegan": "100% ヴィーガン",
    "products.nonGmo": "非遺伝子組み換え",
    
    // About page
    "about.title": "私たちのストーリー",
    "about.subtitle": "NEON Energy の旅",
    "about.mission": "私たちのミッション",
    "about.missionText": "妥協のないクリーンで持続可能なエネルギーを提供",
    "about.vision": "私たちのビジョン",
    "about.visionText": "エナジードリンクが健康で持続可能な世界",
    "about.values": "私たちの価値観",
    "about.quality": "品質",
    "about.sustainability": "持続可能性",
    "about.innovation": "革新",
    "about.community": "コミュニティ",
    
    // Compensation page
    "compensation.title": "報酬プラン",
    "compensation.subtitle": "NEON でビジネスを構築",
    "compensation.unilevel": "ユニレベルプラン",
    "compensation.binary": "バイナリーボーナス",
    "compensation.rank": "ランク昇格",
    "compensation.commission": "コミッション",
    "compensation.bonus": "ボーナス",
    "compensation.requirements": "要件",
    "compensation.downloadPdf": "PDF ダウンロード",
    
    // Distributor portal
    "distributor.dashboard": "ダッシュボード",
    "distributor.team": "マイチーム",
    "distributor.sales": "売上",
    "distributor.commissions": "コミッション",
    "distributor.marketing": "マーケティング資料",
    "distributor.training": "トレーニング",
    "distributor.profile": "プロフィール",
    "distributor.genealogy": "チーム系図",
    "distributor.enrollNew": "新メンバー登録",
    "distributor.totalSales": "総売上",
    "distributor.teamSize": "チーム規模",
    "distributor.currentRank": "現在のランク",
    "distributor.nextRank": "次のランク",
    
    // Countdown
    "countdown.days": "日",
    "countdown.hours": "時間",
    "countdown.minutes": "分",
    "countdown.seconds": "秒",
    "countdown.launching": "ローンチまで",
    
    // Forms
    "form.firstName": "名",
    "form.lastName": "姓",
    "form.email": "メールアドレス",
    "form.phone": "電話番号",
    "form.address": "住所",
    "form.city": "市区町村",
    "form.state": "都道府県",
    "form.zip": "郵便番号",
    "form.country": "国",
    "form.message": "メッセージ",
    "form.required": "必須",
    "form.optional": "任意",
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
