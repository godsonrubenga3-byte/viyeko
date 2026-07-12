import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  MapPin, 
  Truck, 
  Wrench, 
  Fuel, 
  Flame, 
  Users, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  Lock, 
  PhoneCall, 
  Activity, 
  Sparkles,
  Compass,
  Zap,
  Award,
  Sun,
  Moon,
  ArrowLeft,
  Database,
  CloudLightning,
  AlertCircle,
  Search,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

// Define Dar es Salaam Key Zones Density info (up to 50 providers each)
const DAR_KEY_ZONES = [
  {
    id: 'kinondoni',
    name_en: "Kinondoni",
    name_sw: "Kinondoni",
    providers: 50,
    eta: "8 - 12 mins",
    services_en: "Heavy towing, flatbed recovery, fast mechanical diagnostic",
    services_sw: "Kuvuta magari, uokoaji wa flatbed, utambuzi wa haraka wa kiufundi",
    description_en: "High density of rapid-response flatbeds positioned near Morocco, Oysterbay, and Masaki.",
    description_sw: "Idadi kubwa ya malori ya kukokota ya haraka yaliyopo karibu na Morocco, Oysterbay, na Masaki."
  },
  {
    id: 'kigamboni',
    name_en: "Kigamboni",
    name_sw: "Kigamboni",
    providers: 45,
    eta: "10 - 15 mins",
    services_en: "Tire replacement, fuel delivery, mobile electrical repairs",
    services_sw: "Kubadilisha matairi, kuleta mafuta, ukarabati wa umeme wa rununu",
    description_en: "Continuous patrols along the ferry and bridge access areas for instant tourist assistance.",
    description_sw: "Doria endelevu kando ya kivuko na maeneo ya daraja kwa msaada wa haraka wa watalii na wakaazi."
  },
  {
    id: 'ilala',
    name_en: "Ilala / CBD",
    name_sw: "Ilala / CBD",
    providers: 48,
    eta: "7 - 10 mins",
    services_en: "Heavy towing, battery jumpstarts, locksmith / key lockout",
    services_sw: "Kuvuta magari makubwa, kuamsha betri, msaada wa funguo",
    description_en: "Specialized rapid-response motorcycles equipped for heavy gridlock maneuverability.",
    description_sw: "Pikipiki maalum za uokoaji wa haraka zilizowekwa kwa ajili ya kupita kwenye msongamano mkubwa."
  },
  {
    id: 'ubungo',
    name_en: "Ubungo",
    name_sw: "Ubungo",
    providers: 50,
    eta: "9 - 14 mins",
    services_en: "Commercial fleet towing, brake fluid assist, radiator repairs",
    services_sw: "Kuvuta magari makubwa ya biashara, msaada wa breki, matengenezo ya redieta",
    description_en: "Heavy-duty truck focus near the main terminal and Morogoro Road transit corridors.",
    description_sw: "Uzingatiaji wa magari makubwa ya kubeba mizigo karibu na stendi kuu na barabara ya Morogoro."
  },
  {
    id: 'temeke',
    name_en: "Temeke",
    name_sw: "Temeke",
    providers: 42,
    eta: "12 - 16 mins",
    services_en: "Engine cooling fixes, tire swap mechanics, fuel dispatch",
    services_sw: "Urekebishaji wa mfumo wa baridi wa injini, kubadilisha tairi, mafuta ya dharura",
    description_en: "Strategically distributed recovery vans supporting industrial and port logistics routes.",
    description_sw: "Magari ya uokoaji yaliyosambazwa kimkakati kusaidia njia za viwandani na bandarini."
  },
  {
    id: 'mbezi',
    name_en: "Mbezi / Tegeta",
    name_sw: "Mbezi / Tegeta",
    providers: 46,
    eta: "11 - 15 mins",
    services_en: "4x4 extraction, general towing, emergency diagnostics",
    services_sw: "Uokoaji wa gari 4x4, kuvuta magari, utambuzi wa dharura",
    description_en: "Vetted offroad experts equipped with winches and recovery gear for unpaved terrain.",
    description_sw: "Wataalamu wa magari ya milimani wenye winchi na vifaa kwa ajili ya barabara za vumbi."
  }
];

// Complete English and Swahili Translation Dictionaries
const TRANSLATIONS = {
  en: {
    badge: "Pre-Launch Priority Waitlist Active",
    heroTitle: "Viyeko - Tanzania's number one roadside assistance, coming soon in Dar es Salaam",
    heroDesc: "VIYEKO is the next-generation digital garage and on-demand roadside assistance dispatcher. From tire swaps in Kigamboni to complex heavy towing in Mikocheni, connect with local vetted specialists equipped with precision GPS, live barometer telemetry, and transparent pricing.",
    secureBtn: "Secure Early Access",
    joinBtn: "Join Priority Waitlist",
    vetted: "100% Vetted",
    eta: "Avg. 12 Min Arrival",
    regions: "Dar es Salaam & Regions",
    telemetryTitle: "Live Dispatch Telemetry",
    tshActive: "TSh Active",
    onWay: "On the Way",
    gps: "Heading / GPS",
    pressure: "Alt / Pressure",
    featuresBadge: "Precision Roadside Logistics",
    featuresTitle: "The Modern Rescue Ecosystem",
    featuresDesc: "We took everything frustrating about traditional roadside towing and rebuild it from the soil up for Tanzania's growing automotive network.",
    feat1Title: "On-Demand Dispatches",
    feat1Desc: "Flatbed towing, emergency diesel/petrol delivery, tire dynamic swaps, battery jumpstarts, and complete mobile detailing. Ordered in 3 taps.",
    feat2Title: "Digital Service Garage",
    feat2Desc: "Add your fleet vehicles, track complete maintenance dates, calculate exact service costs, and plan future checkups through our digital ledger.",
    feat3Title: "Telemetry Sync",
    feat3Desc: "High-precision GPS sensors coupled with localized barometric pressure calculators adjust ETA and mechanics tools dynamically to current climate and altitude.",
    providersBadge: "Vetted, Reliable, Responsive",
    providersTitle: "Dar es Salaam Key Zones",
    providersDesc: "UP TO 50 certified providers strategically stationed in each key zone of Dar es Salaam, ensuring rapid emergency logistics & rapid turnaround times.",
    ctaTitle: "Ready to secure Priority early access?",
    ctaDesc: "Get priority dispatcher queues, zero-fee towing for the first month, and early updates. Register your vehicle now on our secure waitlist.",
    ctaBtn: "Go to Registration Page",
    backBtn: "Back to Overview",
    formTitle: "Secure Early Access",
    formSub: "Enter your vehicle and dispatch details below",
    fullName: "Full Name *",
    emailAddr: "Email Address *",
    phoneNum: "Phone Number (WhatsApp Preferred) *",
    vehicleClass: "Vehicle Class",
    yourRegion: "Your Region",
    registerBtn: "Register Securely",
    registering: "Recording Lead...",
    successTitle: "You're on the list!",
    successDesc: "Asante sana! We've secured your priority early-access spot. Your submission was logged in our Turso cloud database. You will be notified the minute our certified rescuers go live.",
    anotherBtn: "Register another vehicle",
    backHomeBtn: "Back to Overview",
    headerFeatures: "Features",
    headerZones: "Zones",
    headerLeads: "Leads Table",
    activeLabel: "Active Providers",
    avgEta: "Avg. ETA",
    services: "Services",
    allRegions: "All Regions (Mikoa Yote)",
    allVehicles: "All Vehicle Classes (Madaraja Yote)",
    dbConsole: "Database Leads Console",
    registeredResponses: "Registered Responses",
    realtimeTurso: "Real-time Turso Database synchronization engine",
    refreshDb: "Refresh Database",
    syncing: "Syncing...",
    newLead: "Register New Lead",
    searchPlaceholder: "Search name, email, or phone...",
    dbEntries: "Database Entries",
    recordsFound: "Records Found",
    leadNameCol: "Lead Name / Client",
    contactCol: "Contact details",
    vehicleTypeCol: "Vehicle Type",
    regionCol: "Region",
    registeredAtCol: "Registered At",
    noRecords: "No matching database records",
    adjustFilters: "Try adjusting your filters or search keywords.",
    devNotice: "Developer Notice",
    fallbackNotice: "This registration was written to the local SQLite fallback database because `TURSO_CONNECTION_URL` is not configured in secrets. Fill it in to sync to your production database."
  },
  sw: {
    badge: "Orodha ya Kipaumbele ya Kabla ya Uzinduzi Iko Wazi",
    heroTitle: "Viyeko - Huduma namba moja ya msaada wa dharura barabarani Tanzania, inakuja hivi karibuni Dar es Salaam",
    heroDesc: "VIYEKO ni kizazi kijacho cha gereji za kidijitali na huduma ya haraka ya msaada wa dharura barabarani. Kuanzia kubadilisha tairi Kigamboni hadi kuvuta magari makubwa Mikocheni, ungana na wataalamu waliothibitishwa wenye GPS sahihi, telemetry ya barometa na bei wazi kabisa.",
    secureBtn: "Jiunge na Orodha Mapema",
    joinBtn: "Jiunge na Orodha Sasa",
    vetted: "Wataalamu 100%",
    eta: "Kufika Chini ya Dakika 12",
    regions: "Dar es Salaam na Mikoa",
    telemetryTitle: "Mawasiliano ya Moja kwa Moja",
    tshActive: "TSh Inatumika",
    onWay: "Njia Kuja",
    gps: "Mwelekeo / GPS",
    pressure: "Kimo / Shinikizo",
    featuresBadge: "Uratibu Madhubuti wa Barabarani",
    featuresTitle: "Mfumo wa Kisasa wa Uokoaji",
    featuresDesc: "Tulichukua changamoto zote za zamani za uokoaji barabarani na kuzijenga upya kwa ajili ya mtandao unaokua wa magari nchini Tanzania.",
    feat1Title: "Huduma za Papo kwa Papo",
    feat1Desc: "Kuvuta magari makubwa, kuleta mafuta ya dharura, kubadilisha tairi, kuamsha betri na huduma kamili ya ukarabati. Agiza kwa miguso 3 tu.",
    feat2Title: "Gereji ya Kidijitali",
    feat2Desc: "Sajili magari yako yote, fuatilia tarehe za matengenezo, hesabu gharama sahihi za huduma na panga ukaguzi ujao kupitia rejesta yetu ya kidijitali.",
    feat3Title: "Uoanishaji wa Sensor",
    feat3Desc: "Vihisi vyenye uwezo mkubwa wa GPS vikiunganishwa na vikokotoo vya shinikizo hurekebisha muda wa kufika na zana za kiufundi kulingana na hali ya hewa na mwinuko.",
    providersBadge: "Waliothibitishwa, Waaminifu, Wepesi",
    providersTitle: "Kanda Kuu za Dar es Salaam",
    providersDesc: "Hadi watoa huduma 50 waliothibitishwa katika kila kanda kuu ya Dar es Salaam, wakihakikisha uratibu wa dharura wa haraka na ufanisi mkubwa.",
    ctaTitle: "Uko tayari kupata nafasi ya Kipaumbele mapema?",
    ctaDesc: "Pata kipaumbele cha dharura, huduma ya kuvuta gari bure mwezi wa kwanza, na taarifa za mapema. Sajili gari lako sasa kwenye orodha yetu salama.",
    ctaBtn: "Nenda Kwenye Ukurasa wa Usajili",
    backBtn: "Rudi Nyuma",
    formTitle: "Jiunge na Orodha Mapema",
    formSub: "Weka taarifa za gari lako na mawasiliano hapa chini",
    fullName: "Majina Kamili *",
    emailAddr: "Barua Pepe *",
    phoneNum: "Namba ya Simu (WhatsApp inapendelewa) *",
    vehicleClass: "Daraja la Gari",
    yourRegion: "Mkoa Wako",
    registerBtn: "Sajili Sasa kwa Usalama",
    registering: "Inatuma Taarifa...",
    successTitle: "Umeshajumuishwa kwenye Orodha!",
    successDesc: "Asante sana! Tumekuhifadhia nafasi yako ya kipaumbele ya mapema. Taarifa zako zimesajiliwa kwenye hifadhidata yetu ya Turso. Utajulishwa mara tu wataalamu wetu wanapoanza kufanya kazi.",
    anotherBtn: "Sajili gari lingine",
    backHomeBtn: "Rudi Kwenye Maelezo ya Jumla",
    headerFeatures: "Sifa Kuu",
    headerZones: "Kanda Zetu",
    headerLeads: "Orodha ya Leads",
    activeLabel: "Wataalamu Waliopo",
    avgEta: "Muda wa Kufika",
    services: "Huduma",
    allRegions: "Mikoa Yote",
    allVehicles: "Madaraja Yote ya Magari",
    dbConsole: "Dashibodi ya Leads za Hifadhidata",
    registeredResponses: "Majibu Yaliyosajiliwa",
    realtimeTurso: "Mfumo wa maingiliano wa hifadhidata wa Turso wa muda halisi",
    refreshDb: "Sasisha Hifadhidata",
    syncing: "Inasawazisha...",
    newLead: "Sajili Lead Mpya",
    searchPlaceholder: "Tafuta jina, barua pepe, au namba...",
    dbEntries: "Maingizo ya Database",
    recordsFound: "Kumbukumbu Zilizopatikana",
    leadNameCol: "Jina la Lead / Mteja",
    contactCol: "Mawasiliano",
    vehicleTypeCol: "Daraja la Gari",
    regionCol: "Mkoa",
    registeredAtCol: "Muda wa Kusajiliwa",
    noRecords: "Hakuna kumbukumbu zinazolingana",
    adjustFilters: "Jaribu kubadilisha vichujio au maneno ya utafutaji.",
    devNotice: "Taarifa kwa Msanidi Programu",
    fallbackNotice: "Usajili huu umeandikwa kwenye hifadhidata ya dharura ya SQLite kwa sababu `TURSO_CONNECTION_URL` haijawekwa kwenye siri. Weka siri hiyo ili kusawazisha na hifadhidata yako ya uzalishaji."
  }
};

const POPULAR_REGIONS = [
  "Dar es Salaam",
  "Arusha",
  "Dodoma",
  "Mwanza",
  "Zanzibar City",
  "Mbeya",
  "Morogoro"
];

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan / Hatchback' },
  { value: 'suv', label: 'SUV / 4x4' },
  { value: 'truck', label: 'Pickup / Commercial Truck' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'electric', label: 'Electric / Hybrid' }
];

export default function LandingPage() {
  const [view, setView] = useState<'home' | 'register' | 'leads'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('viyeko-theme');
    return (stored as 'light' | 'dark') || 'dark';
  });
  const [lang, setLang] = useState<'en' | 'sw'>(() => {
    const stored = localStorage.getItem('viyeko-lang');
    return (stored as 'en' | 'sw') || 'en';
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'sedan',
    region: 'Dar es Salaam'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFallbackDb, setIsFallbackDb] = useState(false);

  // Leads table states
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterVehicle, setFilterVehicle] = useState('All');

  const fetchLeads = async () => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Failed to fetch lead responses');
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      } else {
        throw new Error(data.error || 'Unknown response format');
      }
    } catch (err: any) {
      console.error(err);
      setLeadsError(err.message || 'Failed to load submissions.');
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'leads') {
      fetchLeads();
    }
  }, [view]);

  useEffect(() => {
    localStorage.setItem('viyeko-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('viyeko-lang', lang);
  }, [lang]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    toast.info(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, { duration: 1500 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Tafadhali jaza taarifa zote muhimu (Please fill in all fields)');
      return;
    }

    setIsSubmitting(true);
    const leadId = `lead-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: leadId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          vehicleType: formData.vehicleType,
          region: formData.region,
          createdAt: Date.now()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit data');
      }

      const result = await response.json();
      setIsFallbackDb(!!result.isFallback);
      
      toast.success(
        result.isFallback 
          ? 'Registered in local fallback database!' 
          : 'Successfully registered in Turso DB!'
      );
      
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        vehicleType: 'sedan',
        region: 'Dar es Salaam'
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(`Imeshindikana kutuma taarifa: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styled helper classes based on theme
  const isDark = theme === 'dark';
  
  const bgClass = isDark ? 'bg-[#0b0c10] text-slate-100' : 'bg-[#f8fafc] text-slate-900';
  const headerBg = isDark ? 'bg-[#0b0c10]/80 border-white/5' : 'bg-[#f8fafc]/80 border-slate-200/80';
  const cardBg = isDark ? 'bg-[#15171e] border-white/5' : 'bg-white border-slate-200/80 shadow-md shadow-slate-100';
  const inputBg = isDark ? 'bg-white/5 border-white/10 text-white focus:border-slate-yellow/40' : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-amber-500';
  const brandYellow = isDark ? 'text-slate-yellow' : 'text-amber-500';
  const secondaryText = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderTint = isDark ? 'border-white/5' : 'border-slate-200/80';
  const labelText = isDark ? 'text-slate-500' : 'text-slate-500';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-slate-yellow/30 transition-colors duration-300 ${bgClass}`} id="landing-page-root">
      
      {/* Top Floating Glow Accent */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 ${isDark ? 'bg-slate-yellow/5' : 'bg-amber-500/5'} rounded-full blur-[120px] pointer-events-none`} />

      {/* Header */}
      <header className={`border-b py-5 px-6 backdrop-blur-md sticky top-0 z-50 transition-colors ${headerBg}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="relative">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}>
                <Truck size={20} className="stroke-[2.5]" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-charcoal animate-pulse" />
            </div>
            <div>
              <span className={`font-black text-xl italic tracking-tight uppercase leading-none block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                VIYEKO
              </span>
              <span className={`text-[9px] font-mono font-black tracking-widest uppercase ${brandYellow}`}>
                Rescue & Care
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {view === 'home' && (
              <>
                <a href="#features" className={`text-xs font-bold uppercase tracking-wider transition-colors hidden md:inline-block ${secondaryText} hover:text-amber-500`}>
                  {TRANSLATIONS[lang].headerFeatures}
                </a>
                <a href="#zones" className={`text-xs font-bold uppercase tracking-wider transition-colors hidden md:inline-block ${secondaryText} hover:text-amber-500`}>
                  {TRANSLATIONS[lang].headerZones}
                </a>
              </>
            )}

            {/* Language Switcher */}
            <div className={`flex items-center rounded-xl p-0.5 border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100'}`}>
              <button
                onClick={() => setLang('en')}
                className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all ${
                  lang === 'en'
                    ? (isDark ? 'bg-slate-yellow text-charcoal' : 'bg-amber-500 text-white')
                    : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('sw')}
                className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all ${
                  lang === 'sw'
                    ? (isDark ? 'bg-slate-yellow text-charcoal' : 'bg-amber-500 text-white')
                    : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')
                }`}
              >
                SW
              </button>
            </div>
            
            {/* Theme Toggler */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-300 ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}
              aria-label="Toggle Theme"
              id="theme-toggler-btn"
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-700" />}
            </button>

            {view === 'home' ? (
              <button 
                onClick={() => setView('register')}
                className={`font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-1.5 ${isDark ? 'bg-slate-yellow/10 hover:bg-slate-yellow text-slate-yellow hover:text-charcoal border border-slate-yellow/20' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                id="header-waitlist-btn"
              >
                <Zap size={11} />
                <span>{TRANSLATIONS[lang].secureBtn}</span>
              </button>
            ) : view === 'register' ? (
              <button 
                onClick={() => setView('home')}
                className={`font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-1.5 ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'}`}
              >
                <ArrowLeft size={11} />
                <span>{TRANSLATIONS[lang].backBtn}</span>
              </button>
            ) : (
              <button 
                onClick={() => setView('register')}
                className={`font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-1.5 ${isDark ? 'bg-slate-yellow/10 hover:bg-slate-yellow text-slate-yellow hover:text-charcoal border border-slate-yellow/20' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
              >
                <Zap size={11} />
                <span>{TRANSLATIONS[lang].secureBtn}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Page View Switcher */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 z-10">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div className={`inline-flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full ${isDark ? 'bg-slate-yellow/10 border-slate-yellow/20 text-slate-yellow' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'}`}>
                    <Sparkles size={11} className="animate-spin text-amber-500" />
                    <span>{TRANSLATIONS[lang].badge}</span>
                  </div>
                  
                  <h1 className={`text-3xl md:text-5xl lg:text-5xl font-black leading-[1.1] italic tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'en' ? (
                      <>
                        Viyeko - Tanzania's <span className={brandYellow}>number one</span> roadside assistance, coming soon in dar es salaam
                      </>
                    ) : (
                      <>
                        Viyeko - Huduma namba <span className={brandYellow}>moja ya msaada</span> wa dharura barabarani Tanzania, inakuja hivi karibuni dar es salaam
                      </>
                    )}
                  </h1>

                  <p className={`text-sm md:text-base leading-relaxed max-w-lg font-medium ${secondaryText}`}>
                    {TRANSLATIONS[lang].heroDesc}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
                    <button 
                      onClick={() => setView('register')}
                      className={`w-full sm:w-auto font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl transition-all text-center flex items-center justify-center gap-2 group hover:scale-[1.02] ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/10 hover:shadow-slate-yellow/20' : 'bg-amber-500 text-white shadow-amber-500/10 hover:shadow-amber-500/20 hover:bg-amber-600'}`}
                    >
                      <span>{TRANSLATIONS[lang].secureBtn}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                      onClick={() => setView('register')}
                      className={`w-full sm:w-auto border font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all text-center flex items-center justify-center gap-2 active:scale-95 ${isDark ? 'bg-white/5 border-white/10 hover:border-slate-yellow/30 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'}`}
                    >
                      <Activity size={14} className={`${brandYellow} animate-pulse`} />
                      <span>{TRANSLATIONS[lang].joinBtn}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} className={brandYellow} /> {TRANSLATIONS[lang].vetted}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className={brandYellow} /> {TRANSLATIONS[lang].eta}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className={brandYellow} /> {TRANSLATIONS[lang].regions}</span>
                  </div>
                </div>

                <div className="flex-1 w-full relative">
                  <div className={`absolute inset-0 rounded-[3rem] blur-2xl pointer-events-none -z-10 ${isDark ? 'bg-gradient-to-tr from-slate-yellow/10 to-transparent' : 'bg-gradient-to-tr from-amber-500/10 to-transparent'}`} />
                  
                  {/* Custom Stylized Preview Window */}
                  <div className={`border rounded-[2.5rem] p-6 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-sm ${cardBg}`}>
                    <div className={`flex items-center justify-between border-b pb-4 ${borderTint}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-mono text-slate-400 font-bold ml-2 uppercase">{TRANSLATIONS[lang].telemetryTitle}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-black bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full`}>{TRANSLATIONS[lang].tshActive}</span>
                    </div>

                    {/* Simulated Live Rescue Box */}
                    <div className="space-y-4">
                      <div className={`border p-4 rounded-3xl space-y-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Francis Masanja</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Heavy Towing Specialist' : 'Mtaalamu wa Kuvuta Magari Makubwa'}</p>
                          </div>
                          <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full uppercase">{TRANSLATIONS[lang].onWay}</span>
                        </div>
                        
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                          <div className={`h-full w-2/3 rounded-full animate-pulse ${isDark ? 'bg-slate-yellow' : 'bg-amber-500'}`} />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 font-mono">
                          <span>Mbezi, Dar es Salaam</span>
                          <span className={brandYellow}>ETA: 8 mins</span>
                        </div>
                      </div>

                      {/* Cool Sensor Simulation Display */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`border p-3.5 rounded-2xl space-y-1 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Compass size={12} className={brandYellow} />
                            <span className="text-[8px] font-black uppercase tracking-wider">{TRANSLATIONS[lang].gps}</span>
                          </div>
                          <p className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>6° 48' S • 39° 17' E</p>
                        </div>
                        
                        <div className={`border p-3.5 rounded-2xl space-y-1 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Activity size={12} className={`${brandYellow} animate-pulse`} />
                            <span className="text-[8px] font-black uppercase tracking-wider">{TRANSLATIONS[lang].pressure}</span>
                          </div>
                          <p className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>1,013 hPa (Sea Lvl)</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setView('register')}
                      className={`w-full font-black text-[10px] py-3.5 rounded-2xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-lg ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/5' : 'bg-amber-500 text-white shadow-amber-500/5'}`}
                    >
                      <span>{TRANSLATIONS[lang].secureBtn}</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </section>

              {/* App Features Grid */}
              <section id="features" className={`border-y py-20 px-6 ${isDark ? 'bg-white/2' : 'bg-slate-100/50'} ${borderTint}`}>
                <div className="max-w-6xl mx-auto space-y-12">
                  <div className="text-center max-w-xl mx-auto space-y-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${brandYellow}`}>{TRANSLATIONS[lang].featuresBadge}</span>
                    <h2 className={`text-3xl md:text-4xl font-black uppercase italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{TRANSLATIONS[lang].featuresTitle}</h2>
                    <p className={`text-xs md:text-sm font-medium ${secondaryText}`}>
                      {TRANSLATIONS[lang].featuresDesc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`border p-8 rounded-[2rem] space-y-4 hover:border-amber-500/20 transition-all group ${cardBg}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-yellow/10 text-slate-yellow' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Truck size={22} />
                      </div>
                      <h3 className={`font-black text-lg uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{TRANSLATIONS[lang].feat1Title}</h3>
                      <p className={`text-xs leading-relaxed font-medium ${secondaryText}`}>
                        {TRANSLATIONS[lang].feat1Desc}
                      </p>
                    </div>

                    <div className={`border p-8 rounded-[2rem] space-y-4 hover:border-amber-500/20 transition-all group ${cardBg}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-yellow/10 text-slate-yellow' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Wrench size={22} />
                      </div>
                      <h3 className={`font-black text-lg uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{TRANSLATIONS[lang].feat2Title}</h3>
                      <p className={`text-xs leading-relaxed font-medium ${secondaryText}`}>
                        {TRANSLATIONS[lang].feat2Desc}
                      </p>
                    </div>

                    <div className={`border p-8 rounded-[2rem] space-y-4 hover:border-amber-500/20 transition-all group ${cardBg}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-yellow/10 text-slate-yellow' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Activity size={22} />
                      </div>
                      <h3 className={`font-black text-lg uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{TRANSLATIONS[lang].feat3Title}</h3>
                      <p className={`text-xs leading-relaxed font-medium ${secondaryText}`}>
                        {TRANSLATIONS[lang].feat3Desc}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Dar es Salaam Key Zones Section */}
              <section id="zones" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${brandYellow}`}>{TRANSLATIONS[lang].providersBadge}</span>
                  <h2 className={`text-3xl md:text-4xl font-black uppercase italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{TRANSLATIONS[lang].providersTitle}</h2>
                  <p className={`text-xs md:text-sm font-medium ${secondaryText}`}>
                    {TRANSLATIONS[lang].providersDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {DAR_KEY_ZONES.map((zone) => (
                    <div 
                      key={zone.id} 
                      className={`border rounded-[2.5rem] p-6 space-y-5 transition-all flex flex-col justify-between ${cardBg} hover:border-amber-500/20 group`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-slate-yellow/10 text-slate-yellow' : 'bg-amber-500/10 text-amber-500'}`}>
                              <MapPin size={18} />
                            </div>
                            <div>
                              <h3 className={`font-black text-base leading-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {lang === 'en' ? zone.name_en : zone.name_sw}
                              </h3>
                              <p className="text-[10px] font-mono text-slate-500">Tanzania Grid Zone</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isDark ? 'bg-slate-yellow/10 text-slate-yellow border border-slate-yellow/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}>
                            {zone.providers} {TRANSLATIONS[lang].activeLabel}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 flex items-center gap-1">
                            <Clock size={10} />
                            <span>{TRANSLATIONS[lang].avgEta}: {zone.eta}</span>
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                          {lang === 'en' ? zone.description_en : zone.description_sw}
                        </p>

                        <div className={`border-t pt-3 space-y-1.5 ${borderTint}`}>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{TRANSLATIONS[lang].services}</span>
                          <p className="text-[10px] font-bold text-slate-500">
                            {lang === 'en' ? zone.services_en : zone.services_sw}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Secure Call-To-Action Banner at the bottom */}
              <section className={`py-16 px-6 border-t ${borderTint} ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50'}`}>
                <div className="max-w-4xl mx-auto text-center space-y-6">
                  <h2 className={`text-3xl md:text-5xl font-black uppercase italic tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {lang === 'en' ? (
                      <>
                        Ready to secure <span className={brandYellow}>Priority</span> early access?
                      </>
                    ) : (
                      <>
                        Je, uko tayari kupata nafasi ya <span className={brandYellow}>Kipaumbele</span> mapema?
                      </>
                    )}
                  </h2>
                  <p className={`max-w-xl mx-auto text-sm font-medium ${secondaryText}`}>
                    {TRANSLATIONS[lang].ctaDesc}
                  </p>
                  <div>
                    <button 
                      onClick={() => setView('register')}
                      className={`font-black text-xs uppercase tracking-widest px-10 py-4.5 rounded-2xl transition-all hover:scale-[1.02] shadow-lg ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/10 hover:bg-slate-yellow/90' : 'bg-amber-500 text-white shadow-amber-500/10 hover:bg-amber-600'}`}
                    >
                      {TRANSLATIONS[lang].ctaBtn}
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto px-6 py-12 md:py-16"
            >
              {/* Back to Home Button */}
              <button 
                onClick={() => setView('home')}
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-8 transition-colors ${secondaryText} hover:text-amber-500`}
              >
                <ArrowLeft size={14} />
                <span>{TRANSLATIONS[lang].backBtn}</span>
              </button>

              <div className={`border rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden ${cardBg}`}>

                {isSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${isDark ? 'bg-slate-yellow/10 border-slate-yellow/20 text-slate-yellow' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                      <CheckCircle2 size={32} className="stroke-[2.5]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className={`font-black text-2xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{TRANSLATIONS[lang].successTitle}</h3>
                      <p className={`text-xs font-semibold leading-relaxed max-w-md mx-auto ${secondaryText}`}>
                        {TRANSLATIONS[lang].successDesc}
                      </p>
                    </div>

                    {isFallbackDb && (
                      <div className={`max-w-md mx-auto p-3.5 rounded-2xl text-left border flex gap-3 text-xs ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50/90 border-amber-200 text-amber-700'}`}>
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{TRANSLATIONS[lang].devNotice}</p>
                          <p className="text-[10px] leading-relaxed opacity-90 mt-0.5">
                            {TRANSLATIONS[lang].fallbackNotice}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => {
                          setIsSuccess(false);
                          setIsFallbackDb(false);
                        }}
                        className={`flex-1 font-black text-xs py-4 rounded-2xl uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200'}`}
                      >
                        {TRANSLATIONS[lang].anotherBtn}
                      </button>
                      <button 
                        onClick={() => setView('home')}
                        className={`flex-1 font-black text-xs py-4 rounded-2xl uppercase tracking-widest transition-all shadow-lg ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/10' : 'bg-amber-500 text-white shadow-amber-500/10 hover:bg-amber-600'}`}
                      >
                        {TRANSLATIONS[lang].backHomeBtn}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                      <h3 className={`font-black text-2xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{TRANSLATIONS[lang].formTitle}</h3>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${secondaryText}`}>{TRANSLATIONS[lang].formSub}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>{TRANSLATIONS[lang].fullName}</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g., Godson Rubenga"
                          value={formData.name}
                          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                          className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-500 ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>{TRANSLATIONS[lang].emailAddr}</label>
                        <input 
                          type="email" 
                          required
                          placeholder="e.g., godson@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                          className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-500 ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>{TRANSLATIONS[lang].phoneNum}</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="e.g., +255 750 057 757"
                          value={formData.phone}
                          onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                          className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-500 ${inputBg}`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>{TRANSLATIONS[lang].vehicleClass}</label>
                          <select 
                            value={formData.vehicleType}
                            onChange={(e) => setFormData(p => ({ ...p, vehicleType: e.target.value }))}
                            className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all border ${isDark ? 'bg-[#15171e] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-800 border-slate-200'}`}
                          >
                            {VEHICLE_TYPES.map(vt => (
                              <option key={vt.value} value={vt.value}>{vt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>{TRANSLATIONS[lang].yourRegion}</label>
                          <select 
                            value={formData.region}
                            onChange={(e) => setFormData(p => ({ ...p, region: e.target.value }))}
                            className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all border ${isDark ? 'bg-[#15171e] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-800 border-slate-200'}`}
                          >
                            {POPULAR_REGIONS.map(reg => (
                              <option key={reg} value={reg}>{reg}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`w-full font-black text-xs py-4.5 rounded-2xl uppercase tracking-widest transition-all disabled:opacity-50 text-center flex items-center justify-center gap-2 mt-6 ${isDark ? 'bg-slate-yellow text-charcoal' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className={`animate-spin border-2 border-t-transparent w-4 h-4 rounded-full ${isDark ? 'border-charcoal' : 'border-white'}`} />
                          <span>{TRANSLATIONS[lang].registering}</span>
                        </span>
                      ) : (
                        <span>{TRANSLATIONS[lang].registerBtn}</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {view === 'leads' && (
            <motion.div
              key="leads-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setView('home')}
                      className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${secondaryText} hover:text-amber-500`}
                    >
                      <ArrowLeft size={14} />
                      <span>{lang === 'en' ? 'Home' : 'Nyumbani'}</span>
                    </button>
                    <span className="text-slate-500">/</span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-500">{TRANSLATIONS[lang].dbConsole}</span>
                  </div>
                  <h2 className={`text-3xl font-black uppercase italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {TRANSLATIONS[lang].registeredResponses}
                  </h2>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${secondaryText}`}>
                    {TRANSLATIONS[lang].realtimeTurso}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchLeads}
                    disabled={leadsLoading}
                    className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest ${
                      isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <RefreshCw size={13} className={leadsLoading ? "animate-spin" : ""} />
                    <span>{leadsLoading ? TRANSLATIONS[lang].syncing : TRANSLATIONS[lang].refreshDb}</span>
                  </button>
                  
                  <button 
                    onClick={() => setView('register')}
                    className={`font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-lg flex items-center gap-2 ${
                      isDark ? 'bg-slate-yellow text-charcoal' : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    <Zap size={13} />
                    <span>{TRANSLATIONS[lang].newLead}</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Control Bar */}
              <div className={`border p-4 md:p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 ${cardBg}`}>
                {/* Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder={TRANSLATIONS[lang].searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-500 ${inputBg}`}
                  />
                </div>

                {/* Filter Region */}
                <div>
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none transition-all border ${
                      isDark ? 'bg-[#15171e] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <option value="All">{TRANSLATIONS[lang].allRegions}</option>
                    {POPULAR_REGIONS.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Vehicle */}
                <div>
                  <select
                    value={filterVehicle}
                    onChange={(e) => setFilterVehicle(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none transition-all border ${
                      isDark ? 'bg-[#15171e] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <option value="All">{TRANSLATIONS[lang].allVehicles}</option>
                    {VEHICLE_TYPES.map(vt => (
                      <option key={vt.value} value={vt.value}>{vt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Tables Section */}
              <div className={`border rounded-[2rem] overflow-hidden ${cardBg}`}>
                {leadsLoading ? (
                  <div className="py-24 text-center space-y-4">
                    <div className="relative w-12 h-12 mx-auto">
                      <div className={`absolute inset-0 border-4 rounded-full opacity-20 ${isDark ? 'border-slate-yellow' : 'border-amber-500'}`} />
                      <div className={`absolute inset-0 border-4 border-t-transparent rounded-full animate-spin ${isDark ? 'border-slate-yellow' : 'border-amber-500'}`} />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${secondaryText}`}>
                      {lang === 'en' ? "Fetching certified leads from Turso..." : "Inapakua leads zilizothibitishwa kutoka Turso..."}
                    </p>
                  </div>
                ) : leadsError ? (
                  <div className="py-16 px-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                      <AlertCircle size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-sm uppercase">{lang === 'en' ? "Connection Error" : "Itilafu ya Muunganisho"}</p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">{leadsError}</p>
                    </div>
                    <button 
                      onClick={fetchLeads}
                      className="text-xs font-black uppercase tracking-wider text-amber-500 hover:underline"
                    >
                      {lang === 'en' ? "Try Again" : "Jaribu Tena"}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Header stat block */}
                    <div className={`border-b px-6 py-4 flex items-center justify-between ${borderTint} ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50/50'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {TRANSLATIONS[lang].dbEntries}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-black ${brandYellow}`}>
                        {
                          leads.filter(lead => {
                            const matchesSearch = 
                              lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              lead.phone?.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesRegion = filterRegion === 'All' || lead.region === filterRegion;
                            const matchesVehicle = filterVehicle === 'All' || lead.vehicleType === filterVehicle;
                            return matchesSearch && matchesRegion && matchesVehicle;
                          }).length
                        } / {leads.length} {TRANSLATIONS[lang].recordsFound}
                      </span>
                    </div>

                    {/* Table markup */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b text-[9px] font-black uppercase tracking-widest text-slate-500 ${borderTint} ${isDark ? 'bg-white/[0.02]' : 'bg-slate-100/50'}`}>
                            <th className="py-4 px-6">{TRANSLATIONS[lang].leadNameCol}</th>
                            <th className="py-4 px-6">{TRANSLATIONS[lang].contactCol}</th>
                            <th className="py-4 px-6">{TRANSLATIONS[lang].vehicleTypeCol}</th>
                            <th className="py-4 px-6">{TRANSLATIONS[lang].regionCol}</th>
                            <th className="py-4 px-6">{TRANSLATIONS[lang].registeredAtCol}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {leads
                            .filter(lead => {
                              const matchesSearch = 
                                lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                lead.phone?.toLowerCase().includes(searchQuery.toLowerCase());
                              const matchesRegion = filterRegion === 'All' || lead.region === filterRegion;
                              const matchesVehicle = filterVehicle === 'All' || lead.vehicleType === filterVehicle;
                              return matchesSearch && matchesRegion && matchesVehicle;
                            })
                            .map((lead) => (
                              <tr 
                                key={lead.id} 
                                className={`text-xs font-semibold group transition-colors hover:${isDark ? 'bg-white/[0.01]' : 'bg-slate-50'}`}
                              >
                                <td className="py-4.5 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                                      isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-800'
                                    }`}>
                                      {lead.name ? lead.name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                      <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{lead.name || 'Anonymous'}</p>
                                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4.5 px-6 space-y-0.5">
                                  <p className="font-medium text-slate-400">{lead.email}</p>
                                  <p className={`font-mono text-[10px] ${brandYellow}`}>{lead.phone}</p>
                                </td>
                                <td className="py-4.5 px-6">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {VEHICLE_TYPES.find(vt => vt.value === lead.vehicleType)?.label || lead.vehicleType || 'sedan'}
                                  </span>
                                </td>
                                <td className="py-4.5 px-6">
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    <MapPin size={11} className={brandYellow} />
                                    <span>{lead.region || 'Dar es Salaam'}</span>
                                  </div>
                                </td>
                                <td className="py-4.5 px-6 font-mono text-[10px] text-slate-500">
                                  {lead.createdAt ? new Date(Number(lead.createdAt)).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Just now'}
                                </td>
                              </tr>
                            ))}
                          
                          {leads.filter(lead => {
                            const matchesSearch = 
                              lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              lead.phone?.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesRegion = filterRegion === 'All' || lead.region === filterRegion;
                            const matchesVehicle = filterVehicle === 'All' || lead.vehicleType === filterVehicle;
                            return matchesSearch && matchesRegion && matchesVehicle;
                          }).length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-16 text-center">
                                <div className="text-slate-500 space-y-1">
                                  <Database size={20} className="mx-auto opacity-40 mb-2" />
                                  <p className="font-black text-xs uppercase tracking-wider">{TRANSLATIONS[lang].noRecords}</p>
                                  <p className="text-[10px] opacity-80">{TRANSLATIONS[lang].adjustFilters}</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={`border-t py-12 px-6 transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-slate-yellow/10 border-slate-yellow/20 text-slate-yellow' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
              <Truck size={14} />
            </div>
            <div>
              <span className={`font-black text-sm italic tracking-tight uppercase leading-none block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                VIYEKO
              </span>
              <span className={`text-[7px] font-mono tracking-widest uppercase ${brandYellow}`}>
                Rescue & Care
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center md:text-right">
            © 2026 VIYEKO. Engineered with absolute precision in Dar es Salaam, Tanzania. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
