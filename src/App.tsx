import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Phone, 
  History, 
  MapPin, 
  ChevronRight, 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Moon,
  Sun,
  Car,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  Cloud,
  CloudSun,
  RotateCw,
  Compass,
  CloudRain,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Info,
  Bell,
  Sparkles,
  Wrench,
  Star,
  Award,
  ThumbsUp,
  Briefcase,
  Smile,
  Trash2,
  Truck,
  CornerUpRight,
  Calendar,
  Check
} from 'lucide-react';
import { SERVICES, ServiceType, Request, Service, User as UserType, Vehicle } from './types';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { Toaster, toast } from 'sonner';
import LandingPage from './components/LandingPage';

import { 
  auth, 
  db, 
  signInWithGoogle, 
  logout as firebaseLogout, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const POPULAR_LOCATIONS = [
  "Dar es Salaam, Tanzania",
  "Arusha, Tanzania",
  "Dodoma, Tanzania",
  "Mwanza, Tanzania",
  "Zanzibar City, Tanzania",
  "Morogoro, Tanzania",
  "Tanga, Tanzania",
  "Mbeya, Tanzania"
];

const TRANSFERABLE_PROVIDERS = [
  { name: 'Francis Masanja', phone: '+255747746619', specialty: 'Heavy towing & vehicle rescue', vehicle: 'Flatbed Tow Truck', distance: '1.5 km' },
  { name: 'Godson Martin', phone: '+255750057757', specialty: 'Emergency logistics & roadside assist', vehicle: 'Mechanical Response Van', distance: '2.8 km' },
  { name: 'Michael Temu', phone: '+255751234567', specialty: 'Tyres & battery jumpstart expert', vehicle: 'Quick Rescue Motorcycle', distance: '4.1 km' }
];

const isOfflineError = (err: any): boolean => {
  if (!err) return false;
  if (err.isOffline) return true;
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('offline') ||
    msg.includes('could not reach') ||
    msg.includes('unreachable') ||
    msg.includes('backend didn\'t respond')
  );
};

const MockMap = ({ className, showProviders = false }: { className?: string, showProviders?: boolean }) => (
  <div className={cn("relative w-full h-48 bg-charcoal-light/20 rounded-3xl overflow-hidden map-grid border border-white/5", className)}>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative w-12 h-12">
        <div className="pulse-ring" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-slate-yellow rounded-full shadow-[0_0_15px_rgba(230,208,93,0.6)]" />
        </div>
      </div>
    </div>
    {showProviders && (
      <>
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-viyeko-red rounded-full opacity-50 animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-viyeko-blue rounded-full opacity-50 animate-pulse" />
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-slate-yellow rounded-full opacity-30 animate-ping" />
      </>
    )}
    <div className="absolute top-10 left-10 text-[8px] font-bold text-slate-600 uppercase tracking-widest">Kigamboni, Dar es Salaam</div>
    <div className="absolute bottom-10 right-10 text-[8px] font-bold text-slate-600 uppercase tracking-widest">Upanga, TZ</div>
  </div>
);

const LiveTracking = ({ request, onCancel, onNextStep, onMinimize }: { request: Request, onCancel: () => void, onNextStep?: () => void, onMinimize?: () => void }) => {
  const service = SERVICES.find(s => s.id === request.serviceId);
  const steps = [
    { id: 'searching', label: 'Searching', icon: Zap },
    { id: 'assigned', label: 'Assigned', icon: ShieldCheck },
    { id: 'on-the-way', label: 'On the Way', icon: Car },
    { id: 'arrived', label: 'Arrived', icon: MapPin },
    { id: 'in-progress', label: 'In Progress', icon: Activity },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === request.status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6 border-l-4 border-l-slate-yellow relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-yellow/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="flex justify-between items-start relative z-10 w-full gap-2 flex-wrap">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-2xl text-white shadow-lg", service?.color)}>
            {service && <service.icon size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-100">{service?.title}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Request • {request.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onMinimize && (
            <button 
              onClick={onMinimize}
              className="p-1.5 bg-charcoal-light border border-border-theme hover:brightness-110 rounded-xl text-slate-300 transition-all flex items-center gap-1 text-[9px] uppercase font-black tracking-wider px-2.5"
              title="Back to Services"
              id="minimize-tracking-btn"
            >
              <ArrowLeft size={12} className="text-slate-yellow" />
              <span>Back</span>
            </button>
          )}
          {onNextStep && request.status !== 'completed' && (
            <button 
              onClick={onNextStep}
              className="p-2 bg-slate-yellow/10 text-slate-yellow rounded-full hover:bg-slate-yellow/20 transition-colors"
              title="Simulate Progress"
            >
              <ChevronRight size={20} />
            </button>
          )}
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors" title="Cancel Request">
            <X size={20} />
          </button>
        </div>
      </div>

      <MockMap showProviders={request.status === 'searching'} />

      <div className="relative pl-8 space-y-6 relative z-10">
        <div className="timeline-line" />
        {steps.map((step, idx) => {
          const isActive = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div key={step.id} className="relative flex items-center gap-4">
              <div className={cn("timeline-dot", isActive && "timeline-dot-active")}>
                <step.icon size={12} />
              </div>
              <div className="flex flex-col">
                <span className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "text-slate-100" : "text-slate-600")}>
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-slate-yellow font-medium animate-pulse">
                    {request.status === 'searching' ? 'Finding nearby providers...' : 
                     request.status === 'assigned' ? 'Provider assigned! Preparing to move...' :
                     request.status === 'on-the-way' ? 'Provider is moving to your location' :
                     request.status === 'arrived' ? 'Provider has arrived!' :
                     request.status === 'in-progress' ? 'Service is being performed' :
                     'Service completed!'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-charcoal-light border border-white/10 flex items-center justify-center text-slate-400">
            <Phone size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Support</span>
            <span className="text-xs font-bold text-slate-200">Dispatch Center</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none block">ETA</span>
          <span className="text-lg font-black text-slate-yellow">{request.estimatedArrival} MINS</span>
        </div>
      </div>
    </motion.div>
  );
};

function getWeatherData(address: string) {
  const normalized = (address || "Dar es Salaam, Tanzania").toLowerCase();
  
  // Deterministic sum to have location-dependent weather without external API request issues
  let sum = 0;
  for (let i = 0; i < normalized.length; i++) {
    sum += normalized.charCodeAt(i);
  }

  // Base tropical temperatures in Tanzania region
  let temp = 26 + (sum % 6); // ranges from 26 to 31°C
  
  // Condition distribution
  let condition: 'Sunny' | 'Partly Cloudy' | 'Overcast' | 'Heavy Rain' | 'Dust Storm' | 'Thunderstorm' = 'Sunny';
  const condVal = sum % 6;
  if (condVal === 0) condition = 'Sunny';
  else if (condVal === 1) condition = 'Partly Cloudy';
  else if (condVal === 2) condition = 'Overcast';
  else if (condVal === 3) condition = 'Heavy Rain';
  else if (condVal === 4) condition = 'Dust Storm';
  else condition = 'Thunderstorm';

  // Adjust temperature with rainfall / overcast cover
  if (condition === 'Heavy Rain' || condition === 'Thunderstorm') {
    temp -= 8;
  } else if (condition === 'Overcast') {
    temp -= 3;
  }

  let recommendation = "";
  let alertLevel: 'info' | 'warning' | 'error' | 'success' = 'success';

  switch (condition) {
    case 'Sunny':
      recommendation = "Intense heat! Let the engine cool entirely before working on radiator/hoses. Mechanics: work under shade and stay hydrated.";
      alertLevel = 'warning';
      break;
    case 'Partly Cloudy':
      recommendation = "Moderate warmth. Standard outdoor repair safe. Keep a hydration bottle close.";
      alertLevel = 'success';
      break;
    case 'Overcast':
      recommendation = "Good grey clouds and milder heat. Highly favorable for outdoors mechanical, filter or tire replacements.";
      alertLevel = 'success';
      break;
    case 'Heavy Rain':
      recommendation = "Wet surfaces! Set up warning triangles 50m back. Refrain from open electrical work to avoid fuse box moisture.";
      alertLevel = 'error';
      break;
    case 'Dust Storm':
      recommendation = "Debris risk! Keep engine covers/oil caps sealed. Avoid exposing opened intake valves or filters to grit and wind.";
      alertLevel = 'error';
      break;
    case 'Thunderstorm':
      recommendation = "Lightning hazard. Suspend repairs immediately if metal tools are in use. Wait inside the cabin or near brick buildings.";
      alertLevel = 'error';
      break;
  }

  const humidity = 25 + (sum % 35); // 25% to 60%
  const wind = 4 + (sum % 16); // 4 to 20 km/h
  const uvIndex = condition === 'Sunny' ? 10 : condition === 'Partly Cloudy' ? 6 : condition === 'Overcast' ? 3 : 1;

  return {
    temp,
    condition,
    recommendation,
    humidity,
    wind,
    uvIndex,
    alertLevel,
    locationName: address || "Dar es Salaam, Tanzania (Default)"
  };
}

const WeatherWidget = ({ 
  selectedLocation, 
  onLocationUpdate 
}: { 
  selectedLocation?: string; 
  onLocationUpdate?: (loc: { lat?: number; lng?: number; address: string }) => void;
}) => {
  // Initialize with deterministic fallback weather
  const [weather, setWeather] = useState(() => getWeatherData(selectedLocation || ""));
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isSensorWeatherSensitive, setIsSensorWeatherSensitive] = useState(true);
  
  // Device sensor statistics
  const [sensorStats, setSensorStats] = useState({
    lat: null as number | null,
    lng: null as number | null,
    accuracy: null as number | null,
    altitude: null as number | null,
    speed: null as number | null,
    heading: null as number | null,
    alpha: 0,
    beta: 0,
    gamma: 0,
    accelX: 0,
    accelY: 0,
    accelZ: 9.8,
    isSensorSimulated: true
  });
  
  const [showSensorsConsole, setShowSensorsConsole] = useState(false);

  // Parse location and query Open-Meteo live stats
  useEffect(() => {
    let active = true;
    
    async function fetchWeather() {
      if (!selectedLocation) return;
      setIsLoading(true);
      
      let targetLat: number | null = null;
      let targetLng: number | null = null;
      let displayName = selectedLocation;
      
      // Check if coordinate info is inside the address string
      const latMatch = selectedLocation.match(/Lat:\s*(-?\d+\.\d+)/);
      const lngMatch = selectedLocation.match(/Lng:\s*(-?\d+\.\d+)/);
      
      if (latMatch && lngMatch) {
        targetLat = parseFloat(latMatch[1]);
        targetLng = parseFloat(lngMatch[1]);
      } else {
        // Try to geocode the city name via Open-Meteo's free geocoding api
        try {
          const cleanName = selectedLocation.split('(')[0].trim();
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=1&language=en&format=json`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
              targetLat = geoData.results[0].latitude;
              targetLng = geoData.results[0].longitude;
              displayName = `${geoData.results[0].name}${geoData.results[0].country ? `, ${geoData.results[0].country}` : ''}`;
            }
          }
        } catch (err) {
          console.warn("Geocoding failed, falling back to local weather data", err);
        }
      }
      
      if (targetLat !== null && targetLng !== null) {
        try {
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index`;
          const weatherRes = await fetch(weatherUrl);
          if (weatherRes.ok && active) {
            const weatherData = await weatherRes.json();
            const current = weatherData.current;
            
            // Map Open-Meteo weather code to our defined conditions
            let condition: string = 'Sunny';
            const code = current.weather_code;
            if (code === 0) {
              condition = 'Sunny';
            } else if (code >= 1 && code <= 2) {
              condition = 'Partly Cloudy';
            } else if (code === 3 || (code >= 45 && code <= 57)) {
              condition = 'Overcast';
            } else if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
              condition = 'Heavy Rain';
            } else if (code >= 95 && code <= 99) {
              condition = 'Thunderstorm';
            } else {
              condition = 'Sunny';
            }

            const temp = Math.round(current.temperature_2m);
            const humidity = current.relative_humidity_2m;
            const wind = Math.round(current.wind_speed_10m);
            const uvIndex = current.uv_index ? Math.round(current.uv_index) : (condition === 'Sunny' ? 9 : 3);

            let recommendation = "";
            let alertLevel: 'info' | 'warning' | 'error' | 'success' = 'success';

            switch (condition) {
              case 'Sunny':
                recommendation = "Intense heat! Let the engine cool entirely before working on radiator/hoses. Mechanics: work under shade and stay hydrated.";
                alertLevel = 'warning';
                break;
              case 'Partly Cloudy':
                recommendation = "Moderate warmth. Standard outdoor repair safe. Keep a hydration bottle close.";
                alertLevel = 'success';
                break;
              case 'Overcast':
                recommendation = "Good grey clouds and milder heat. Highly favorable for outdoors mechanical, filter or tire replacements.";
                alertLevel = 'success';
                break;
              case 'Heavy Rain':
                recommendation = "Wet surfaces! Set up warning triangles 50m back. Refrain from open electrical work to avoid fuse box moisture.";
                alertLevel = 'error';
                break;
              case 'Dust Storm':
                recommendation = "Debris risk! Keep engine covers/oil caps sealed. Avoid exposing opened intake valves or filters to grit and wind.";
                alertLevel = 'error';
                break;
              case 'Thunderstorm':
                recommendation = "Lightning hazard. Suspend repairs immediately if metal tools are in use. Wait inside the cabin or near brick buildings.";
                alertLevel = 'error';
                break;
            }

            setWeather({
              temp,
              condition: condition as any,
              recommendation,
              humidity,
              wind,
              uvIndex,
              alertLevel,
              locationName: displayName
            });
            setIsLiveApi(true);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Live weather forecast fetch failed, falling back to local weather data", err);
        }
      }
      
      // Fallback deterministic option if geocoding/weather API fails
      if (active) {
        setWeather(getWeatherData(selectedLocation));
        setIsLiveApi(false);
        setIsLoading(false);
      }
    }
    
    fetchWeather();

    // Auto-poll overall weather of the selected region every 20 seconds to keep stats accurate and updated!
    const pollInterval = setInterval(() => {
      fetchWeather();
    }, 20000);
    
    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [selectedLocation]);

  // Handle live device orientation/motion sensors & simulated drift
  useEffect(() => {
    let sensorActive = true;
    
    // Listen for orientation sensors
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!sensorActive) return;
      setSensorStats(prev => ({
        ...prev,
        alpha: e.alpha ? Math.round(e.alpha) : prev.alpha,
        beta: e.beta ? Math.round(e.beta) : prev.beta,
        gamma: e.gamma ? Math.round(e.gamma) : prev.gamma,
        isSensorSimulated: false
      }));
    };

    // Listen for device accelerometers
    const handleMotion = (e: DeviceMotionEvent) => {
      if (!sensorActive) return;
      if (e.accelerationIncludingGravity) {
        setSensorStats(prev => ({
          ...prev,
          accelX: e.accelerationIncludingGravity?.x ? parseFloat(e.accelerationIncludingGravity.x.toFixed(2)) : prev.accelX,
          accelY: e.accelerationIncludingGravity?.y ? parseFloat(e.accelerationIncludingGravity.y.toFixed(2)) : prev.accelY,
          accelZ: e.accelerationIncludingGravity?.z ? parseFloat(e.accelerationIncludingGravity.z.toFixed(2)) : prev.accelZ,
          isSensorSimulated: false
        }));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);

    // Micro-fluctuations simulator if physical gyroscope is not accessible (common on standard laptops)
    const interval = setInterval(() => {
      setSensorStats(prev => {
        if (!prev.isSensorSimulated) return prev;
        // Introduce small lifelike changes
        return {
          ...prev,
          alpha: (prev.alpha + (Math.random() * 2 - 1) + 360) % 360,
          beta: Math.max(-10, Math.min(10, prev.beta + (Math.random() * 0.4 - 0.2))),
          gamma: Math.max(-10, Math.min(10, prev.gamma + (Math.random() * 0.4 - 0.2))),
          accelX: parseFloat((Math.sin(Date.now() / 1500) * 0.15).toFixed(2)),
          accelY: parseFloat((Math.cos(Date.now() / 2000) * 0.15).toFixed(2)),
          accelZ: parseFloat((9.78 + (Math.random() * 0.04 - 0.02)).toFixed(2))
        };
      });
    }, 120);

    return () => {
      sensorActive = false;
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
      clearInterval(interval);
    };
  }, []);

  // Request high-fidelity real-time GPS coordinates directly via the device sensors
  const scanDeviceGpsLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation API sensor is not supported by your browser.");
      return;
    }
    
    setGpsLoading(true);
    toast.info("Accessing high-precision device GPS sensors...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;
        const altitude = position.coords.altitude ? Math.round(position.coords.altitude) : null;
        const speed = position.coords.speed ? Math.round(position.coords.speed * 3.6) : null; // Convert m/s to km/h
        const heading = position.coords.heading ? Math.round(position.coords.heading) : null;

        setSensorStats(prev => ({
          ...prev,
          lat,
          lng,
          accuracy,
          altitude,
          speed,
          heading
        }));

        // Reverse-geocode coordinates to physical location label via free OpenStreetMap Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            const road = data.address?.road || data.address?.suburb || '';
            const city = data.address?.city || data.address?.town || data.address?.county || 'Dar es Salaam';
            const country = data.address?.country || 'Tanzania';
            const cleanLabel = road ? `${road}, ${city}` : `${city}, ${country}`;
            const addressString = `${cleanLabel} (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
            
            if (onLocationUpdate) {
              onLocationUpdate({ lat, lng, address: addressString });
            }
            setGpsLoading(false);
            toast.success("Synchronized GPS and live weather metrics!");
          })
          .catch(() => {
            const addressString = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (GPS Mode)`;
            if (onLocationUpdate) {
              onLocationUpdate({ lat, lng, address: addressString });
            }
            setGpsLoading(false);
            toast.success("Synchronized GPS metrics (No Internet Label)!");
          });
      },
      (err) => {
        console.error("GPS sensor failed", err);
        setGpsLoading(false);
        toast.error(`Sensor Access Blocked: ${err.message}. Enabling offline simulation.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // High-sensitivity real-time sensor computations to fine-tune climate metrics
  const sensorAdjustedWeather = React.useMemo(() => {
    if (!isSensorWeatherSensitive) {
      return {
        ...weather,
        pressureHpa: 1013,
        altitude: sensorStats.altitude !== null ? sensorStats.altitude : 12,
        tempComp: 0,
        tiltWindOffset: 0,
        tiltHumidOffset: 0
      };
    }
    
    // 1. Calculate elevation-based temperature compensation (Standard Lapse Rate: -0.0065°C/m)
    // Elevation changes directly influence air density and temperature readings
    const altitude = sensorStats.altitude !== null ? sensorStats.altitude : 12; // fallback to 12m
    const tempComp = -(altitude * 0.0065);
    
    // 2. Wind adjustments based on Device Tilt (Beta/Gamma) or Gyroscope activity
    // Physical tilt mimics air velocity shifts and atmospheric currents
    const beta = sensorStats.beta || 0;
    const gamma = sensorStats.gamma || 0;
    const tiltWindOffset = Math.round((Math.abs(beta) + Math.abs(gamma)) * 0.4);
    
    // 3. Humidity adjustments based on Pitch (Beta) tilt mimicking micro-atmospheric density changes
    const tiltHumidOffset = Math.round(beta * 0.25);
    
    // 4. Calculate Barometric Pressure (hPa) based on gravity fluctuations and elevation
    const basePressure = 1013.25; // standard sea-level hPa
    const gravityOffset = ((sensorStats.accelZ || 9.8) - 9.8) * 12.5; 
    const elevationOffset = altitude * 0.12;
    const pressureHpa = Math.round(basePressure - elevationOffset + gravityOffset);
    
    // 5. Reactive weather condition shifts based on barometric pressure!
    let adjustedCondition = weather.condition;
    let adjustedAlertLevel = weather.alertLevel;
    let adjustedRecommendation = weather.recommendation;
    
    if (pressureHpa < 1002) {
      adjustedCondition = 'Thunderstorm';
      adjustedAlertLevel = 'error';
      adjustedRecommendation = "⚡ Micro-sensor trigger: Critical low barometric pressure detected! High storm sensitivity active. Secure all metal components immediately.";
    } else if (pressureHpa < 1009) {
      adjustedCondition = 'Heavy Rain';
      adjustedAlertLevel = 'error';
      adjustedRecommendation = "🌧️ Micro-sensor trigger: Depressed barometric gradient indicates moisture condensation. Wet weather repairs active. Refrain from open electrical work.";
    } else if (pressureHpa > 1019) {
      adjustedCondition = 'Sunny';
      adjustedAlertLevel = 'warning';
      adjustedRecommendation = "☀️ Micro-sensor trigger: High pressure ridge detected. High heat/dryness sensitivity active. Prevent engine overheating and stay hydrated.";
    }
    
    // 6. Apply final calculations to temperature, humidity, wind
    const finalTemp = Math.round(weather.temp + tempComp);
    const finalHumidity = Math.max(0, Math.min(100, weather.humidity + tiltHumidOffset));
    const finalWind = Math.max(0, weather.wind + tiltWindOffset);
    
    // If condition shifts, adjust UV
    let finalUv = weather.uvIndex;
    if (adjustedCondition === 'Sunny') finalUv = 10;
    else if (adjustedCondition === 'Partly Cloudy') finalUv = 6;
    else if (adjustedCondition === 'Overcast') finalUv = 3;
    else finalUv = 1;
    
    return {
      temp: finalTemp,
      condition: adjustedCondition,
      recommendation: adjustedRecommendation,
      humidity: finalHumidity,
      wind: finalWind,
      uvIndex: finalUv,
      alertLevel: adjustedAlertLevel,
      locationName: weather.locationName,
      pressureHpa,
      altitude,
      tempComp,
      tiltWindOffset,
      tiltHumidOffset
    };
  }, [weather, sensorStats, isSensorWeatherSensitive]);

  const renderWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Sunny':
        return <Sun className="text-amber-400 animate-pulse shrink-0" size={28} />;
      case 'Partly Cloudy':
        return <CloudSun className="text-slate-300 shrink-0" size={28} />;
      case 'Overcast':
        return <Cloud className="text-slate-400 shrink-0" size={28} />;
      case 'Heavy Rain':
        return <CloudRain className="text-blue-400 shrink-0" size={28} />;
      case 'Dust Storm':
        return <Wind className="text-slate-300 shrink-0 animate-pulse" size={28} />;
      case 'Thunderstorm':
        return <CloudLightning className="text-yellow-400 shrink-0" size={28} />;
      default:
        return <Sun className="text-amber-400 shrink-0" size={28} />;
    }
  };

  const alertColors = {
    success: 'bg-emerald-950/20 border-emerald-500/10 text-emerald-400/90',
    info: 'bg-sky-950/20 border-sky-500/10 text-sky-400/90',
    warning: 'bg-amber-950/20 border-amber-500/10 text-amber-500/90',
    error: 'bg-rose-950/20 border-rose-500/10 text-rose-400/90'
  };

  // Coordinates bubble level inclinometer calculations
  const bubbleX = Math.max(-42, Math.min(42, (sensorStats.gamma || 0) * 1.5));
  const bubbleY = Math.max(-42, Math.min(42, (sensorStats.beta || 0) * 1.5));

  return (
    <div className="glass-card p-4 border border-white/5 relative overflow-hidden transition-all duration-300 flex flex-col gap-3">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-yellow/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">GPS & Environmental Weather</span>
          <h4 className="text-xs font-black text-slate-100 flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-slate-yellow shrink-0" />
            <span className="truncate max-w-[150px] md:max-w-[200px]">{sensorAdjustedWeather.locationName}</span>
          </h4>
        </div>
        
        <div className="flex gap-1.5 items-center flex-wrap justify-end">
          <button
            onClick={scanDeviceGpsLocation}
            disabled={gpsLoading}
            className="bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 flex items-center gap-1 text-slate-300 disabled:opacity-50"
            title="Scan device GPS and compass sensors"
          >
            {gpsLoading ? (
              <RotateCw size={10} className="animate-spin text-slate-yellow" />
            ) : (
              <Compass size={10} className="text-slate-yellow" />
            )}
            Sync Sensors
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 py-0.5">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-2 rounded-xl flex items-center justify-center relative">
            {isLoading && (
              <div className="absolute inset-0 bg-charcoal/80 rounded-xl flex items-center justify-center">
                <RotateCw size={14} className="animate-spin text-slate-yellow" />
              </div>
            )}
            {renderWeatherIcon(sensorAdjustedWeather.condition)}
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-slate-100 tracking-tight">{sensorAdjustedWeather.temp}</span>
              <span className="text-xs font-bold text-slate-yellow">°C</span>
            </div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">{sensorAdjustedWeather.condition}</p>
          </div>
        </div>

        <div className="flex gap-1.5 shrink-0">
          <div className="bg-white/[0.02] px-2 py-1 rounded-xl flex flex-col items-center justify-center min-w-[48px] border border-white/5 relative">
            <Droplets size={10} className="text-sky-400/80 mb-0.5" />
            <span className="text-[9px] font-black text-slate-200">{sensorAdjustedWeather.humidity}%</span>
            <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Humid</span>
            {isSensorWeatherSensitive && sensorAdjustedWeather.tiltHumidOffset !== 0 && (
              <span className="absolute -top-1 -right-1 text-[5px] px-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/15 rounded scale-75">
                {sensorAdjustedWeather.tiltHumidOffset > 0 ? '+' : ''}{sensorAdjustedWeather.tiltHumidOffset}%
              </span>
            )}
          </div>
          
          <div className="bg-white/[0.02] px-2 py-1 rounded-xl flex flex-col items-center justify-center min-w-[48px] border border-white/5 relative">
            <Wind size={10} className="text-teal-400/80 mb-0.5" />
            <span className="text-[9px] font-black text-slate-200">{sensorAdjustedWeather.wind} <span className="text-[6px]">km/h</span></span>
            <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Wind</span>
            {isSensorWeatherSensitive && sensorAdjustedWeather.tiltWindOffset > 0 && (
              <span className="absolute -top-1 -right-1 text-[5px] px-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/15 rounded scale-75">
                +{sensorAdjustedWeather.tiltWindOffset}
              </span>
            )}
          </div>

          <div className="bg-white/[0.02] px-2 py-1 rounded-xl flex flex-col items-center justify-center min-w-[48px] border border-white/5">
            <Sun size={10} className="text-amber-400/80 mb-0.5" />
            <span className="text-[9px] font-black text-slate-200">{sensorAdjustedWeather.uvIndex} <span className="text-[6px]">/10</span></span>
            <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">UV</span>
          </div>
        </div>
      </div>
    
      {isSensorWeatherSensitive && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2 flex flex-wrap gap-x-3 gap-y-1 items-center justify-between text-[9px] font-medium text-emerald-400/90 leading-tight">
          <div className="flex items-center gap-1">
            <Activity size={10} className="animate-pulse" />
            <span className="font-extrabold uppercase tracking-wider text-[7px]">Climate Sensitivity Nodes:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-slate-400">
            <span>Barometer: <strong className="text-emerald-400 font-bold">{sensorAdjustedWeather.pressureHpa} hPa</strong></span>
            <span>Elevation: <strong className="text-emerald-400 font-bold">{sensorAdjustedWeather.altitude}m</strong></span>
            {sensorAdjustedWeather.tempComp !== 0 && (
              <span>Lapse Comp: <strong className="text-emerald-400 font-bold">{sensorAdjustedWeather.tempComp > 0 ? '+' : ''}{sensorAdjustedWeather.tempComp.toFixed(1)}°C</strong></span>
            )}
          </div>
        </div>
      )}

      <div className={cn("p-2.5 rounded-xl border flex gap-2 items-start text-[10px] leading-relaxed", alertColors[sensorAdjustedWeather.alertLevel])}>
        <Info size={14} className="shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[8px] font-black uppercase tracking-widest leading-none">REPAIR ADVISORY</p>
          <p className="font-medium text-slate-200">{sensorAdjustedWeather.recommendation}</p>
        </div>
      </div>

      {/* Device Sensors Diagnostics Console */}
      <div className="border-t border-white/5 pt-2">
        <button
          onClick={() => setShowSensorsConsole(prev => !prev)}
          className="w-full flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-300 py-1 transition-all"
        >
          <span className="flex items-center gap-1.5">
            <Activity size={10} className={cn("text-slate-yellow", !sensorStats.isSensorSimulated && "animate-pulse")} />
            Real-time Device Sensors Diagnostics
          </span>
          <span className="text-[8.5px] text-slate-yellow font-bold uppercase">
            {showSensorsConsole ? "[ Hide Diagnostic Logs ]" : "[ View Diagnostic Logs ]"}
          </span>
        </button>

        {showSensorsConsole && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 pt-2 overflow-hidden"
          >
            {/* Sensor Source indicator */}
            <div className="flex justify-between items-center text-[8px] bg-charcoal-light/40 border border-white/5 p-1 px-2 rounded font-bold uppercase">
              <span className="text-slate-500">Sensor Engine Status:</span>
              <span className={sensorStats.isSensorSimulated ? "text-amber-500" : "text-emerald-400"}>
                {sensorStats.isSensorSimulated ? "🖥️ Simulator Active" : "📱 Physical Hardware Connected"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Gyroscope / Horizon Level Bubble Inclinometer */}
              <div className="bg-charcoal p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center space-y-2 relative">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider self-start leading-none">Gyroscopic Level / Inclinometer</span>
                
                {/* Visual Level Level Target */}
                <div className="w-24 h-24 rounded-full border border-white/10 bg-black/40 relative flex items-center justify-center">
                  {/* Crosshairs */}
                  <div className="absolute w-full h-[1px] bg-white/5" />
                  <div className="absolute h-full w-[1px] bg-white/5" />
                  <div className="absolute w-8 h-8 rounded-full border border-slate-yellow/15" />
                  
                  {/* Floating Bubble Dot */}
                  <motion.div 
                    animate={{ x: bubbleX, y: bubbleY }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    className="w-4 h-4 rounded-full bg-slate-yellow shadow-lg shadow-slate-yellow/50 border border-charcoal absolute z-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full text-[9px] font-mono font-bold text-slate-300">
                  <div className="bg-white/5 rounded p-1">
                    <span className="text-slate-500 block text-[7px] uppercase leading-none mb-0.5">Pitch (Beta)</span>
                    <span className={sensorStats.beta > 0 ? "text-emerald-400" : sensorStats.beta < 0 ? "text-amber-500" : "text-slate-300"}>
                      {sensorStats.beta}°
                    </span>
                  </div>
                  <div className="bg-white/5 rounded p-1">
                    <span className="text-slate-500 block text-[7px] uppercase leading-none mb-0.5">Roll (Gamma)</span>
                    <span className={sensorStats.gamma > 0 ? "text-emerald-400" : sensorStats.gamma < 0 ? "text-amber-500" : "text-slate-300"}>
                      {sensorStats.gamma}°
                    </span>
                  </div>
                </div>
              </div>

              {/* Accelerometer & Coordinates Logs */}
              <div className="space-y-2.5">
                {/* GPS Coordinates Readouts */}
                <div className="bg-charcoal p-2.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none block">Physical GPS Sensor Nodes</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono font-bold text-slate-300">
                    <div className="bg-white/5 p-1 rounded">
                      <span className="text-slate-500 block text-[7px] uppercase leading-none mb-0.5">Lat</span>
                      {sensorStats.lat !== null ? sensorStats.lat.toFixed(5) : "-6.8235"}
                    </div>
                    <div className="bg-white/5 p-1 rounded">
                      <span className="text-slate-500 block text-[7px] uppercase leading-none mb-0.5">Lng</span>
                      {sensorStats.lng !== null ? sensorStats.lng.toFixed(5) : "39.2615"}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono font-bold text-slate-400">
                    <div className="bg-white/5 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[6px] uppercase leading-none mb-0.5">Altitude</span>
                      {sensorStats.altitude !== null ? `${sensorStats.altitude}m` : "12m"}
                    </div>
                    <div className="bg-white/5 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[6px] uppercase leading-none mb-0.5">Speed</span>
                      {sensorStats.speed !== null ? `${sensorStats.speed}km/h` : "0km/h"}
                    </div>
                    <div className="bg-white/5 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[6px] uppercase leading-none mb-0.5">Accuracy</span>
                      {sensorStats.accuracy !== null ? `${sensorStats.accuracy}m` : "±15m"}
                    </div>
                  </div>
                </div>

                {/* G-Force / Accelerometer */}
                <div className="bg-charcoal p-2.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none block">G-Force (Accelerometer)</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono font-bold text-slate-300">
                    <div className="bg-white/5 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[7px] uppercase leading-none mb-0.5">Axis X</span>
                      {sensorStats.accelX} m/s²
                    </div>
                    <div className="bg-white/5 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[7px] uppercase leading-none mb-0.5">Axis Y</span>
                      {sensorStats.accelY} m/s²
                    </div>
                    <div className="bg-white/5 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[7px] uppercase leading-none mb-0.5">Axis Z (Gravity)</span>
                      <span className="text-emerald-400">{sensorStats.accelZ} m/s²</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};


const CareNotificationBanner = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate dynamic contextual notifications based on registered fleet & new features
  const notifications = [
    {
      id: 'feature-1',
      title: 'Tire Pressure & Alignment Alert',
      message: 'Keep tires inflated to specs during humid Tanzanian sunny periods to prolong tread lifetime!',
      icon: <TrendingUp className="text-emerald-400 shrink-0" size={16} />,
      badge: 'VIYEKO CARE TIP'
    },
    {
      id: 'feature-2',
      title: 'Real-time Mechanical Aid is Live',
      message: 'You can now book express towing and mechanical dispatch inside Tanzania with custom pricing support!',
      icon: <Sparkles className="text-slate-yellow shrink-0 animate-pulse" size={16} />,
      badge: 'NEW FEATURE'
    },
    {
      id: 'feature-3',
      title: 'Monsoon Driving Advice',
      message: 'Wet surfaces require deeper tread. If outdoor repairs are needed, place a safety warning triangle 50m behind.',
      icon: <ShieldCheck className="text-sky-400 shrink-0" size={16} />,
      badge: 'SAFETY ALERT'
    },
    {
      id: 'feature-4',
      title: 'Brake Check Special Service',
      message: 'Book comprehensive brake inspection and fluid replacement through our expert technicians.',
      icon: <Wrench className="text-purple-400 shrink-0" size={16} />,
      badge: 'VIYEKO OFFERS'
    }
  ];

  // If they have registered vehicles, prioritize custom vehicle-specific reminders!
  const allNotifications = [...notifications];
  if (vehicles && vehicles.length > 0) {
    vehicles.forEach((vehicle) => {
      allNotifications.unshift({
        id: `vehicle-remind-${vehicle.id}`,
        title: `${vehicle.make} ${vehicle.model} Care Alert`,
        message: `Registered vehicle (${vehicle.plate}) is currently protected by VIYEKO Care. Recommended 5,000km general oil & filter fluid check is advised soon!`,
        icon: <Car className="text-slate-yellow shrink-0" size={16} />,
        badge: 'VEHICLE REMINDER'
      });
    });
  } else {
    allNotifications.unshift({
      id: 'no-vehicle',
      title: 'No Registered Car Under VIYEKO Care',
      message: 'Add your car details in the Profile tab to enable customized servicing reminders and safety stats tailored to your vehicle make!',
      icon: <Bell className="text-rose-400 shrink-0" size={16} />,
      badge: 'FLEET PROTECTION'
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % allNotifications.length);
    }, 6000); // cycle every 6 seconds
    return () => clearInterval(interval);
  }, [allNotifications.length]);

  return (
    <div className="glass-card p-4 border border-white/5 relative overflow-hidden transition-all duration-300 flex flex-col gap-3 min-h-[96px] justify-between shadow-xl">
      <div className="absolute top-0 right-0 w-16 h-16 bg-slate-yellow/[0.03] rounded-full blur-xl pointer-events-none" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex gap-3 items-start"
        >
          <div className="bg-white/5 p-2 rounded-xl shrink-0 mt-0.5 flex items-center justify-center">
            {allNotifications[currentIndex]?.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-yellow/10 text-slate-yellow border border-slate-yellow/10">
                {allNotifications[currentIndex]?.badge}
              </span>
              <h5 className="text-[11px] font-extrabold text-slate-100 truncate">
                {allNotifications[currentIndex]?.title}
              </h5>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
              {allNotifications[currentIndex]?.message}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-1 items-center justify-center pt-1 border-t border-white/[0.03]">
        {allNotifications.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              idx === currentIndex ? "w-4 bg-slate-yellow" : "w-1.5 bg-white/10 hover:bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

interface AvatarUploadZoneProps {
  currentAvatar: string;
  onAvatarChanged: (newAvatarBase64: string) => void;
  id: string;
}

const AvatarUploadZone: React.FC<AvatarUploadZoneProps> = ({ currentAvatar, onAvatarChanged, id }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file only.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onAvatarChanged(reader.result as string);
      toast.success('Profile photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div 
        id={id}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e: any) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          };
          input.click();
        }}
        className={cn(
          "w-full py-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all gap-2 p-4 text-center",
          isDragging 
            ? "border-slate-yellow bg-slate-yellow/10 text-slate-yellow" 
            : "border-white/10 hover:border-slate-yellow/40 bg-white/5 hover:bg-white/10"
        )}
      >
        <img src={currentAvatar} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-slate-yellow shadow-md" />
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-100 uppercase tracking-widest">
            {isDragging ? "Drop your photo!" : "Drag & Drop Image"}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Or click to select photo</p>
        </div>
      </div>
      
      {/* Preset Fast Avatars Gallery */}
      <div className="w-full space-y-1.5 pt-1">
        <p className="text-[8px] font-bold uppercase text-slate-500 tracking-wider text-center">Or select from helper presets</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', // Female
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100', // Female 2
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', // Male
            'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=100', // Male 2
            'https://picsum.photos/seed/user1/200/200',
            'https://picsum.photos/seed/user2/200/200'
          ].map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onAvatarChanged(url);
                toast.success('Preselected avatar applied!');
              }}
              className="relative rounded-full overflow-hidden w-8 h-8 border border-white/10 hover:border-slate-yellow/50 transition-all active:scale-90 shrink-0"
            >
              <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [route, setRoute] = useState<'landing' | 'prototype'>(() => {
    const path = window.location.pathname;
    return path === '/prototype' ? 'prototype' : 'landing';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setRoute(path === '/prototype' ? 'prototype' : 'landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToRoute = (newRoute: 'landing' | 'prototype') => {
    setRoute(newRoute);
    const newPath = newRoute === 'prototype' ? '/prototype' : '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  const [activeTab, setActiveTab] = useState<'home' | 'care' | 'history' | 'profile'>('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat?: number; lng?: number; address: string }>({ address: 'Dar es Salaam, Tanzania' });
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProviderMode, setIsProviderMode] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);
  const [isTrackingMinimized, setIsTrackingMinimized] = useState(false);
  const [user, setUser] = useState<UserType>({
    name: 'Godson Rubenga',
    phone: '+91 98765 43210',
    email: 'godsonrubenga3@gmail.com',
    avatar: 'https://picsum.photos/seed/user/200/200'
  });

  // Services State Configurations
  // 1. Breakdown (Tow Truck Distance)
  const [towMiles, setTowMiles] = useState<number>(5);
  // 2. Tire Options
  const [tireOption, setTireOption] = useState<'spare' | 'new'>('spare');
  const [tireServiceType, setTireServiceType] = useState<'basic' | 'full'>('basic');
  const [newTirePrice, setNewTirePrice] = useState<number>(150000); // Between 85k and 600K Tsh
  // 3. Fuel Options
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('petrol');
  const [fuelLiters, setFuelLiters] = useState<number>(10);
  const [fuelDistanceKm, setFuelDistanceKm] = useState<number>(5);
  // 4. Car Wash Options
  const [carWashBasic, setCarWashBasic] = useState<boolean>(true);
  const [carWashVacuum, setCarWashVacuum] = useState<boolean>(false);
  const [carWashDetailing, setCarWashDetailing] = useState<boolean>(false);
  const [carWashDetailingPrice, setCarWashDetailingPrice] = useState<number>(300000); // 300K to 650K Tsh
  // Addon custom preference notes
  const [addOnSpecification, setAddOnSpecification] = useState<string>('');

  // 6. Care Unit Specific States
  const [careVenue, setCareVenue] = useState<'home' | 'garage'>('home');
  const [careDate, setCareDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [careTime, setCareTime] = useState<string>('10:00');
  const [selectedCareVehicle, setSelectedCareVehicle] = useState<string>('1');
  const [careServiceType, setCareServiceType] = useState<'detailing' | 'servicing' | 'recovery' | 'modifications'>('detailing');
  const [valetOption, setValetOption] = useState<'diy' | 'valet'>('diy');
  const [careNotes, setCareNotes] = useState<string>('');
  
  // Care Unit - Customer Service Chat Support Modal States
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [supportQuery, setSupportQuery] = useState<string>('');
  const [isSendingQuery, setIsSendingQuery] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{sender: 'user' | 'agent', text: string}[]>([
    { sender: 'agent', text: 'Jambo! Warm welcome to VIYEKO Care. You can type any service query or custom modifications/servicing requests below, and our care personnel will coordinate with you and our mobile valet team immediately.' }
  ]);

  // Global set of recent notifications to prevent duplication
  const shownToastsRef = React.useRef<Record<string, number>>({});

  // Context-aware notification filter based on whether User or Provider mode is active
  const notify = {
    success: (msg: string, target: 'user' | 'provider' | 'both' = 'both') => {
      if (target === 'user' && isProviderMode) return;
      if (target === 'provider' && !isProviderMode) return;
      
      const now = Date.now();
      const lastShown = shownToastsRef.current[msg] || 0;
      if (now - lastShown < 2000) return; // Deduplicate
      shownToastsRef.current[msg] = now;
      
      toast.success(msg);
    },
    error: (msg: string, target: 'user' | 'provider' | 'both' = 'both') => {
      if (target === 'user' && isProviderMode) return;
      if (target === 'provider' && !isProviderMode) return;
      
      const now = Date.now();
      const lastShown = shownToastsRef.current[msg] || 0;
      if (now - lastShown < 2000) return; // Deduplicate
      shownToastsRef.current[msg] = now;
      
      toast.error(msg);
    },
    info: (msg: string, target: 'user' | 'provider' | 'both' = 'both') => {
      if (target === 'user' && isProviderMode) return;
      if (target === 'provider' && !isProviderMode) return;
      
      const now = Date.now();
      const lastShown = shownToastsRef.current[msg] || 0;
      if (now - lastShown < 2000) return; // Deduplicate
      shownToastsRef.current[msg] = now;
      
      toast.info(msg);
    },
    warning: (msg: string, target: 'user' | 'provider' | 'both' = 'both') => {
      if (target === 'user' && isProviderMode) return;
      if (target === 'provider' && !isProviderMode) return;
      
      const now = Date.now();
      const lastShown = shownToastsRef.current[msg] || 0;
      if (now - lastShown < 2000) return; // Deduplicate
      shownToastsRef.current[msg] = now;
      
      toast.warning(msg);
    }
  };

  const getBookingPriceTSh = () => {
    if (!selectedService) return 0;
    
    let basePriceTSh = 0;
    
    if (selectedService.id === 'breakdown') {
      // 1. Summoning 200,000Tsh + 15,000Tsh per mile
      basePriceTSh = 200000 + (15000 * towMiles);
    } else if (selectedService.id === 'tire') {
      // 2. Changing tire is 8,000Tsh normally and 40,000Tsh for full package, also new tire costs 85,000 to 600,000
      const laborCost = tireServiceType === 'basic' ? 8000 : 40000;
      const materialsCost = tireOption === 'new' ? newTirePrice : 0;
      basePriceTSh = laborCost + materialsCost;
    } else if (selectedService.id === 'fuel') {
      // 3. Petrol is 4,086Tsh per liter, diesel is 4,333Tsh per liter, delivery charges 2,000 per km
      const fuelRate = fuelType === 'petrol' ? 4086 : 4333;
      const fuelCost = fuelLiters * fuelRate;
      const deliveryCost = fuelDistanceKm * 2000;
      basePriceTSh = fuelCost + deliveryCost;
    } else if (selectedService.id === 'wash') {
      // 4. Basic wash: 15,000, vacuuming: 55,000, detailing: 300,000 - 650,000
      let washCost = 0;
      if (carWashBasic) washCost += 15000;
      if (carWashVacuum) washCost += 55000;
      if (carWashDetailing) washCost += carWashDetailingPrice;
      basePriceTSh = washCost;
    } else {
      // Fallback
      basePriceTSh = (selectedService.price || 0) * 100;
    }
    
    // Addons cost (drinks & snacks only)
    const addonsCostTSh = selectedAddOns.reduce((acc, id) => {
      const addon = SERVICES.find(s => s.id === id);
      return acc + (addon ? addon.price * 100 : 0);
    }, 0);
    
    return basePriceTSh + addonsCostTSh;
  };

  const getBookingPriceBreakdown = (): { label: string; amount: number }[] => {
    if (!selectedService) return [];
    
    const breakdown: { label: string; amount: number }[] = [];
    
    if (selectedService.id === 'breakdown') {
      breakdown.push({ label: 'Summoning Base Fee', amount: 200000 });
      breakdown.push({ label: `Towing Distance (${towMiles} Miles x 15,000 TSh)`, amount: 15000 * towMiles });
    } else if (selectedService.id === 'tire') {
      const laborCost = tireServiceType === 'basic' ? 8000 : 40000;
      const laborLabel = tireServiceType === 'basic' ? 'Basic Labor (Tire swap)' : 'Full Labor Package';
      breakdown.push({ label: laborLabel, amount: laborCost });
      
      if (tireOption === 'new') {
        breakdown.push({ label: `New Replacement Tire`, amount: newTirePrice });
      }
    } else if (selectedService.id === 'fuel') {
      const fuelRate = fuelType === 'petrol' ? 4086 : 4333;
      const fuelLabel = fuelType === 'petrol' ? 'Petrol' : 'Diesel';
      breakdown.push({ label: `${fuelLabel} (${fuelLiters}L x TSh ${fuelRate.toLocaleString()})`, amount: fuelLiters * fuelRate });
      breakdown.push({ label: `Delivery Fee (${fuelDistanceKm} KM x TSh 2,000)`, amount: fuelDistanceKm * 2000 });
    } else if (selectedService.id === 'wash') {
      if (carWashBasic) {
        breakdown.push({ label: 'Basic Wash', amount: 15000 });
      }
      if (carWashVacuum) {
        breakdown.push({ label: 'Interior Vacuuming', amount: 55000 });
      }
      if (carWashDetailing) {
        breakdown.push({ label: `Showroom Detailing`, amount: carWashDetailingPrice });
      }
    } else {
      breakdown.push({ label: `${selectedService.title} Base Service`, amount: (selectedService.price || 0) * 100 });
    }
    
    selectedAddOns.forEach(id => {
      const addon = SERVICES.find(s => s.id === id);
      if (addon) {
        breakdown.push({ label: `Add-on: ${addon.title}`, amount: addon.price * 100 });
      }
    });
    
    return breakdown;
  };
  
  // Provider dynamic account details
  const [providerAccount, setProviderAccount] = useState(() => {
    const saved = localStorage.getItem('viyeko_provider_account');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      name: 'Ally Salum',
      phone: '+255 712 345 678',
      email: 'ally.salum@viyeko.com',
      avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=300',
      isOnline: true,
      vehicleMake: 'Toyota',
      vehicleModel: 'Hilux Heavy Tow',
      vehiclePlate: 'T 123 ABC',
      vehicleColor: 'Yellow',
      services: ['breakdown', 'tire', 'fuel', 'wash'],
      region: 'Dar es Salaam'
    };
  });

  // Editing state for profiles (aligned and dynamic)
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserName, setEditUserName] = useState('Godson Rubenga');
  const [editUserPhone, setEditUserPhone] = useState('+91 98765 43210');
  const [editUserEmail, setEditUserEmail] = useState('godsonrubenga3@gmail.com');
  const [editUserAvatar, setEditUserAvatar] = useState('https://picsum.photos/seed/user/200/200');

  const [isEditingProvider, setIsEditingProvider] = useState(false);
  const [editProviderName, setEditProviderName] = useState('Ally Salum');
  const [editProviderPhone, setEditProviderPhone] = useState('+255 712 345 678');
  const [editProviderEmail, setEditProviderEmail] = useState('ally.salum@viyeko.com');
  const [editProviderAvatar, setEditProviderAvatar] = useState('https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=300');
  const [editProviderVehicleMake, setEditProviderVehicleMake] = useState('Toyota');
  const [editProviderVehicleModel, setEditProviderVehicleModel] = useState('Hilux Heavy Tow');
  const [editProviderVehiclePlate, setEditProviderVehiclePlate] = useState('T 123 ABC');
  const [editProviderVehicleColor, setEditProviderVehicleColor] = useState('Yellow');
  const [editProviderServices, setEditProviderServices] = useState<string[]>(['breakdown', 'tire', 'fuel', 'wash']);
  const [editProviderRegion, setEditProviderRegion] = useState('Dar es Salaam');

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', make: 'Maruti', model: 'Swift', plate: 'CH01-XX-0000', color: 'White' },
    { id: '2', make: 'Hyundai', model: 'i20', plate: 'PB65-YY-1111', color: 'Red' }
  ]);

  const [customPrices, setCustomPrices] = useState<Record<string, { base: number; distance: number; materials: number }>>({});

  // Simulated Provider State
  const [providerStats, setProviderStats] = useState(() => {
    const saved = localStorage.getItem('viyeko_provider_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const savedEarnings = localStorage.getItem('viyeko_provider_earnings');
    const baseEarnings = savedEarnings ? parseInt(savedEarnings, 10) : 1245200;
    return {
      earnings: baseEarnings,
      rating: 4.92,
      ratingsCount: 148,
      level: 5,
      xp: 4200,
      maxXp: 5000,
      jobsCompleted: 482,
      successRate: '99.1%',
      speed: '~8 min',
      rank: 'Elite Rescue Specialist'
    };
  });

  const [providerFeedback, setProviderFeedback] = useState(() => {
    const saved = localStorage.getItem('viyeko_provider_feedback');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'f-1', customer: 'Janeth Mwenisongole', rating: 5, comment: 'Amazing speed! Reached Mikocheni in 8 minutes and fixed my flat tire immediately.', date: '2 hours ago', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100' },
      { id: 'f-2', customer: 'Baraka Khalfan', rating: 5, comment: 'Professional and very polite. Highly recommended for roadside recovery.', date: '3 days ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
      { id: 'f-3', customer: 'Sarah Kimario', rating: 5, comment: 'Engine overheating problem solved with great skill. Fair pricing too.', date: '1 week ago', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' },
      { id: 'f-4', customer: 'Kelvin Shayo', rating: 4, comment: 'Helped me jumpstart my battery in heavy rain at Posta Mpya. Quick and helpful.', date: '2 weeks ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' }
    ];
  });

  const [providerSimulatedJobs, setProviderSimulatedJobs] = useState([
    { 
      id: 'sim-1', 
      clientName: 'Devota Shayo', 
      serviceId: 'flat_tire', 
      location: 'Oysterbay, Dar es Salaam', 
      vehicle: 'Toyota RAV4 (T 412 DGB)', 
      customBasePrice: 750,
      distancePrice: 150,
      materialsPrice: 50,
      notes: 'Stuck near Palm Beach Hotel. Flat left front tire.', 
      status: 'available',
      distance: '1.2 km',
      eta: '10 mins',
      expiresInSeconds: 30
    },
    { 
      id: 'sim-2', 
      clientName: 'Joseph Temu', 
      serviceId: 'towing', 
      location: 'Kinondoni, Dar es Salaam', 
      vehicle: 'Mercedes Benz C200 (T 980 CAS)', 
      customBasePrice: 1800,
      distancePrice: 200,
      materialsPrice: 100,
      notes: 'Engine overheating, white smoke from hood. Stranded on Ali Hassan Mwinyi Rd.', 
      status: 'available',
      distance: '3.4 km',
      eta: '15 mins',
      expiresInSeconds: 45
    },
    { 
      id: 'sim-3', 
      clientName: 'Michael John', 
      serviceId: 'battery', 
      location: 'Upanga, Dar es Salaam', 
      vehicle: 'Ford Ranger (T 552 DDX)', 
      customBasePrice: 450,
      distancePrice: 120,
      materialsPrice: 30,
      notes: 'Battery dead, needs a jumpstart or terminal cleaning. Near Muhimbili Hospital.', 
      status: 'available',
      distance: '2.1 km',
      eta: '8 mins',
      expiresInSeconds: 60
    }
  ]);

  const [providerSimulatedHistory, setProviderSimulatedHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('viyeko_provider_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'sim-h1', clientName: 'Lilian Kamau', serviceId: 'flat_tire', location: 'Kariakoo, Dar es Salaam', date: 'Yesterday', payout: 75000, rating: 5, review: 'Fantastic service! Quick responsive swap' },
      { id: 'sim-h2', clientName: 'Frank Peter', serviceId: 'fuel_delivery', location: 'Mbezi, Dar es Salaam', date: '3 days ago', payout: 60000, rating: 5, review: 'Saved me on my way home from work.' },
      { id: 'sim-h3', clientName: 'Sarah Kimario', serviceId: 'towing', location: 'Mikochemi, Dar es Salaam', date: '5 days ago', payout: 155000, rating: 5, review: 'Professional and transparent towing.' }
    ];
  });

  // Handle active job countdown transfer timers (Decrement + Auto-transfer)
  useEffect(() => {
    if (!providerAccount.isOnline) {
      return; // Do not run countdown timer if provider is offline
    }
    const timerId = setInterval(() => {
      setProviderSimulatedJobs(prev => {
        const expiringJobs = prev.filter(
          job => job.status === 'available' && job.expiresInSeconds !== undefined && job.expiresInSeconds <= 1
        );

        if (expiringJobs.length > 0) {
          // Add transfer history logs with guaranteed unique IDs
          setProviderSimulatedHistory(history => {
            const existingIds = new Set(history.map(h => h.id));
            const nextEntries = expiringJobs
              .map(job => {
                const uniqueId = `transferred-${job.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
                return {
                  id: uniqueId,
                  clientName: job.clientName,
                  serviceId: job.serviceId,
                  location: typeof job.location === 'object' && job.location !== null ? (job.location as any).address : job.location,
                  date: 'Just Now',
                  payout: 0,
                  rating: 0,
                  status: 'transferred',
                  review: 'Overdue transfer: Job automatically moved to another closer provider (response window elapsed).'
                };
              })
              .filter(entry => !existingIds.has(entry.id));

            return [...nextEntries, ...history];
          });

          expiringJobs.forEach(job => {
            notify.warning(`Emergency Call from ${job.clientName} was transferred to another nearby helper!`, 'provider');
          });

          // Filter out expired jobs from next jobs state
          return prev
            .map(job => {
              if (job.status === 'available' && job.expiresInSeconds !== undefined) {
                const nextVal = job.expiresInSeconds - 1;
                if (nextVal <= 0) return null;
                return { ...job, expiresInSeconds: nextVal };
              }
              return job;
            })
            .filter(Boolean) as any[];
        }

        // Just decrement remaining jobs safely
        return prev.map(job => {
          if (job.status === 'available' && job.expiresInSeconds !== undefined) {
            return { ...job, expiresInSeconds: Math.max(0, job.expiresInSeconds - 1) };
          }
          return job;
        });
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [providerAccount.isOnline]);

  // Synchronize user profile to localStorage
  useEffect(() => {
    localStorage.setItem('viyeko_user_profile', JSON.stringify(user));
  }, [user]);

  // Synchronize provider account to localStorage
  useEffect(() => {
    localStorage.setItem('viyeko_provider_account', JSON.stringify(providerAccount));
  }, [providerAccount]);

  // Synchronize provider stats to localStorage
  useEffect(() => {
    localStorage.setItem('viyeko_provider_stats', JSON.stringify(providerStats));
  }, [providerStats]);

  // Synchronize provider feedback to localStorage
  useEffect(() => {
    localStorage.setItem('viyeko_provider_feedback', JSON.stringify(providerFeedback));
  }, [providerFeedback]);

  // Synchronize provider history to localStorage
  useEffect(() => {
    localStorage.setItem('viyeko_provider_history', JSON.stringify(providerSimulatedHistory));
  }, [providerSimulatedHistory]);

  const handleAcceptSimulatedJob = (id: string) => {
    setProviderSimulatedJobs(prev => prev.map(job => 
      job.id === id ? { ...job, status: 'on-the-way' } : job
    ));
    notify.info('Job accepted! Driving to customer location.', 'provider');
  };

  const handleAdvanceSimulatedJob = (id: string) => {
    setProviderSimulatedJobs(prev => {
      let matchedJob: any = null;
      const updated = prev.map(job => {
        if (job.id === id) {
          let nextStatus = job.status;
          if (job.status === 'on-the-way') {
            nextStatus = 'arrived';
            notify.success('You have arrived at the customer location!', 'provider');
          } else if (job.status === 'arrived') {
            nextStatus = 'completed';
            matchedJob = job;
          }
          return { ...job, status: nextStatus };
        }
        return job;
      });
      if (matchedJob) {
        // Run completion callback next tick or right here
        setTimeout(() => handleCompleteSimulatedJob(matchedJob), 50);
        return prev.filter(j => j.id !== id);
      }
      return updated;
    });
  };

  const handleCompleteSimulatedJob = (job: any) => {
    const totalPayoutUnits = job.customBasePrice + job.distancePrice + job.materialsPrice;
    const finalCurrencyAmt = totalPayoutUnits * 100;

    setProviderStats(prev => {
      const nextXp = prev.xp + 250;
      const leveledUp = nextXp >= prev.maxXp;
      const finalLevel = leveledUp ? prev.level + 1 : prev.level;
      const finalXp = leveledUp ? nextXp - prev.maxXp : nextXp;
      const nextEarnings = prev.earnings + finalCurrencyAmt;

      return {
        ...prev,
        earnings: nextEarnings,
        jobsCompleted: prev.jobsCompleted + 1,
        xp: finalXp,
        level: finalLevel,
        ratingsCount: prev.ratingsCount + 1,
      };
    });

    const reviews = [
      'Amazing and extremely fast rescue!',
      'Lifesaver, top class equipment and very professional',
      'Extremely satisfied, polite technician and fast turnaround',
      'Highest quality service, arrived faster than estimated!'
    ];
    const randomReview = reviews[Math.floor(Math.random() * reviews.length)];

    setProviderSimulatedHistory(prev => [
      {
        id: `sim-h-${Date.now()}`,
        clientName: job.clientName,
        serviceId: job.serviceId,
        location: job.location,
        date: 'Just Now',
        payout: finalCurrencyAmt,
        rating: 5,
        review: randomReview
      },
      ...prev
    ]);

    setProviderFeedback(prev => [
      {
        id: `feed-${Date.now()}`,
        customer: job.clientName,
        rating: 5,
        comment: randomReview,
        date: 'Just Now',
        avatar: `https://picsum.photos/seed/${job.clientName.replace(/\s+/g, '')}/100/100`
      },
      ...prev
    ]);

    localStorage.setItem('viyeko_provider_earnings', String(providerStats.earnings + finalCurrencyAmt));
    notify.success(`Job completed! Earned TSh ${finalCurrencyAmt.toLocaleString()}`, 'provider');
  };

  const handleAdjustSimPrice = (id: string, field: 'distancePrice' | 'materialsPrice', value: number) => {
    setProviderSimulatedJobs(prev => prev.map(job => 
      job.id === id ? { ...job, [field]: value } : job
    ));
  };

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [providerHomeSubTab, setProviderHomeSubTab] = useState<'emergencies' | 'bookings'>('emergencies');
  const [transferringRequestId, setTransferringRequestId] = useState<string | null>(null);
  const [transferringJobId, setTransferringJobId] = useState<string | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [showSettingsResetConfirm, setShowSettingsResetConfirm] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [newVehicleMake, setNewVehicleMake] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleColor, setNewVehicleColor] = useState('');

  const activeRequest = requests.find(r => r.status !== 'completed');

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('viyeko_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('viyeko_theme', 'light');
    }
  };

  const toggleProviderMode = () => {
    const nextMode = !isProviderMode;
    setIsProviderMode(nextMode);
    setActiveTab('home');
    if (nextMode) {
      fetchActiveSearchingRequests();
    }
  };

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        const nameVal = firebaseUser.displayName || 'User';
        const emailVal = firebaseUser.email || '';
        const phoneVal = firebaseUser.phoneNumber || '+91 98765 43210';
        const avatarVal = firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200/200`;
        setUser({
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          avatar: avatarVal
        });
        setEditUserName(nameVal);
        setEditUserEmail(emailVal);
        setEditUserPhone(phoneVal);
        setEditUserAvatar(avatarVal);
        fetchUserData(firebaseUser.uid);
      } else {
        // Fall back to offline localStorage values
        const nameVal = 'Guest User';
        const phoneVal = '+91 98765 43210';
        const emailVal = '';
        const avatarVal = 'https://picsum.photos/seed/guest/200/200';
        setUser({
          name: nameVal,
          phone: phoneVal,
          email: emailVal,
          avatar: avatarVal
        });
        setEditUserName(nameVal);
        setEditUserPhone(phoneVal);
        setEditUserEmail(emailVal);
        setEditUserAvatar(avatarVal);
        const savedRequests = localStorage.getItem('viyeko_requests');
        if (savedRequests) {
          try {
            setRequests(JSON.parse(savedRequests));
          } catch (e) {
            console.error(e);
          }
        } else {
          setRequests([]);
        }
        setVehicles([
          { id: '1', make: 'Maruti', model: 'Swift', plate: 'CH01-XX-0000', color: 'White' },
          { id: '2', make: 'Hyundai', model: 'i20', plate: 'PB65-YY-1111', color: 'Red' }
        ]);
      }
    });

    const theme = localStorage.getItem('viyeko_theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    return () => unsubscribe();
  }, []);

  // Synchronize initial geolocation to find out if they are in Tanzania or elsewhere and address reverse geocoding
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              const addressName = data.display_name || data.name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
              setLocation({ lat, lng, address: addressName });
            })
            .catch(() => {
              const inTanzania = lat >= -12 && lat <= -1 && lng >= 29 && lng <= 41;
              let label = inTanzania ? "Dar es Salaam, Tanzania" : "Dar es Salaam, Tanzania";
              setLocation({ lat, lng, address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (${label})` });
            });
        },
        (error) => {
          console.error("Auto geolocate on mount failed:", error);
          // Standard Tanzania default
          setLocation({ address: 'Dar es Salaam, Tanzania' });
        }
      );
    }
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      // Fetch user profile
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef).catch(err => {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
        throw err;
      });
      if (userSnap && userSnap.exists()) {
        const userData = userSnap.data();
        const profile = {
          name: userData.name || 'User',
          phone: userData.phone || '',
          email: userData.email || '',
          avatar: userData.avatar || `https://picsum.photos/seed/${uid}/200/200`
        };
        setUser(profile);
        setEditUserName(profile.name);
        setEditUserPhone(profile.phone);
        setEditUserEmail(profile.email);
        setEditUserAvatar(profile.avatar);
      }

      // Fetch requests
      const reqQuery = query(collection(db, 'requests'), where('uid', '==', uid));
      const reqSnap = await getDocs(reqQuery).catch(err => {
        handleFirestoreError(err, OperationType.LIST, 'requests');
        throw err;
      });
      if (reqSnap) {
        const firebaseReqs: Request[] = [];
        reqSnap.forEach(docSnap => {
          firebaseReqs.push(docSnap.data() as Request);
        });
        setRequests(firebaseReqs.sort((a,b) => b.timestamp - a.timestamp));
      }

      // Fetch vehicles
      const vehQuery = query(collection(db, 'vehicles'), where('uid', '==', uid));
      const vehSnap = await getDocs(vehQuery).catch(err => {
        handleFirestoreError(err, OperationType.LIST, 'vehicles');
        throw err;
      });
      if (vehSnap) {
        const firebaseVehs: Vehicle[] = [];
        vehSnap.forEach(docSnap => {
          firebaseVehs.push(docSnap.data() as Vehicle);
        });
        if (firebaseVehs.length > 0) {
          setVehicles(firebaseVehs);
        }
      }
    } catch (error: any) {
      if (isOfflineError(error)) {
        console.warn('Firestore is offline/unreachable while fetching user data. Operating in offline/local fallback state.');
      } else {
        console.error('Error fetching user data from Firestore:', error);
      }
    }
  };

  const fetchActiveSearchingRequests = async () => {
    try {
      if (!currentUser) return;
      // Get active searching requests
      const reqQuery = query(collection(db, 'requests'), where('status', '==', 'searching'));
      const reqSnap = await getDocs(reqQuery);
      if (reqSnap) {
        const activeReqs: Request[] = [];
        reqSnap.forEach(docSnap => {
          activeReqs.push(docSnap.data() as Request);
        });
        // Merge them into requests state safely, avoiding duplicates by id
        setRequests(prev => {
          const prevMap = new Map(prev.map(r => [r.id, r]));
          activeReqs.forEach(r => prevMap.set(r.id, r));
          return Array.from(prevMap.values()).sort((a,b) => b.timestamp - a.timestamp);
        });
      }
    } catch (error: any) {
      if (isOfflineError(error)) {
        console.warn('Firestore is offline/unreachable while fetching active searching requests. Operating in offline/local fallback state.');
      } else {
        console.error('Error fetching active searching requests:', error);
      }
    }
  };

  const handleTransferRequest = async (requestId: string, providerName: string, providerPhone: string) => {
    const updated = requests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'transferred' as const,
          notes: r.notes ? `${r.notes}\n\n[Transferred to provider: ${providerName} (${providerPhone})]` : `[Transferred to provider: ${providerName} (${providerPhone})]`
        };
      }
      return r;
    });
    setRequests(updated);

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'requests', requestId), {
          status: 'transferred',
          notes: `[Transferred to provider: ${providerName} (${providerPhone})]`
        }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
        });
      } catch (error: any) {
        if (isOfflineError(error)) {
          console.warn('Firestore offline while transferring request.');
        } else {
          console.error('Failed to transfer request in Firestore:', error);
        }
      }
    }
    notify.success(`Booking successfully transferred to ${providerName}!`, 'provider');
    setTransferringRequestId(null);
  };

  const handleTransferSimulatedJob = (jobId: string, providerName: string, providerPhone: string) => {
    const jobName = providerSimulatedJobs.find(j => j.id === jobId)?.clientName || 'Incident';
    setProviderSimulatedJobs(prev => prev.filter(job => job.id !== jobId));
    setProviderSimulatedHistory(prev => [
      {
        id: `transferred-${jobId}-${Date.now()}`,
        clientName: providerSimulatedJobs.find(j => j.id === jobId)?.clientName || 'Client',
        serviceId: providerSimulatedJobs.find(j => j.id === jobId)?.serviceId || 'towing',
        location: providerSimulatedJobs.find(j => j.id === jobId)?.location || 'Tanzania',
        date: 'Just Now',
        payout: 0,
        status: 'transferred',
        review: `Transferred to provider: ${providerName} (${providerPhone})`
      },
      ...prev
    ]);
    notify.success(`Dispatch successfully transferred to ${providerName}!`, 'provider');
    setTransferringJobId(null);
  };

  // Save requests offline fallback to localStorage
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('viyeko_requests', JSON.stringify(requests));
    }
  }, [requests, currentUser]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const requestId = Math.random().toString(36).substr(2, 9);
    const totalCost = getBookingPriceTSh() / 100;

    let finalNotes = notes;
    if (selectedAddOns.length > 0 && addOnSpecification) {
      finalNotes = finalNotes ? `${finalNotes}\n[Add-on Specification: ${addOnSpecification}]` : `[Add-on Specification: ${addOnSpecification}]`;
    }

    const breakdownLines = getBookingPriceBreakdown().map(item => `- ${item.label}: TSh ${item.amount.toLocaleString()}`);
    const breakdownText = breakdownLines.length > 0 ? `\n\n[Cost Breakdown]\n${breakdownLines.join('\n')}` : '';
    finalNotes = finalNotes ? `${finalNotes}${breakdownText}` : breakdownText.replace(/^\n\n/, '');

    const newRequest: Request = {
      id: requestId,
      serviceId: selectedService.id,
      addOnIds: selectedAddOns,
      status: 'searching',
      location,
      timestamp: Date.now(),
      vehicleInfo,
      notes: finalNotes,
      estimatedArrival: Math.floor(Math.random() * 10) + 10, // 10-20 mins
      totalCost
    };

    setRequests([newRequest, ...requests]);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'requests', requestId), {
          ...newRequest,
          uid: currentUser.uid
        }).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, `requests/${requestId}`);
          throw err;
        });
      } catch (error: any) {
        if (isOfflineError(error)) {
          console.warn('Firestore offline while creating request.');
        } else {
          console.error('Firestore save failed', error);
        }
        notify.error('Local copy saved. Cloud sync failed.', 'user');
      }
    }

    setIsSubmitting(false);
    setSelectedService(null);
    setSelectedAddOns([]);
    setAddOnSpecification('');
    setVehicleInfo('');
    setNotes('');
    setLastRequestId(requestId);
    setIsTrackingMinimized(false);
    notify.success('Request sent successfully!', 'user');
  };

  const advanceStatus = async (requestId: string) => {
    const statusOrder: Request['status'][] = ['searching', 'assigned', 'on-the-way', 'arrived', 'in-progress', 'completed'];
    let nextStatus: Request['status'] = 'searching';
    let nextArrival = 0;

    const updated = requests.map(r => {
      if (r.id === requestId) {
        const currentIndex = statusOrder.indexOf(r.status);
        nextStatus = statusOrder[currentIndex + 1] || 'completed';
        nextArrival = nextStatus === 'completed' ? 0 : Math.max(0, (r.estimatedArrival || 0) - 3);

        if (nextStatus === 'assigned') notify.info('Provider assigned!', 'user');
        if (nextStatus === 'on-the-way') notify.info('Provider is on the way!', 'user');
        if (nextStatus === 'arrived') notify.success('Provider has arrived!', 'user');
        if (nextStatus === 'completed') notify.success('Service completed!', 'user');

        return { 
          ...r, 
          status: nextStatus,
          estimatedArrival: nextArrival
        };
      }
      return r;
    });

    setRequests(updated);

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'requests', requestId), {
          status: nextStatus,
          estimatedArrival: nextArrival
        }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
          throw err;
        });
      } catch (error: any) {
        if (isOfflineError(error)) {
          console.warn('Firestore offline while updating status.');
        } else {
          console.error('Firestore status update failed:', error);
        }
      }
    }
  };

  const handleAcceptJob = async (reqId: string, currentArrival?: number) => {
    const nextArrival = currentArrival ? Math.max(5, Math.floor(currentArrival * 0.6)) : 15;
    const updated = requests.map(r => 
      r.id === reqId ? { 
        ...r, 
        status: 'on-the-way' as const,
        estimatedArrival: nextArrival
      } : r
    );
    setRequests(updated);

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'requests', reqId), {
          status: 'on-the-way',
          estimatedArrival: nextArrival
        }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `requests/${reqId}`);
          throw err;
        });
      } catch (error: any) {
        if (isOfflineError(error)) {
          console.warn('Firestore offline while accepting job.');
        } else {
          console.error('Firestore update failed', error);
        }
      }
    }
    notify.info('Job accepted!', 'provider');
  };

  const handleMarkDone = async (reqId: string) => {
    const updated = requests.map(r => 
      r.id === reqId ? { ...r, status: 'completed' as const, estimatedArrival: 0 } : r
    );
    setRequests(updated);

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'requests', reqId), {
          status: 'completed',
          estimatedArrival: 0
        }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `requests/${reqId}`);
          throw err;
        });
      } catch (error: any) {
        if (isOfflineError(error)) {
          console.warn('Firestore offline while completing job.');
        } else {
          console.error('Firestore update failed', error);
        }
      }
    }
    notify.success('Job completed!', 'provider');
  };

  const handleSendSupportQuery = () => {
    if (!supportQuery.trim()) return;
    
    const userMsg = supportQuery;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSupportQuery('');
    
    // Simulate support reply
    setTimeout(() => {
      let reply = "Asante for contacting VIYEKO Care. Our representative is notified. We are updating Godson Rubenga’s service log right now.";
      if (userMsg.toLowerCase().includes('mod') || userMsg.toLowerCase().includes('modif')) {
        reply = "Beautiful choice! Regarding modifications, we offer full premium body-styling kits, interior sound customizations, and wrap styling at our Oysterbay garage or via specialized Valet delivery. Our modification specialist was dispatched to review your request.";
      } else if (userMsg.toLowerCase().includes('accident') || userMsg.toLowerCase().includes('recover')) {
        reply = "🚨 Emergency Notification Received. Our high-power specialized flatbed recovery truck is ready for instant dispatch. We are checking coordinate availability.";
      } else if (userMsg.toLowerCase().includes('detailing') || userMsg.toLowerCase().includes('clean')) {
        reply = "Understood. Showroom detailing takes approx 3-5 hours. You can choose Home cleaning or Viyeko Garage drop-off using the master Care Scheduler below.";
      }
      setChatHistory(prev => [...prev, { sender: 'agent', text: reply }]);
      notify.info('VIYEKO personnel representative replied!', 'user');
    }, 1200);
  };

  const handleBookCareService = () => {
    // Generate scheduled entry inside history!
    const targetVehObj = vehicles.find(v => v.id === selectedCareVehicle) || vehicles[0] || { make: 'Toyota', model: 'RAV4', plate: 'T 412 DGB', color: 'White' };
    const vehName = `${targetVehObj.color} ${targetVehObj.make} ${targetVehObj.model} (${targetVehObj.plate})`;
    
    const careTextMap: Record<string, string> = {
      detailing: 'Premium Showroom Detailing',
      servicing: 'Comprehensive Vehicle Servicing',
      modifications: 'Vehicle Custom Modifications',
      recovery: 'Accident Trailer Recovery Response'
    };
    
    const calculatedBase = careServiceType === 'detailing' ? 300000 : careServiceType === 'recovery' ? 200000 : 150000;
    
    const notesStr = `Scheduled service: ${careTextMap[careServiceType]}.\nLocation: ${careVenue === 'home' ? 'At Home/Office deep clean & detailed' : 'Viyeko Main Garage service'}.\nHandling: ${valetOption === 'valet' ? 'Valet pick-up & delivery requested' : 'User will self-drive'}.\nInstructions: ${careNotes}`;
    
    const newReq: Request = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: careServiceType === 'detailing' ? 'wash' : careServiceType === 'recovery' ? 'breakdown' : 'repair',
      addOnIds: [],
      status: 'assigned',
      location: { address: careVenue === 'home' ? 'Home/Office coordinates (Detailed at Home)' : 'Viyeko Central Garage (Dar es Salaam)' },
      timestamp: Date.parse(`${careDate}T${careTime}`) || Date.now(),
      vehicleInfo: vehName,
      notes: notesStr,
      estimatedArrival: 15,
      totalCost: calculatedBase / 100 // index mapped TSh scale (e.g. 3000 TSh scale factor)
    };

    setRequests([newReq, ...requests]);
    setCareNotes('');
    notify.success(`Succesfully Booked! Scheduled for ${careDate} at ${careTime}.`, 'user');
  };

  const handleCancelRequest = async (reqId: string) => {
    const updated = requests.map(r => r.id === reqId ? { ...r, status: 'completed' as const, estimatedArrival: 0 } : r);
    setRequests(updated);

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'requests', reqId), {
          status: 'completed',
          estimatedArrival: 0
        }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `requests/${reqId}`);
          throw err;
        });
      } catch (error: any) {
        if (isOfflineError(error)) {
          console.warn('Firestore offline while cancelling request.');
        } else {
          console.error('Firestore cancel failed', error);
        }
      }
    }
    notify.error('Request cancelled', 'user');
  };

  const handleSetCustomQuote = async (reqId: string, pricing: { base: number; distance: number; materials: number }) => {
    const finalTotal = pricing.base + pricing.distance + pricing.materials;
    const updated = requests.map(r => r.id === reqId ? { ...r, totalCost: finalTotal } : r);
    setRequests(updated);
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'requests', reqId), {
          totalCost: finalTotal
        }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `requests/${reqId}`);
          throw err;
        });
        notify.success(`Custom price of TSh ${(finalTotal * 100).toLocaleString()} sent to user!`, 'provider');
      } catch (error: any) {
        if (isOfflineError(error)) {
          console.warn('Firestore offline while setting custom quote.');
        } else {
          console.error('Firestore update totalCost failed', error);
        }
      }
    } else {
      notify.success(`Custom price of TSh ${(finalTotal * 100).toLocaleString()} updated locally!`, 'provider');
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleMake || !newVehicleModel || !newVehiclePlate || !newVehicleColor) return;

    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      make: newVehicleMake,
      model: newVehicleModel,
      plate: newVehiclePlate,
      color: newVehicleColor,
    };

    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'vehicles', newVehicle.id), {
          ...newVehicle,
          uid: currentUser.uid,
          year: 2024,
          initialMileage: 0,
          currentMileage: 0,
          createdAt: Date.now()
        }).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, `vehicles/${newVehicle.id}`);
          throw err;
        });
        notify.success('Vehicle synced to cloud!', 'user');
      } catch (error: any) {
        if (isOfflineError(error)) {
          console.warn('Firestore offline while syncing vehicle.');
        } else {
          console.error(error);
        }
        notify.error('Failed to sync vehicle to cloud.', 'user');
      }
    } else {
      notify.success('Vehicle added (Guest Mode)!', 'user');
    }

    setNewVehicleMake('');
    setNewVehicleModel('');
    setNewVehiclePlate('');
    setNewVehicleColor('');
    setShowAddVehicle(false);
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
    setVehicles(updatedVehicles);

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'vehicles', vehicleId)).catch(err => {
          handleFirestoreError(err, OperationType.DELETE, `vehicles/${vehicleId}`);
          throw err;
        });
        notify.success('Vehicle removed from cloud!', 'user');
      } catch (error: any) {
        if (isOfflineError(error)) {
          console.warn('Firestore offline while deleting vehicle.');
        } else {
          console.error('Failed to delete vehicle from Firestore', error);
        }
        notify.error('Failed to remove vehicle from cloud.', 'user');
      }
    } else {
      notify.success('Vehicle removed (Guest Mode)!', 'user');
    }
  };

  const triggerFirstTimeSetup = async () => {
    setVehicles([]);
    setRequests([]);
    
    const emptyUser = {
      name: 'My Profile',
      phone: '',
      email: currentUser?.email || '',
      avatar: 'https://picsum.photos/seed/newuser/200/200'
    };
    setUser(emptyUser);
    setEditUserName('');
    setEditUserPhone('');
    setEditUserEmail(currentUser?.email || '');
    setEditUserAvatar('https://picsum.photos/seed/newuser/200/200');
    
    if (currentUser) {
      try {
        const batchPromises: Promise<any>[] = [];
        
        const vehQuery = query(collection(db, 'vehicles'), where('uid', '==', currentUser.uid));
        const vehSnap = await getDocs(vehQuery);
        vehSnap.forEach(docSnap => {
          batchPromises.push(deleteDoc(doc(db, 'vehicles', docSnap.id)));
        });
        
        const reqQuery = query(collection(db, 'requests'), where('uid', '==', currentUser.uid));
        const reqSnap = await getDocs(reqQuery);
        reqSnap.forEach(docSnap => {
          batchPromises.push(deleteDoc(doc(db, 'requests', docSnap.id)));
        });

        batchPromises.push(setDoc(doc(db, 'users', currentUser.uid), {
          ...emptyUser,
          uid: currentUser.uid,
          role: 'user',
          updatedAt: Date.now()
        }));
        
        await Promise.all(batchPromises);
        notify.success('Cloud profile and vehicles reset successfully!', 'user');
      } catch (error) {
        console.error("Firestore reset failed:", error);
        notify.error('Could not completely clear cloud data, resetting local view.', 'user');
      }
    } else {
      localStorage.removeItem('viyeko_requests');
      localStorage.setItem('viyeko_user_profile', JSON.stringify(emptyUser));
      notify.success('Local profile and vehicles reset successfully!', 'user');
    }
    
    setActiveTab('profile');
    setIsEditingUser(true);
    setShowAddVehicle(true);
  };

  const [showProviderResetConfirm, setShowProviderResetConfirm] = useState(false);

  const triggerProviderCleanSlate = () => {
    // 1. Reset Stats
    setProviderStats({
      earnings: 0,
      rating: 5.0,
      ratingsCount: 0,
      level: 1,
      xp: 0,
      maxXp: 1000,
      jobsCompleted: 0,
      successRate: '100%',
      speed: '--',
      rank: 'Novice Responder'
    });
    
    // 2. Clear Feedback
    setProviderFeedback([]);
    
    // 3. Clear simulated/active jobs
    setProviderSimulatedJobs([]);
    
    // 4. Clear simulated history
    setProviderSimulatedHistory([]);
    
    // 5. Reset provider Account details
    const cleanProviderAccount = {
      name: 'New Provider',
      phone: '',
      email: currentUser?.email || '',
      avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=300',
      isOnline: false,
      vehicleMake: '',
      vehicleModel: '',
      vehiclePlate: '',
      vehicleColor: '',
      services: [],
      region: 'Dar es Salaam'
    };
    setProviderAccount(cleanProviderAccount);
    
    // Reset editing state
    setEditProviderName('New Provider');
    setEditProviderPhone('');
    setEditProviderEmail(currentUser?.email || '');
    setEditProviderAvatar('https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=300');
    setEditProviderVehicleMake('');
    setEditProviderVehicleModel('');
    setEditProviderVehiclePlate('');
    setEditProviderVehicleColor('');
    setEditProviderServices([]);
    setEditProviderRegion('Dar es Salaam');

    // LocalStorage resets
    localStorage.removeItem('viyeko_provider_earnings');
    localStorage.removeItem('viyeko_provider_stats');
    localStorage.removeItem('viyeko_provider_feedback');
    localStorage.removeItem('viyeko_provider_history');
    localStorage.removeItem('viyeko_provider_account');

    notify.success('Provider profile has been wiped to a clean slate!', 'provider');
    setIsEditingProvider(true); // Open edit mode to let them set up immediately!
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              const addressName = data.display_name || data.name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
              setLocation({ lat, lng, address: addressName });
              setShowLocationPicker(false);
            })
            .catch(() => {
              const inTanzania = lat >= -12 && lat <= -1 && lng >= 29 && lng <= 41;
              let label = inTanzania ? "Dar es Salaam, Tanzania" : "Dar es Salaam, Tanzania";
              setLocation({ lat, lng, address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (${label})` });
              setShowLocationPicker(false);
            });
        },
        (error) => {
          console.error('Error getting location', error);
          setLocation({ address: 'Dar es Salaam, Tanzania' }); // Fallback
          setShowLocationPicker(false);
        }
      );
    }
  };

  const filteredLocations = POPULAR_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (true) {
    return (
      <>
        <LandingPage />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <div className="h-screen bg-charcoal flex flex-col md:flex-row w-full sm:max-w-lg md:max-w-6xl mx-auto shadow-2xl relative overflow-hidden font-sans transition-colors duration-300 edge-lighting">
      <Toaster position="top-center" richColors />
      {/* Header / Sidebar */}
      <header className="bg-charcoal text-slate-100 p-6 pt-8 md:pt-16 md:w-80 md:rounded-b-none md:rounded-r-[3rem] shadow-lg z-10 relative overflow-hidden flex flex-col shrink-0 border-r border-border-theme">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-yellow/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex md:flex-col justify-between items-center md:items-start mb-2 md:mb-8 relative z-10 gap-6 w-full">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic text-slate-yellow">VIYEKO</h1>
          
          {/* User / Provider Profile Summary */}
          <div className="hidden md:flex items-center gap-3 p-3 bg-charcoal-light rounded-2xl border border-border-theme w-full">
            <img 
              src={isProviderMode ? providerAccount.avatar : user.avatar} 
              alt={isProviderMode ? providerAccount.name : user.name} 
              className="w-10 h-10 rounded-full border border-slate-yellow/50 object-cover" 
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-slate-100 truncate">
                {isProviderMode ? providerAccount.name : user.name}
              </span>
              <span className="text-[10px] text-slate-500 font-bold truncate">
                {isProviderMode ? providerAccount.phone : user.phone}
              </span>
              {isProviderMode && (
                <span className={cn(
                  "text-[8.5px] font-black uppercase tracking-wider mt-0.5",
                  providerAccount.isOnline ? "text-emerald-400 animate-pulse" : "text-amber-500"
                )}>
                  ● {providerAccount.isOnline ? "Online Mode" : "Offline Mode"}
                </span>
              )}
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-start gap-2.5 w-full">
            <button 
              onClick={toggleProviderMode}
              className={cn(
                "px-3 py-1.5 md:w-full md:text-center rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                isProviderMode ? "bg-slate-yellow text-charcoal" : "bg-charcoal-light border border-border-theme text-slate-100 hover:brightness-110"
              )}
            >
              {isProviderMode ? "Provider Mode" : "User Mode"}
            </button>
            
            <button 
              onClick={() => navigateToRoute('landing')}
              className="px-3 py-1.5 md:w-full md:text-center rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            >
              ← Exit to Landing
            </button>
            
            {isProviderMode && (
              <button
                onClick={() => {
                  const nextOnline = !providerAccount.isOnline;
                  setProviderAccount(prev => ({ ...prev, isOnline: nextOnline }));
                  if (nextOnline) {
                    notify.success("You are now ONLINE. Standing by for emergency calls!", 'provider');
                  } else {
                    notify.warning("You are now OFFLINE. Emergency calls and countdowns are paused.", 'provider');
                  }
                }}
                className={cn(
                  "px-3 py-1.5 md:w-full md:text-center rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
                  providerAccount.isOnline 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25" 
                    : "bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/25"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{providerAccount.isOnline ? "Go Offline" : "Go Online"}</span>
              </button>
            )}

            <button 
              onClick={toggleDarkMode}
              className="p-2 bg-charcoal-light border border-border-theme rounded-full hover:brightness-110 transition-colors flex items-center gap-2 md:w-full md:justify-center text-slate-100"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} className="text-yellow-400 animate-spin-slow" /> : <Moon size={18} className="text-purple-600 dark:text-purple-400 fill-purple-600/25" />}
              <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>
        </div>
        <p className="text-slate-400 text-sm font-medium relative z-10 mb-8 hidden md:block">Reliable Roadside Assistance & Vehicle Care in Tanzania</p>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-col gap-2 relative z-10">
          <button 
            onClick={() => setActiveTab('home')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs",
              activeTab === 'home' ? "bg-slate-yellow text-charcoal shadow-lg shadow-slate-yellow/20" : "text-slate-400 hover:bg-charcoal-light/40 border border-transparent hover:border-border-theme"
            )}
          >
            <Navigation size={20} />
            Home
          </button>
          {!isProviderMode && (
            <button 
              onClick={() => setActiveTab('care')}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs",
                activeTab === 'care' ? "bg-slate-yellow text-charcoal shadow-lg shadow-slate-yellow/20" : "text-slate-400 hover:bg-charcoal-light/40 border border-transparent hover:border-border-theme"
              )}
            >
              <Sparkles size={20} />
              Care Unit
            </button>
          )}
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs",
              activeTab === 'history' ? "bg-slate-yellow text-charcoal shadow-lg shadow-slate-yellow/20" : "text-slate-400 hover:bg-charcoal-light/40 border border-transparent hover:border-border-theme"
            )}
          >
            <History size={20} />
            History
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs",
              activeTab === 'profile' ? "bg-slate-yellow text-charcoal shadow-lg shadow-slate-yellow/20" : "text-slate-400 hover:bg-charcoal-light/40 border border-transparent hover:border-border-theme"
            )}
          >
            <Activity size={20} />
            Profile
          </button>
        </div>

        <div className="mt-auto relative z-10 hidden md:block">
          <div className="p-4 bg-charcoal-light rounded-2xl border border-border-theme">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Support</p>
            <p className="text-xs text-slate-400">Need help? Call our 24/7 dispatch center.</p>
            <a href="tel:112" className="mt-3 block text-center bg-charcoal border border-border-theme hover:bg-charcoal-light py-2 rounded-xl text-xs font-bold transition-colors">112 Emergency</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-0 px-6 pb-24 md:pt-4 md:px-12 md:pb-12 scrollbar-hide">
        <AnimatePresence mode="wait">
          {isProviderMode ? (
            activeTab === 'home' ? (
              <motion.div
                key="provider-home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 animate-fadeIn"
              >
                {/* Stats Dashboard Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-card p-3 flex flex-col justify-between border-b border-b-slate-yellow/30">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <TrendingUp size={12} className="text-slate-yellow" />
                      <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Earnings</span>
                    </div>
                    <span className="text-lg font-black text-slate-100 mt-2">TSh {providerStats.earnings.toLocaleString()}</span>
                  </div>
                  <div className="glass-card p-3 flex flex-col justify-between border-b border-b-emerald-500/30">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Star size={12} className="text-slate-yellow fill-slate-yellow" />
                      <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Rating</span>
                    </div>
                    <span className="text-lg font-black text-slate-100 mt-2">{providerStats.rating} <span className="text-[10px] text-slate-400">★</span></span>
                  </div>
                  <div className="glass-card p-3 flex flex-col justify-between border-b border-b-amber-500/30">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Award size={12} className="text-slate-yellow" />
                      <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Rank Status</span>
                    </div>
                    <span className="text-xs font-black text-slate-100 mt-2 truncate">{providerStats.rank}</span>
                  </div>
                </div>

                {/* Rank Progression & Exclusive Services */}
                <div className="glass-card p-4 space-y-3 border border-slate-yellow/20 bg-slate-yellow/[0.02]">
                  <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Award size={11} className="text-slate-yellow" /> Active Tier: Platinum Elite Level 5</span>
                    <span className="font-mono text-slate-300">{providerStats.xp} / {providerStats.maxXp} RP</span>
                  </div>
                  <div className="w-full bg-charcoal-light rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-slate-yellow h-full transition-all duration-305"
                      style={{ width: `${(providerStats.xp / providerStats.maxXp) * 100}%` }}
                    />
                  </div>
                  
                  {/* Premium Quality & Exclusive services */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-extrabold uppercase flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                        Exclusive VIP Services Unlocked:
                      </span>
                      <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                        ★ Platinum Premium Certified
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                      {providerAccount.name} has a top tier score (<span className="text-slate-yellow font-bold">{providerStats.rating} ★</span>) and high performance level. Enabled exclusive requests: Heavy-Duty Commercial Towing, Advanced EV Battery Recalibration, Premium Keyless Car Unlock, and Urgent Fuel Reserves.
                    </p>
                  </div>
                </div>

                {/* Unified Live Dispatches and Care Bookings Panel */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-100 italic tracking-tight uppercase">
                        {providerHomeSubTab === 'emergencies' ? 'Emergency Dispatch Calls' : 'Care Unit & Service Bookings'}
                      </h2>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                        {providerHomeSubTab === 'emergencies' 
                          ? 'GPS dispatched emergencies near your current location' 
                          : 'Customer appointments and mobile valet bookings'}
                      </p>
                    </div>
                    
                    <div className="flex bg-charcoal-light/60 p-1 rounded-2xl border border-white/5 shrink-0 self-stretch md:self-auto">
                      <button
                        onClick={() => setProviderHomeSubTab('emergencies')}
                        className={cn(
                          "flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                          providerHomeSubTab === 'emergencies' 
                            ? "bg-slate-yellow text-charcoal font-black shadow-md shadow-slate-yellow/10" 
                            : "text-slate-400 hover:text-slate-200"
                        )}
                      >
                        <Zap size={11} />
                        Emergencies ({providerSimulatedJobs.length})
                      </button>
                      <button
                        onClick={() => {
                          setProviderHomeSubTab('bookings');
                          fetchActiveSearchingRequests();
                        }}
                        className={cn(
                          "flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                          providerHomeSubTab === 'bookings' 
                            ? "bg-slate-yellow text-charcoal font-black shadow-md shadow-slate-yellow/10" 
                            : "text-slate-400 hover:text-slate-200"
                        )}
                      >
                        <Calendar size={11} />
                        Bookings ({requests.filter(r => r.status !== 'completed' && r.status !== 'transferred').length})
                      </button>
                    </div>
                  </div>

                  {!providerAccount.isOnline ? (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-8 text-center space-y-4 animate-fadeIn">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
                        <AlertTriangle size={24} className="animate-bounce" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-slate-100 tracking-tight text-sm uppercase">Currently Offline</h3>
                        <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                          You are currently offline. Toggle online to start receiving live GPS-dispatched emergency calls and service appointments near you.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProviderAccount(prev => ({ ...prev, isOnline: true }));
                          notify.success("Ready for rescue! Standing by for emergency dispatches.", 'provider');
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider mx-auto block hover:brightness-110 transition-all shadow-md active:scale-95"
                      >
                        ⚡ Go Online Now
                      </button>
                    </div>
                  ) : providerHomeSubTab === 'emergencies' ? (
                    /* EMERGENCIES SUB-TAB CONTENT */
                    providerSimulatedJobs.length === 0 ? (
                      <div className="bg-charcoal-light/10 border border-white/5 rounded-3xl py-12 text-center space-y-4">
                        <Award size={32} className="mx-auto text-slate-yellow animate-bounce" />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">All nearby active dispatch emergencies resolved or transferred!</p>
                        <button 
                          onClick={() => {
                            setProviderSimulatedJobs([
                              { 
                                id: 'sim-1', 
                                clientName: 'Devota Shayo', 
                                serviceId: 'flat_tire', 
                                location: 'Oysterbay, Dar es Salaam', 
                                vehicle: 'Toyota RAV4 (T 412 DGB)', 
                                customBasePrice: 750,
                                distancePrice: 150,
                                materialsPrice: 50,
                                notes: 'Stuck near Palm Beach Hotel. Flat left front tire.', 
                                status: 'available',
                                distance: '1.2 km',
                                eta: '10 mins',
                                expiresInSeconds: 30
                              },
                              { 
                                id: 'sim-2', 
                                clientName: 'Joseph Temu', 
                                serviceId: 'towing', 
                                location: 'Kinondoni, Dar es Salaam', 
                                vehicle: 'Mercedes Benz C200 (T 980 CAS)', 
                                customBasePrice: 1800,
                                distancePrice: 200,
                                materialsPrice: 100,
                                notes: 'Engine overheating, white smoke from hood. Stranded on Ali Hassan Mwinyi Rd.', 
                                status: 'available',
                                distance: '3.4 km',
                                eta: '15 mins',
                                expiresInSeconds: 45
                              },
                              { 
                                id: 'sim-3', 
                                clientName: 'Michael John', 
                                serviceId: 'battery', 
                                location: 'Upanga, Dar es Salaam', 
                                vehicle: 'Ford Ranger (T 552 DDX)', 
                                customBasePrice: 450,
                                distancePrice: 120,
                                materialsPrice: 30,
                                notes: 'Battery dead, needs a jumpstart or terminal cleaning. Near Muhimbili.', 
                                status: 'available',
                                distance: '2.1 km',
                                eta: '8 mins',
                                expiresInSeconds: 60
                              }
                            ]);
                            notify.success('Incidents list reset successfully!', 'provider');
                          }}
                          className="bg-slate-yellow text-charcoal px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider mx-auto block"
                        >
                          Scan For Active Emergencies
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {providerSimulatedJobs.map(job => {
                          const service = SERVICES.find(s => s.id === job.serviceId);
                          const totalPayout = job.customBasePrice + job.distancePrice + job.materialsPrice;
                          return (
                            <div 
                              key={job.id} 
                              className={cn(
                                "glass-card p-4 space-y-4 border-l-4 transition-all relative overflow-hidden",
                                job.status === 'available' ? "border-l-slate-yellow" :
                                job.status === 'on-the-way' ? "border-l-amber-500 bg-amber-500/5" :
                                "border-l-emerald-500 bg-emerald-500/5 animate-pulse"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[8px] font-black uppercase tracking-wider bg-charcoal-light py-0.5 px-2 rounded border border-white/5 text-slate-yellow flex items-center gap-1">
                                      <Zap size={8} /> Emergency GPS Dispatch
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                                      🗺️ {job.distance}
                                    </span>
                                    {job.status === 'available' && job.expiresInSeconds !== undefined && (
                                      <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                        ⚠️ Auto-Transfer in: {job.expiresInSeconds}s
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="font-extrabold text-slate-100 text-sm leading-none flex items-center gap-2">
                                    {job.clientName}
                                  </h3>
                                </div>
                                <div className={cn(
                                  "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                  job.status === 'available' ? "bg-slate-yellow/10 text-slate-yellow border-slate-yellow/30" :
                                  job.status === 'on-the-way' ? "bg-amber-400/10 text-amber-400 border-amber-400/30" :
                                  "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                                )}>
                                  {job.status === 'available' ? 'Incoming' : job.status}
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className={cn("p-2 rounded-xl text-white shrink-0 shadow-lg", service?.color || 'bg-slate-700')}>
                                  {service ? <service.icon size={16} /> : <Wrench size={16} />}
                                </div>
                                <div className="space-y-1.5 text-xs flex-1">
                                  <p className="font-extrabold text-slate-200">{service?.title || 'Emergency Help'}</p>
                                  <p className="text-[10px] font-bold text-slate-400">{job.vehicle}</p>
                                  <p className="text-[11px] text-slate-300 italic">"{job.notes}"</p>
                                  <div className="flex items-center gap-2 text-slate-400 pt-1 text-[11px]">
                                    <MapPin size={12} className="text-slate-yellow shrink-0" />
                                    <span>{job.location}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Surcharges / Bidding Setup */}
                              {job.status === 'available' && (
                                <div className="bg-charcoal-light/30 border border-white/5 rounded-2xl p-3 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-yellow">Customize Surcharges (Bidding)</span>
                                    <span className="text-[9px] font-mono font-bold text-slate-400">Base Unit: {job.customBasePrice}</span>
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-[8px] font-bold uppercase text-slate-500">Travel Distance Premium</span>
                                      <span className="text-slate-yellow font-bold font-mono">TSh {(job.distancePrice * 100).toLocaleString()}</span>
                                    </div>
                                    <input 
                                      type="range"
                                      min="50"
                                      max="500"
                                      step="10"
                                      value={job.distancePrice}
                                      onChange={(e) => handleAdjustSimPrice(job.id, 'distancePrice', Number(e.target.value))}
                                      className="w-full h-1 bg-charcoal-light rounded-lg accent-slate-yellow cursor-pointer"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-[8px] font-bold uppercase text-slate-500">Fluctuation & Equipment Premium</span>
                                      <span className="text-slate-yellow font-bold font-mono">TSh {(job.materialsPrice * 100).toLocaleString()}</span>
                                    </div>
                                    <input 
                                      type="range"
                                      min="0"
                                      max="800"
                                      step="20"
                                      value={job.materialsPrice}
                                      onChange={(e) => handleAdjustSimPrice(job.id, 'materialsPrice', Number(e.target.value))}
                                      className="w-full h-1 bg-charcoal-light rounded-lg accent-slate-yellow cursor-pointer"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimated Payout</span>
                                <span className="text-sm font-black text-slate-yellow font-mono">TSh {(totalPayout * 100).toLocaleString()}</span>
                              </div>

                              <div className="pt-2 flex flex-col gap-2">
                                <div className="flex gap-2">
                                  {job.status === 'available' && (
                                    <button
                                      onClick={() => handleAcceptSimulatedJob(job.id)}
                                      className="flex-1 bg-slate-yellow text-charcoal py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                    >
                                      <Zap size={12} />
                                      Accept & Drive Now
                                    </button>
                                  )}
                                  {job.status === 'on-the-way' && (
                                    <button
                                      onClick={() => handleAdvanceSimulatedJob(job.id)}
                                      className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                    >
                                      <Clock size={12} className="animate-spin" />
                                      Arrived at Destination
                                    </button>
                                  )}
                                  {job.status === 'arrived' && (
                                    <button
                                      onClick={() => handleAdvanceSimulatedJob(job.id)}
                                      className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                    >
                                      <CheckCircle2 size={12} className="animate-pulse" />
                                      Complete Assistance
                                    </button>
                                  )}

                                  {/* Opt to Transfer simulated job */}
                                  <button
                                    onClick={() => setTransferringJobId(job.id)}
                                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1"
                                  >
                                    <CornerUpRight size={12} />
                                    Transfer Dispatch
                                  </button>
                                </div>

                                <div className="flex gap-2">
                                  <a
                                    href="tel:+255750057757"
                                    className="flex-1 bg-charcoal border border-white/10 text-slate-400 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-charcoal-light transition-all text-center flex items-center justify-center gap-1"
                                  >
                                    <Phone size={11} />
                                    Call Godson
                                  </a>
                                  <a
                                    href="tel:+255747746619"
                                    className="flex-1 bg-charcoal border border-white/10 text-slate-400 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-charcoal-light transition-all text-center flex items-center justify-center gap-1"
                                  >
                                    <Phone size={11} />
                                    Call Francis
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    /* CARE UNIT BOOKINGS SUB-TAB CONTENT */
                    requests.filter(r => r.status !== 'completed' && r.status !== 'transferred').length === 0 ? (
                      <div className="bg-charcoal-light/10 border border-white/5 rounded-3xl py-12 text-center space-y-4">
                        <Calendar size={32} className="mx-auto text-slate-yellow animate-bounce" />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">No active service appointments or care unit bookings found!</p>
                        <button 
                          onClick={() => fetchActiveSearchingRequests()}
                          className="bg-slate-yellow text-charcoal px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider mx-auto block"
                        >
                          Check for New Bookings
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {requests.filter(r => r.status !== 'completed' && r.status !== 'transferred').map(req => {
                          const service = SERVICES.find(s => s.id === req.serviceId);
                          const isScheduled = req.timestamp > Date.now() + 1000 * 60 * 60;
                          return (
                            <div 
                              key={req.id} 
                              className={cn(
                                "glass-card p-4 space-y-4 border-l-4 transition-all relative overflow-hidden",
                                req.status === 'searching' ? "border-l-slate-yellow" :
                                req.status === 'assigned' ? "border-l-blue-500 bg-blue-500/[0.02]" :
                                req.status === 'on-the-way' ? "border-l-amber-500 bg-amber-500/[0.02]" :
                                "border-l-emerald-500 bg-emerald-500/[0.02]"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[8px] font-black uppercase tracking-wider bg-charcoal-light py-0.5 px-2 rounded border border-white/5 text-slate-yellow flex items-center gap-1">
                                      <Sparkles size={8} /> Care Booking
                                    </span>
                                    {isScheduled && (
                                      <span className="text-[8px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 py-0.5 px-2 rounded">
                                        📅 Scheduled
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                                      {new Date(req.timestamp).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  </div>
                                  <h3 className="font-extrabold text-slate-100 text-sm leading-none flex items-center gap-2">
                                    Customer ({req.vehicleInfo ? req.vehicleInfo.split('(')[0] : 'Guest'})
                                  </h3>
                                </div>
                                <div className={cn(
                                  "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                  req.status === 'searching' ? "bg-slate-yellow/10 text-slate-yellow border-slate-yellow/30" :
                                  req.status === 'assigned' ? "bg-blue-400/10 text-blue-400 border-blue-400/30" :
                                  req.status === 'on-the-way' ? "bg-amber-400/10 text-amber-400 border-amber-400/30" :
                                  "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                                )}>
                                  {req.status}
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className={cn("p-2 rounded-xl text-white shrink-0 shadow-lg", service?.color || 'bg-slate-700')}>
                                  {service ? <service.icon size={16} /> : <Wrench size={16} />}
                                </div>
                                <div className="space-y-1.5 text-xs flex-1">
                                  <p className="font-extrabold text-slate-200">{service?.title || 'Custom Repair Service'}</p>
                                  <p className="text-[10px] font-bold text-slate-400">Vehicle: {req.vehicleInfo}</p>
                                  <p className="text-[11px] text-slate-300 italic">"{req.notes}"</p>
                                  <div className="flex items-center gap-2 text-slate-400 pt-1 text-[11px]">
                                    <MapPin size={12} className="text-slate-yellow shrink-0" />
                                    <span>{req.location.address}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated Payout</span>
                                <span className="text-sm font-black text-slate-yellow font-mono">TSh {(req.totalCost * 100).toLocaleString()}</span>
                              </div>

                              <div className="pt-2 flex flex-col gap-2">
                                <div className="flex gap-2">
                                  {req.status === 'searching' && (
                                    <button
                                      onClick={() => handleAcceptJob(req.id, req.estimatedArrival)}
                                      className="flex-1 bg-slate-yellow text-charcoal py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                                    >
                                      <Check size={12} strokeWidth={3} />
                                      Confirm Booking
                                    </button>
                                  )}
                                  {req.status === 'assigned' && (
                                    <button
                                      onClick={() => advanceStatus(req.id)}
                                      className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                                    >
                                      <Navigation size={12} />
                                      Set: On the Way
                                    </button>
                                  )}
                                  {req.status === 'on-the-way' && (
                                    <button
                                      onClick={() => advanceStatus(req.id)}
                                      className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                                    >
                                      <MapPin size={12} />
                                      Arrived
                                    </button>
                                  )}
                                  {req.status === 'arrived' && (
                                    <button
                                      onClick={() => advanceStatus(req.id)}
                                      className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                                    >
                                      <Wrench size={12} />
                                      Start Service
                                    </button>
                                  )}
                                  {req.status === 'in-progress' && (
                                    <button
                                      onClick={() => advanceStatus(req.id)}
                                      className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                                    >
                                      <CheckCircle2 size={12} />
                                      Complete Service
                                    </button>
                                  )}

                                  {/* Opt to Transfer care unit booking */}
                                  <button
                                    onClick={() => setTransferringRequestId(req.id)}
                                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1"
                                  >
                                    <CornerUpRight size={12} />
                                    Transfer Booking
                                  </button>
                                </div>

                                <div className="flex gap-2">
                                  <a
                                    href="tel:+255750057757"
                                    className="flex-1 bg-charcoal border border-white/10 text-slate-400 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-charcoal-light transition-all text-center flex items-center justify-center gap-1"
                                  >
                                    <Phone size={11} />
                                    Call Godson
                                  </a>
                                  <a
                                    href="tel:+255747746619"
                                    className="flex-1 bg-charcoal border border-white/10 text-slate-400 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-charcoal-light transition-all text-center flex items-center justify-center gap-1"
                                  >
                                    <Phone size={11} />
                                    Call Francis
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'history' ? (
              <motion.div
                key="provider-history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 animate-fadeIn"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black text-slate-100 italic tracking-tight uppercase">DISPATCH RECORD</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">History of completed rescues</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-charcoal-light border border-border-theme flex items-center justify-center px-3 py-1 rounded-full font-bold text-slate-300 uppercase tracking-widest font-mono">
                      {providerSimulatedHistory.filter(h => h.status !== 'transferred').length + requests.filter(r => r.status === 'completed').length} Resolved
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Combines both User requests if marked as completed and Simulated Logs */}
                  {requests.filter(r => r.status === 'completed').map(req => {
                    const service = SERVICES.find(s => s.id === req.serviceId);
                    return (
                      <div key={req.id} className="glass-card p-4 space-y-3 hover:border-slate-yellow/20 transition-all animate-fadeIn">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg text-white", service?.color)}>
                              {service && <service.icon size={16} />}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-100 text-sm leading-none mb-1">{service?.title}</h4>
                              <p className="text-[9px] text-slate-500 font-bold">{format(req.timestamp, 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                          <span className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                            Client Job
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs text-slate-400">
                          <p className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-500" /> {req.location.address}</p>
                          <p className="flex items-center gap-1.5"><Car size={12} className="text-slate-500" /> Client: Godson • {req.vehicleInfo}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-slate-yellow fill-slate-yellow" />
                            <Star size={12} className="text-slate-yellow fill-slate-yellow" />
                            <Star size={12} className="text-slate-yellow fill-slate-yellow" />
                            <Star size={12} className="text-slate-yellow fill-slate-yellow" />
                            <Star size={12} className="text-slate-yellow fill-slate-yellow" />
                            <span className="text-[9px] text-slate-500 font-bold ml-1">Paid Quote</span>
                          </div>
                          <span className="text-xs font-black text-slate-yellow font-mono">TSh {(req.totalCost * 100).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}

                  {providerSimulatedHistory.filter(log => log.status !== 'transferred').map(log => {
                    const service = SERVICES.find(s => s.id === log.serviceId);
                    const isTransferred = log.status === 'transferred';
                    return (
                      <div 
                        key={log.id} 
                        className={cn(
                          "glass-card p-4 space-y-3 hover:border-slate-yellow/20 transition-all animate-fadeIn",
                          isTransferred && "border-l-4 border-l-red-500 bg-red-950/10 border-red-500/20"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg text-white", isTransferred ? "bg-red-500/20 text-red-400" : service?.color)}>
                              {service && <service.icon size={16} />}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-100 text-sm leading-none mb-1">{service?.title}</h4>
                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{log.date}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "border px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                            isTransferred 
                              ? "bg-red-500/10 text-red-400 border-red-500/30" 
                              : "bg-charcoal-light border-border-theme text-slate-400"
                          )}>
                            {isTransferred ? "Transferred Call" : "App Booking"}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/5 space-y-1 text-xs text-slate-400">
                          <p className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-500 text-slate-yellow" /> {log.location}</p>
                          <p className="flex items-center gap-1.5"><Smile size={12} className="text-slate-500" /> Customer: {log.clientName}</p>
                          {log.review && (
                            <p className={cn(
                              "text-[10px] italic px-2.5 py-1.5 rounded-lg border mt-1",
                              isTransferred 
                                ? "text-red-300 bg-red-950/20 border-red-500/20" 
                                : "text-slate-500 bg-white/5 border-white/5"
                            )}>
                              "{log.review}"
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            {isTransferred ? (
                              <span className="text-[8.5px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                                <AlertTriangle size={10} className="animate-pulse" /> Timed Out: Transferred to Nearby Provider
                              </span>
                            ) : (
                              <>
                                {Array.from({ length: log.rating }).map((_, i) => (
                                  <Star key={i} size={11} className="text-slate-yellow fill-slate-yellow" />
                                ))}
                                <span className="text-[8px] font-bold text-slate-500 ml-1 uppercase">Satisfied</span>
                              </>
                            )}
                          </div>
                          {!isTransferred && (
                            <span className="text-xs font-black text-slate-yellow font-mono">TSh {log.payout.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="provider-profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 animate-fadeIn"
              >
                {isEditingProvider ? (
                  <div className="glass-card p-6 space-y-4 animate-fadeIn border-l-2 border-l-slate-yellow">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h3 className="text-xs font-black text-slate-yellow uppercase tracking-widest">Edit Provider Account</h3>
                      <button 
                        onClick={() => setIsEditingProvider(false)} 
                        className="text-slate-500 hover:text-slate-300 font-bold text-xs uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                    
                    {/* Photo selector upload zone */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Provider Photo</label>
                      <AvatarUploadZone 
                        id="provider-edit-avatar-drop"
                        currentAvatar={editProviderAvatar} 
                        onAvatarChanged={(b64) => setEditProviderAvatar(b64)} 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Full Name</label>
                        <input 
                          type="text" 
                          value={editProviderName} 
                          onChange={e => setEditProviderName(e.target.value)}
                          className="w-full bg-charcoal border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50 font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Phone Number</label>
                        <input 
                          type="text" 
                          value={editProviderPhone} 
                          onChange={e => setEditProviderPhone(e.target.value)}
                          className="w-full bg-charcoal border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Email Address</label>
                        <input 
                          type="email" 
                          value={editProviderEmail} 
                          onChange={e => setEditProviderEmail(e.target.value)}
                          className="w-full bg-charcoal border border-white/10 rounded-xl p-3 text-[11px] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50 font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Operational Region</label>
                        <select
                          value={editProviderRegion}
                          onChange={e => setEditProviderRegion(e.target.value)}
                          className="w-full bg-charcoal border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-slate-yellow/50 font-bold"
                        >
                          <option value="Dar es Salaam">Dar es Salaam</option>
                          <option value="Dodoma">Dodoma</option>
                          <option value="Arusha">Arusha</option>
                          <option value="Mwanza">Mwanza</option>
                          <option value="Morogoro">Morogoro</option>
                          <option value="Zanzibar">Zanzibar</option>
                        </select>
                      </div>
                    </div>

                    {/* Operational vehicle specifications */}
                    <div className="bg-charcoal-light/30 border border-white/5 rounded-2xl p-4 space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-yellow tracking-widest flex items-center gap-1">
                        <Truck size={12} /> Service Vehicle Specifications
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-500 uppercase">Make</label>
                          <input 
                            type="text" 
                            value={editProviderVehicleMake} 
                            onChange={e => setEditProviderVehicleMake(e.target.value)}
                            placeholder="e.g. Toyota"
                            className="w-full bg-charcoal border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-500 uppercase">Model</label>
                          <input 
                            type="text" 
                            value={editProviderVehicleModel} 
                            onChange={e => setEditProviderVehicleModel(e.target.value)}
                            placeholder="e.g. Hilux Tow Truck"
                            className="w-full bg-charcoal border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-500 uppercase">License Plate</label>
                          <input 
                            type="text" 
                            value={editProviderVehiclePlate} 
                            onChange={e => setEditProviderVehiclePlate(e.target.value)}
                            placeholder="e.g. T 123 ABC"
                            className="w-full bg-charcoal border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none font-mono font-bold uppercase"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-500 uppercase">Vehicle Color</label>
                          <input 
                            type="text" 
                            value={editProviderVehicleColor} 
                            onChange={e => setEditProviderVehicleColor(e.target.value)}
                            placeholder="e.g. Yellow"
                            className="w-full bg-charcoal border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Services provided */}
                    <div className="bg-charcoal-light/30 border border-white/5 rounded-2xl p-4 space-y-2.5">
                      <span className="text-[10px] font-black uppercase text-slate-yellow tracking-widest flex items-center gap-1">
                        <Wrench size={12} /> Approved Rescue Services
                      </span>
                      <p className="text-[9px] text-slate-500 font-bold uppercase leading-none">Select all mobile assistance modules you can dispatch for:</p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {SERVICES.filter(s => s.id !== 'custom').map(service => {
                          const isChecked = editProviderServices.includes(service.id);
                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => {
                                if (isChecked) {
                                  setEditProviderServices(prev => prev.filter(id => id !== service.id));
                                } else {
                                  setEditProviderServices(prev => [...prev, service.id]);
                                }
                              }}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all",
                                isChecked 
                                  ? "bg-slate-yellow/10 border-slate-yellow text-slate-yellow" 
                                  : "bg-charcoal border-white/5 text-slate-400 hover:text-slate-300"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                                isChecked ? "border-slate-yellow bg-slate-yellow text-charcoal" : "border-white/10 bg-black/20"
                              )}>
                                {isChecked && <Check size={10} strokeWidth={4} />}
                              </div>
                              <span className="truncate">{service.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Online/Offline status switch */}
                    <div className="bg-charcoal-light/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-100 uppercase tracking-wider">Online/Offline Mode</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-none">Control if you receive automated dispatches</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextOnline = !providerAccount.isOnline;
                          setProviderAccount(prev => ({ ...prev, isOnline: nextOnline }));
                          if (nextOnline) {
                            notify.success("Ready for rescue! Online.", 'provider');
                          } else {
                            notify.warning("Dispatch paused. Offline.", 'provider');
                          }
                        }}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-colors flex items-center shadow-inner",
                          providerAccount.isOnline ? "bg-emerald-500 justify-end" : "bg-white/10 justify-start"
                        )}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        setProviderAccount(prev => ({
                          ...prev,
                          name: editProviderName,
                          phone: editProviderPhone,
                          email: editProviderEmail,
                          avatar: editProviderAvatar,
                          vehicleMake: editProviderVehicleMake,
                          vehicleModel: editProviderVehicleModel,
                          vehiclePlate: editProviderVehiclePlate,
                          vehicleColor: editProviderVehicleColor,
                          services: editProviderServices,
                          region: editProviderRegion
                        }));
                        setIsEditingProvider(false);
                        notify.success('Provider profile has been successfully updated!', 'provider');
                      }}
                      className="w-full bg-slate-yellow text-charcoal font-black py-3 rounded-xl text-xs hover:bg-slate-yellow/90 transition-all uppercase tracking-widest mt-2"
                    >
                      Save Amendments
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Profile Card Header */}
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="relative">
                        <img 
                          src={providerAccount.avatar} 
                          alt={providerAccount.name} 
                          className="w-24 h-24 rounded-full border-2 border-slate-yellow shadow-xl shadow-slate-yellow/20 object-cover bg-charcoal-light" 
                        />
                        <div className="absolute bottom-0 right-0 bg-slate-yellow text-charcoal p-1.5 rounded-full border-2 border-charcoal">
                          <Zap size={14} className="fill-charcoal" />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <h2 className="text-2xl font-black text-slate-100 italic tracking-tight">{providerAccount.name}</h2>
                          <Award size={16} className="text-slate-yellow" />
                        </div>
                        <span className="inline-block bg-slate-yellow/15 border border-slate-yellow/30 text-slate-yellow text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-1">
                          {providerStats.rank}
                        </span>
                        
                        <div className="flex gap-2 justify-center mt-3">
                          <button
                            onClick={() => {
                              setEditProviderName(providerAccount.name);
                              setEditProviderPhone(providerAccount.phone || '');
                              setEditProviderEmail(providerAccount.email || '');
                              setEditProviderAvatar(providerAccount.avatar || '');
                              setEditProviderVehicleMake(providerAccount.vehicleMake || 'Toyota');
                              setEditProviderVehicleModel(providerAccount.vehicleModel || 'Hilux Heavy Tow');
                              setEditProviderVehiclePlate(providerAccount.vehiclePlate || 'T 123 ABC');
                              setEditProviderVehicleColor(providerAccount.vehicleColor || 'Yellow');
                              setEditProviderServices(providerAccount.services || []);
                              setEditProviderRegion(providerAccount.region || 'Dar es Salaam');
                              setIsEditingProvider(true);
                            }}
                            className="bg-charcoal-light hover:bg-charcoal border border-border-theme hover:border-slate-yellow/40 text-[9px] font-black uppercase text-slate-300 px-4 py-2 rounded-full tracking-widest hover:text-slate-yellow transition-all flex items-center justify-center gap-1.5 select-none"
                          >
                            ✏️ Edit Profile
                          </button>

                          {/* Quick inline online toggle */}
                          <button
                            onClick={() => {
                              const nextOnline = !providerAccount.isOnline;
                              setProviderAccount(prev => ({ ...prev, isOnline: nextOnline }));
                              if (nextOnline) {
                                notify.success("You are now ONLINE.", 'provider');
                              } else {
                                notify.warning("You are now OFFLINE.", 'provider');
                              }
                            }}
                            className={cn(
                              "border text-[9px] font-black uppercase px-4 py-2 rounded-full tracking-widest transition-all select-none",
                              providerAccount.isOnline 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" 
                                : "bg-amber-400/10 text-amber-400 border-amber-400/30 hover:bg-amber-400/20"
                            )}
                          >
                            {providerAccount.isOnline ? "🟢 Online" : "🔴 Offline"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Score Indicators Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="glass-card p-3 flex flex-col items-center text-center">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none">Accept Rate</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">{providerStats.successRate}</span>
                      </div>
                      <div className="glass-card p-3 flex flex-col items-center text-center">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none">Speed</span>
                        <span className="text-sm font-black text-slate-100 font-mono">{providerStats.speed}</span>
                      </div>
                      <div className="glass-card p-3 flex flex-col items-center text-center">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none">Completed</span>
                        <span className="text-sm font-black text-slate-yellow font-mono">{providerStats.jobsCompleted}</span>
                      </div>
                    </div>

                    {/* Vehicle, Region & services specifications card */}
                    <div className="glass-card p-4 space-y-4 border-l-2 border-l-slate-yellow">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-[10px] font-black uppercase text-slate-yellow tracking-widest flex items-center gap-1">
                          <Truck size={12} /> Active Vehicle & Operation Parameters
                        </span>
                        <span className="bg-slate-yellow/15 border border-slate-yellow/30 text-slate-yellow text-[8px] font-black uppercase px-2 py-0.5 rounded">
                          {providerAccount.region}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-slate-500 uppercase">Service Vehicle</p>
                          <p className="font-extrabold text-slate-100">{providerAccount.vehicleMake} {providerAccount.vehicleModel}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-slate-500 uppercase">License plate & color</p>
                          <p className="font-mono font-bold text-slate-100 uppercase">{providerAccount.vehiclePlate} ({providerAccount.vehicleColor})</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Authorized Assistance Services</p>
                        <div className="flex flex-wrap gap-1.5">
                          {providerAccount.services.map(srvId => {
                            const serviceObj = SERVICES.find(s => s.id === srvId);
                            if (!serviceObj) return null;
                            return (
                              <span 
                                key={srvId} 
                                className="flex items-center gap-1 text-[9px] font-black uppercase bg-charcoal border border-white/5 px-2.5 py-1 rounded-lg text-slate-300"
                              >
                                <serviceObj.icon size={10} className="text-slate-yellow" />
                                {serviceObj.title}
                              </span>
                            );
                          })}
                          {providerAccount.services.length === 0 && (
                            <span className="text-[9px] font-bold text-slate-500 uppercase italic">No active services registered</span>
                          )}
                        </div>
                      </div>
                    </div>

                {/* Licensing and Official Credentials */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Official Credentials</h3>
                  <div className="glass-card p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-slate-yellow" />
                        <span className="font-bold text-slate-300">Viyeko Certified Contractor</span>
                      </div>
                      <span className="text-emerald-400 font-black text-[9px] uppercase tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded">Active</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-slate-yellow" />
                        <span className="font-bold text-slate-300">Dar Regional License No</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px] font-bold">#VY-04-A829</span>
                    </div>
                  </div>
                </div>

                {/* Badges & Specializations */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Specialty Badges</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="glass-card p-3 flex items-center gap-2.5 border-l-2 border-l-slate-yellow">
                      <div className="bg-slate-yellow/10 p-2 rounded-lg text-slate-yellow shrink-0">
                        <Car size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-wide leading-none mb-0.5">Tire Master</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase col-span-2">50+ Tire Changes</p>
                      </div>
                    </div>
                    <div className="glass-card p-3 flex items-center gap-2.5 border-l-2 border-l-amber-500">
                      <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500 shrink-0">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-wide leading-none mb-0.5">Rapid Responder</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase col-span-2">ETA Under 10m Avg</p>
                      </div>
                    </div>
                    <div className="glass-card p-3 flex items-center gap-2.5 border-l-2 border-l-emerald-500">
                      <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 shrink-0">
                        <Wrench size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-wide leading-none mb-0.5">Heavy Tower</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase col-span-2">Large Truck Capable</p>
                      </div>
                    </div>
                    <div className="glass-card p-3 flex items-center gap-2.5 border-l-2 border-l-sky-500">
                      <div className="bg-sky-500/10 p-2 rounded-lg text-sky-500 shrink-0">
                        <Award size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-wide leading-none mb-0.5">Elite Saver</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase col-span-2">100+ Completed Jobs</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback log (Ratings Review log) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Customer Reviews ({providerFeedback.length})</h3>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/5 py-0.5 px-2.5 rounded-full text-[9px] font-mono font-bold text-slate-300">
                      ★ {providerStats.rating} Average
                    </div>
                  </div>
                  <div className="space-y-3">
                    {providerFeedback.map(f => (
                      <div key={f.id} className="glass-card p-4 space-y-2.5 animate-fadeIn">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <img src={f.avatar} alt={f.customer} className="w-8 h-8 rounded-full border border-border-theme object-cover" />
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-200 leading-none">{f.customer}</h4>
                              <span className="text-[8px] text-slate-500 font-bold uppercase mt-0.5 inline-block">{f.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: f.rating }).map((_, i) => (
                              <Star key={i} size={11} className="text-slate-yellow fill-slate-yellow" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic bg-white/5 p-2 rounded-lg border border-white/5">
                          "{f.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clean Slate Action */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">System Reset</h3>
                  <div className="glass-card p-4 space-y-3 border-l-2 border-l-rose-500">
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Wipe all provider activity logs, earnings, custom pricing, reviews, and start with a clean responder slate.
                    </p>
                    {showProviderResetConfirm ? (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl space-y-2 animate-fadeIn mt-1">
                        <p className="text-[10px] text-rose-400 font-black uppercase tracking-wider">Are you absolutely sure? All provider ratings, history, and earnings will be wiped permanently.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              triggerProviderCleanSlate();
                              setShowProviderResetConfirm(false);
                            }}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-black text-[9px] uppercase px-3 py-1.5 rounded-lg transition-all"
                          >
                            Yes, Wipe Provider Data
                          </button>
                          <button
                            onClick={() => setShowProviderResetConfirm(false)}
                            className="text-slate-400 hover:text-slate-200 font-bold text-[9px] uppercase px-2 py-1.5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowProviderResetConfirm(true)}
                        className="w-full flex items-center justify-between hover:bg-white/5 p-2 rounded-xl transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Trash2 size={16} className="text-rose-500 animate-pulse" />
                          <span className="text-sm font-bold text-rose-400">Reset Provider to Clean Slate</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
            )
          ) : activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <WeatherWidget selectedLocation={location.address} />
              <CareNotificationBanner vehicles={vehicles} />

              {(!localStorage.getItem('viyeko_first_time_setup_done') || (vehicles.length === 2 && vehicles[0].id === '1' && vehicles[1].id === '2')) && (
                <div className="glass-card p-5 border border-slate-yellow/20 bg-slate-yellow/5 relative overflow-hidden rounded-[2rem] animate-fadeIn">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-yellow/5 rounded-full -mr-6 -mt-6 blur-2xl" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-slate-yellow" size={18} />
                      <h4 className="text-xs font-black text-slate-yellow uppercase tracking-widest">First-Time Setup / Clean Slate</h4>
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Do you want to use the app for the first time with a clean slate? We will clear all default demo data so you can configure your own personal profile and vehicles.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          triggerFirstTimeSetup();
                          localStorage.setItem('viyeko_first_time_setup_done', 'true');
                        }}
                        className="bg-slate-yellow text-charcoal font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-wider hover:bg-slate-yellow/90 active:scale-95 transition-all shadow-md"
                      >
                        Yes, Start Clean Slate
                      </button>
                      <button
                        onClick={() => {
                          localStorage.setItem('viyeko_first_time_setup_done', 'true');
                          // Simple dummy state change to trigger re-render
                          setShowAddVehicle(prev => !prev);
                          setTimeout(() => setShowAddVehicle(prev => !prev), 10);
                        }}
                        className="bg-white/5 border border-white/10 text-slate-400 font-bold text-[10px] px-3 py-2 rounded-xl uppercase tracking-wider hover:bg-white/10 transition-all"
                      >
                        Keep Demo Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeRequest && !isTrackingMinimized ? (
                <LiveTracking 
                  request={activeRequest} 
                  onCancel={() => handleCancelRequest(activeRequest.id)}
                  onNextStep={() => advanceStatus(activeRequest.id)}
                  onMinimize={() => setIsTrackingMinimized(true)}
                />
              ) : (
                <>
                  {activeRequest && isTrackingMinimized && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setIsTrackingMinimized(false)}
                      className="w-full bg-slate-yellow text-charcoal p-4 rounded-[2rem] flex items-center justify-between font-bold text-xs uppercase tracking-wider shadow-lg shadow-slate-yellow/20 hover:brightness-110 active:scale-95 transition-all border border-slate-yellow/50"
                      id="maximize-tracking-banner"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-charcoal animate-ping shrink-0" />
                        <span className="font-extrabold text-left leading-none tracking-tight">
                          Active Job: <span className="underline text-charcoal">{activeRequest.status.toUpperCase()}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-charcoal/10 px-2.5 py-1 rounded-xl">
                        <span className="font-black text-[9px] tracking-widest">Track</span>
                        <ChevronRight size={12} />
                      </div>
                    </motion.button>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-100 italic tracking-tight">HOW CAN WE HELP?</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Select a service to get started</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {SERVICES.filter(s => !s.isAddOn).map((service) => (
                        <motion.button
                          key={service.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedService(service)}
                          className="glass-card p-4 flex flex-col items-start gap-2 text-left transition-all hover:border-slate-yellow group relative overflow-hidden"
                        >
                          <div className={cn("p-2 rounded-xl text-white shadow-sm group-hover:scale-110 transition-transform", service.color)}>
                            <service.icon size={20} />
                          </div>
                          <div className="w-full">
                            <div className="flex justify-between items-start w-full">
                              <h3 className="font-bold text-slate-100 text-sm leading-tight">{service.title}</h3>
                              <span className="text-[10px] font-black text-slate-yellow">TSh {(service.price * 100).toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{service.subtitle}</p>
                            <div className="flex items-center gap-1 mt-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                              <Loader2 size={10} className="animate-spin text-slate-yellow" />
                              {service.eta}
                            </div>
                          </div>
                        </motion.button>
                    ))}
                  </div>

                  {/* My Vehicles Quick Select */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">My Vehicles</h3>
                      <button onClick={() => setActiveTab('profile')} className="text-[10px] font-bold text-slate-yellow uppercase tracking-widest hover:underline">Manage</button>
                    </div>
                    {vehicles.length === 0 ? (
                      <div className="glass-card p-4 text-center border-dashed border-white/5">
                        <p className="text-xs text-slate-500 font-medium mb-2">No registered vehicles found.</p>
                        <button 
                          type="button"
                          onClick={() => {
                            setActiveTab('profile');
                            setShowAddVehicle(true);
                          }} 
                          className="text-[9px] font-black uppercase text-slate-yellow tracking-widest bg-slate-yellow/10 px-3 py-1.5 rounded-xl hover:bg-slate-yellow/20 transition-all"
                        >
                          + Add Your Vehicle
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {vehicles.map(v => (
                          <button 
                            key={v.id}
                            onClick={() => {
                              setVehicleInfo(`${v.color} ${v.make} ${v.model} (${v.plate})`);
                              notify.success(`Selected ${v.make} ${v.model}`, 'user');
                            }}
                            className="glass-card p-3 flex flex-col gap-1 min-w-[140px] shrink-0 border-white/5 hover:border-slate-yellow/50 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <Car size={14} className="text-slate-yellow" />
                              <span className="text-[8px] font-black bg-slate-yellow/10 text-slate-yellow px-1.5 py-0.5 rounded uppercase">{v.plate.split('-')[0]}</span>
                            </div>
                            <span className="text-xs font-black text-slate-100">{v.make} {v.model}</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{v.color} • {v.plate}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-viyeko-red/10 border border-viyeko-red/20 rounded-3xl p-5 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-viyeko-red/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="bg-viyeko-red p-3 rounded-2xl text-white shadow-lg shadow-viyeko-red/20">
                        <Phone size={24} />
                      </div>
                      <div>
                        <p className="text-slate-100 font-black text-sm italic tracking-tight">VIYEKO SUPPORT HOTLINE</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Available 24/7 in Tanzania</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowEmergencyModal(true)}
                      className="bg-viyeko-red text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-viyeko-red-dark transition-all shadow-lg shadow-viyeko-red/20 active:scale-95 relative z-10 cursor-pointer"
                    >
                      CONTACT
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : (activeTab === 'care' && !isProviderMode) ? (
            <motion.div
              key="care"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Care Unit Header */}
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-100 italic tracking-tight uppercase flex items-center gap-2">
                  <Sparkles className="text-slate-yellow animate-pulse" size={24} />
                  VIYEKO CARE UNIT
                </h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                  Premium Detailing, Custom Modifications, and 24/7 Personnel Support
                </p>
              </div>

              {/* Direct Personnel Support Query Card */}
              <div className="glass-card p-5 border-l-4 border-l-slate-yellow space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight">Direct Support & Personnel Query</h3>
                    <p className="text-xs text-slate-400">Ask support for service reminders, vehicle mods, or arrangements.</p>
                  </div>
                  <div className="bg-slate-yellow/10 p-2 rounded-xl text-slate-yellow">
                    <Phone size={18} />
                  </div>
                </div>

                {/* Simulated Support Chat Box */}
                <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-4 space-y-3 max-h-48 overflow-y-auto scrollbar-hide font-sans text-xs">
                  {chatHistory.map((chat, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-2.5 rounded-2xl max-w-[85%] leading-relaxed",
                        chat.sender === 'user' 
                          ? "bg-slate-yellow/10 text-slate-200 border border-slate-yellow/20 ml-auto" 
                          : "bg-charcoal-light/60 text-slate-400 border border-white/5"
                      )}
                    >
                      <p className="font-extrabold text-[9px] uppercase tracking-wider mb-0.5 text-slate-400 font-sans">
                        {chat.sender === 'user' ? 'Godson Rubenga' : 'VIYEKO Care Desk'}
                      </p>
                      <p className="font-medium font-sans">{chat.text}</p>
                    </div>
                  ))}
                </div>

                {/* Support Input bar */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Type your quarry / modification details..."
                    value={supportQuery}
                    onChange={(e) => setSupportQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendSupportQuery();
                      }
                    }}
                    className="input-viyeko w-full text-xs"
                  />
                  <button 
                    type="button"
                    onClick={handleSendSupportQuery}
                    className="bg-slate-yellow text-charcoal px-4 py-2 rounded-xl font-bold text-xs hover:brightness-110 transition-all font-sans uppercase tracking-wider"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Reminders & Premium Valet Pickup Services */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Viyeko Reminders & Custom Modifications</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reminder Card 1 */}
                  <div className="glass-card p-4 border border-white/5 space-y-3 relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-slate-yellow/20 text-slate-yellow text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Reminder</div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Maruti Swift (CH01-XX-0000)</span>
                      <h4 className="text-xs font-black text-slate-200 uppercase">Engine Service & Oil Change Due</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">Last scheduled service was 6 months ago. Our valet is ready to handle transit.</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button 
                        type="button"
                        onClick={() => {
                          setCareServiceType('servicing');
                          setCareNotes('Scheduled engine service based on vehicle reminder');
                          notify.success('Pre-filled Service Details: Oil & Engine Service!', 'user');
                        }}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                      >
                        Pre-fill Booking
                      </button>
                      <a href="tel:+255712345678" className="text-slate-yellow text-[9px] font-black uppercase tracking-wider hover:underline flex items-center gap-1">
                        <Phone size={10} /> Call Personnel
                      </a>
                    </div>
                  </div>

                  {/* Custom Modifications Section Card */}
                  <div className="glass-card p-4 border border-white/5 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9px] text-emerald-400 font-extrabold uppercase font-sans">Custom Styling Shop</span>
                      <h4 className="text-xs font-black text-slate-200 uppercase">Aesthetic Modification</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">Specify body-kits, custom tints, wrap configurations, or sound upgrades.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setCareServiceType('modifications');
                        setCareNotes('Interested in: Alloy Wheel Paints, Tinting, Wrapper installations.');
                        notify.success('Pre-filled Custom modifications. Specify details below.', 'user');
                      }}
                      className="bg-slate-yellow/10 hover:bg-slate-yellow/20 border border-slate-yellow/20 text-slate-yellow px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                    >
                      Pre-fill Modifications Request
                    </button>
                  </div>
                </div>
              </div>

              {/* Accident Recovery Option */}
              <div className="bg-viyeko-red/10 border border-viyeko-red/25 rounded-3xl p-5 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-viyeko-red/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-3">
                  <div className="bg-viyeko-red p-2.5 rounded-2xl text-white shadow-lg shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight italic">Accident Recovery Assistance</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rapid emergency flatbed dispatch for heavy accident recovery</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  In case of high impact or serious breakdowns, select this to dispatch a special high-powered valet transport flatbed trailer directly to your exact coordinates.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCareServiceType('recovery');
                    setCareNotes('EMERGENCY: Accident recovery flatbed truck required immediately.');
                    notify.success('Emergency Recovery Service selected! Fill details below.', 'user');
                  }}
                  className="bg-viyeko-red text-white py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-viyeko-red-dark transition-all shadow-lg shadow-viyeko-red/20 uppercase tracking-wider"
                >
                  Activate Emergency Recovery Dispatcher
                </button>
              </div>

              {/* Master Booking Form - Detailed deep clean, mods, valet options */}
              <div className="glass-card p-5 border border-white/5 space-y-4">
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest border-b border-white/5 pb-2">
                  VIYEKO CARE & DETAILING SCHEDULER
                </h3>

                <div className="space-y-4">
                  {/* Service type Selection */}
                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold font-sans">Core Booking Goal</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCareServiceType('detailing')}
                        className={cn(
                          "p-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all tracking-wider text-center",
                          careServiceType === 'detailing' 
                            ? "bg-slate-yellow text-charcoal font-black border-slate-yellow shadow-md" 
                            : "bg-charcoal border-white/5 text-slate-400 font-bold"
                        )}
                      >
                        Detailing & Clean
                      </button>
                      <button
                        type="button"
                        onClick={() => setCareServiceType('servicing')}
                        className={cn(
                          "p-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all tracking-wider text-center",
                          careServiceType === 'servicing' 
                            ? "bg-slate-yellow text-charcoal font-black border-slate-yellow shadow-md" 
                            : "bg-charcoal border-white/5 text-slate-400 font-bold"
                        )}
                      >
                        Vehicle Servicing
                      </button>
                      <button
                        type="button"
                        onClick={() => setCareServiceType('modifications')}
                        className={cn(
                          "p-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all tracking-wider text-center",
                          careServiceType === 'modifications' 
                            ? "bg-slate-yellow text-charcoal font-black border-slate-yellow shadow-md" 
                            : "bg-charcoal border-white/5 text-slate-400 font-bold"
                        )}
                      >
                        Vehicle Mod Shop
                      </button>
                      <button
                        type="button"
                        onClick={() => setCareServiceType('recovery')}
                        className={cn(
                          "p-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all tracking-wider text-center",
                          careServiceType === 'recovery' 
                            ? "bg-slate-yellow text-charcoal font-black border-slate-yellow shadow-md" 
                            : "bg-charcoal border-white/5 text-slate-400 font-bold"
                        )}
                      >
                        Crash Recovery
                      </button>
                    </div>
                  </div>

                  {/* Home vs Garage selection */}
                  {careServiceType === 'detailing' && (
                    <div className="space-y-1.5 animate-fadeIn font-sans">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold font-sans">Venue (Detailed & clean location)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCareVenue('home')}
                          className={cn(
                            "p-2.5 rounded-xl border text-xs font-bold uppercase transition-all tracking-wider text-center",
                            careVenue === 'home' 
                              ? "bg-white/10 border-white/30 text-white font-black" 
                              : "bg-charcoal border-white/5 text-slate-400"
                          )}
                        >
                          🏠 Detailed at Home
                        </button>
                        <button
                          type="button"
                          onClick={() => setCareVenue('garage')}
                          className={cn(
                            "p-2.5 rounded-xl border text-xs font-bold uppercase transition-all tracking-wider text-center",
                            careVenue === 'garage' 
                              ? "bg-white/10 border-white/30 text-white font-black" 
                              : "bg-charcoal border-white/5 text-slate-400 font-bold"
                          )}
                        >
                          🏢 At Garage
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Handling Mode Selection (DIY vs Valet Pick-up) */}
                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold font-sans">Vehicle Handling Protocol</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setValetOption('diy')}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex flex-col gap-1",
                          valetOption === 'diy' 
                            ? "bg-slate-yellow/10 border-slate-yellow text-slate-yellow font-bold uppercase" 
                            : "bg-charcoal/40 border-white/5 text-slate-400 hover:border-white/10"
                        )}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] font-black uppercase">DIY: Drive Myself</span>
                        </div>
                        <span className="text-[8px] opacity-75 font-sans">I will drive & attend coordination myself</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setValetOption('valet')}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex flex-col gap-1",
                          valetOption === 'valet' 
                            ? "bg-slate-yellow/10 border-slate-yellow text-slate-yellow font-bold uppercase" 
                            : "bg-charcoal/40 border-white/5 text-slate-400 hover:border-white/10"
                        )}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] font-black uppercase">Send Viyeko Valet</span>
                        </div>
                        <span className="text-[8px] opacity-75 font-sans">Viyeko valet representative picks up target</span>
                      </button>
                    </div>
                  </div>

                  {/* Vehicle Quick Select */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Choose Target Vehicle</label>
                    {vehicles.length === 0 ? (
                      <div className="p-3 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-400 font-semibold mb-1">No vehicles registered yet.</p>
                        <button 
                          type="button" 
                          onClick={() => {
                            setActiveTab('profile');
                            setShowAddVehicle(true);
                          }}
                          className="text-[9px] font-black uppercase text-slate-yellow tracking-wider hover:underline"
                        >
                          + Go register a vehicle
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedCareVehicle}
                        onChange={(e) => setSelectedCareVehicle(e.target.value)}
                        className="input-viyeko w-full text-xs font-bold"
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id} className="bg-charcoal text-slate-100">
                            {v.make} {v.model} - {v.plate} ({v.color})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Date and Time selectors */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Preferred Date</label>
                      <input 
                        type="date"
                        value={careDate}
                        onChange={(e) => setCareDate(e.target.value)}
                        className="input-viyeko w-full text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Preferred Time</label>
                      <input 
                        type="time"
                        value={careTime}
                        onChange={(e) => setCareTime(e.target.value)}
                        className="input-viyeko w-full text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Care Notes */}
                  <div className="space-y-1 animate-fadeIn">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Instructions & Specifications</label>
                    <textarea
                      placeholder="e.g. detailing clean, body modification wrap colors, specific engine sounds to fix..."
                      value={careNotes}
                      onChange={(e) => setCareNotes(e.target.value)}
                      className="input-viyeko w-full h-16 text-xs resize-none"
                    />
                  </div>

                  {/* Booking Submission */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleBookCareService}
                      className="btn-viyeko-primary w-full text-xs uppercase tracking-widest font-black py-3"
                    >
                      <Sparkles size={16} />
                      Confirm Care Booking
                    </button>
                    <p className="text-[9px] text-slate-500 uppercase text-center font-bold mt-2 font-sans">
                      VIYEKO representative will coordinate detailing logistics immediately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-100 italic tracking-tight">MY REQUESTS</h2>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{requests.length} Total</span>
              </div>

              {requests.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="bg-charcoal-light w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <History size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">No requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => {
                    const service = SERVICES.find(s => s.id === req.serviceId);
                    return (
                      <div key={req.id} className="glass-card p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg text-white", service?.color)}>
                              {service && <service.icon size={18} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-100 text-sm">{service?.title}</h4>
                              <p className="text-[10px] text-slate-500">{format(req.timestamp, 'MMM d, h:mm a')}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                            req.status === 'transferred' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            req.status !== 'completed' ? "bg-slate-yellow/10 text-slate-yellow" : "bg-emerald-900/30 text-emerald-400"
                          )}>
                            {req.status}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin size={14} className="text-slate-500" />
                            <span className="truncate">{req.location.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Navigation size={14} className="text-slate-500" />
                            <span>Vehicle: {req.vehicleInfo}</span>
                          </div>
                          {req.addOnIds && req.addOnIds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {req.addOnIds.map(id => (
                                <span key={id} className="bg-white/5 text-[9px] px-2 py-0.5 rounded-full text-slate-500">
                                  +{SERVICES.find(s => s.id === id)?.title}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Paid</span>
                            <span className="text-sm font-black text-slate-yellow">TSh {(req.totalCost * 100).toLocaleString()}</span>
                          </div>
                          {req.status !== 'completed' && req.status !== 'transferred' && req.estimatedArrival !== undefined && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-yellow bg-slate-yellow/10 p-2 rounded-lg">
                              <Loader2 size={14} className="animate-spin" />
                              <span>Estimated Arrival: {req.estimatedArrival} mins</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {isEditingUser ? (
                <div className="glass-card p-6 space-y-4 animate-fadeIn border-l-2 border-l-slate-yellow">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-xs font-black text-slate-yellow uppercase tracking-widest">Edit Account Profile</h3>
                    <button 
                      onClick={() => setIsEditingUser(false)} 
                      className="text-slate-500 hover:text-slate-300 font-bold text-xs uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {/* Photo selector upload zone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Profile Photo</label>
                    <AvatarUploadZone 
                      id="user-edit-avatar-drop"
                      currentAvatar={editUserAvatar} 
                      onAvatarChanged={(b64) => setEditUserAvatar(b64)} 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Full Name</label>
                    <input 
                      type="text" 
                      value={editUserName} 
                      onChange={e => setEditUserName(e.target.value)}
                      className="w-full bg-charcoal border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Phone Number</label>
                    <input 
                      type="text" 
                      value={editUserPhone} 
                      onChange={e => setEditUserPhone(e.target.value)}
                      className="w-full bg-charcoal border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Email Address</label>
                    <input 
                      type="email" 
                      value={editUserEmail} 
                      onChange={e => setEditUserEmail(e.target.value)}
                      className="w-full bg-charcoal border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50 font-bold"
                    />
                  </div>

                  <button 
                    onClick={async () => {
                      const updatedUser = {
                        name: editUserName,
                        phone: editUserPhone,
                        email: editUserEmail,
                        avatar: editUserAvatar
                      };
                      setUser(updatedUser);
                      setIsEditingUser(false);
                      
                      if (currentUser) {
                        try {
                          await setDoc(doc(db, 'users', currentUser.uid), {
                            ...updatedUser,
                            uid: currentUser.uid,
                            role: 'user',
                            updatedAt: Date.now()
                          }).catch(err => {
                            handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
                            throw err;
                          });
                          notify.success('Your profile was successfully updated on the cloud!', 'user');
                        } catch (error: any) {
                          if (isOfflineError(error)) {
                            console.warn('Firestore offline while updating profile.');
                          } else {
                            console.error("Firestore profile update failed:", error);
                          }
                          notify.error('Could not save updated profile to the cloud.', 'user');
                        }
                      } else {
                        localStorage.setItem('viyeko_user_profile', JSON.stringify(updatedUser));
                        notify.success('Your profile was successfully updated!', 'user');
                      }
                    }}
                    className="w-full bg-slate-yellow text-charcoal font-black py-3 rounded-xl text-xs hover:bg-slate-yellow/90 transition-all uppercase tracking-widest mt-2"
                  >
                    Save Amendments
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="relative">
                      <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-2 border-slate-yellow shadow-xl shadow-slate-yellow/20 object-cover" />
                      <div className="absolute bottom-0 right-0 bg-slate-yellow text-charcoal p-1.5 rounded-full border-2 border-charcoal">
                        <Zap size={14} />
                      </div>
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-slate-100 italic tracking-tight">{user.name}</h2>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Premium Member since 2024</p>
                      <button
                        onClick={() => {
                          setEditUserName(user.name);
                          setEditUserPhone(user.phone || '');
                          setEditUserEmail(user.email || '');
                          setEditUserAvatar(user.avatar || '');
                          setIsEditingUser(true);
                        }}
                        className="mt-3 bg-charcoal-light hover:bg-charcoal border border-border-theme hover:border-slate-yellow/40 text-[9px] font-black uppercase text-slate-300 px-4 py-2 rounded-full tracking-widest hover:text-slate-yellow transition-all flex items-center justify-center gap-1.5 mx-auto animate-pulse"
                      >
                        ✏️ Edit Profile Info
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Account Information</h3>
                      <div className="glass-card p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Phone size={16} className="text-slate-500" />
                        <span className="text-sm font-bold text-slate-300">{user.phone}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity size={16} className="text-slate-500" />
                        <span className="text-sm font-bold text-slate-300">{user.email}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">My Vehicles</h3>
                    <button 
                      onClick={() => setShowAddVehicle(true)}
                      className="text-[10px] font-bold text-slate-yellow uppercase tracking-widest hover:underline"
                    >
                      + Add New
                    </button>
                  </div>

                  {showAddVehicle && (
                    <form 
                      onSubmit={handleAddVehicle}
                      className="glass-card p-4 space-y-3 border border-slate-yellow/20 relative animate-fadeIn"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="text-[10px] font-bold text-slate-yellow uppercase tracking-wider">Add New Vehicle</h4>
                        <button type="button" onClick={() => setShowAddVehicle(false)} className="text-slate-500 hover:text-slate-300">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Make (e.g. Maruti)" 
                          required
                          value={newVehicleMake}
                          onChange={e => setNewVehicleMake(e.target.value)}
                          className="bg-charcoal border border-white/10 rounded-xl p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50"
                        />
                        <input 
                          type="text" 
                          placeholder="Model (e.g. Swift)" 
                          required
                          value={newVehicleModel}
                          onChange={e => setNewVehicleModel(e.target.value)}
                          className="bg-charcoal border border-white/10 rounded-xl p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50"
                        />
                        <input 
                          type="text" 
                          placeholder="Plate (e.g. CH01-XX-0000)" 
                          required
                          value={newVehiclePlate}
                          onChange={e => setNewVehiclePlate(e.target.value)}
                          className="bg-charcoal border border-white/10 rounded-xl p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50"
                        />
                        <input 
                          type="text" 
                          placeholder="Color (e.g. White)" 
                          required
                          value={newVehicleColor}
                          onChange={e => setNewVehicleColor(e.target.value)}
                          className="bg-charcoal border border-white/10 rounded-xl p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-yellow/50"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-slate-yellow text-charcoal font-bold py-2 rounded-xl text-xs hover:bg-slate-yellow/90 transition-all uppercase tracking-wider"
                      >
                        Save Vehicle
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {vehicles.length === 0 ? (
                      <div className="glass-card p-6 text-center border-dashed border-white/5">
                        <p className="text-xs text-slate-500 font-medium mb-1">No registered vehicles found.</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Click "+ Add New" above to register your car</p>
                      </div>
                    ) : (
                      vehicles.map(v => (
                         <div key={v.id} className="glass-card p-4 flex items-center justify-between group hover:border-slate-yellow/30 transition-all">
                           <div className="flex items-center gap-4">
                             <div className="bg-white/5 p-3 rounded-2xl text-slate-yellow">
                               <Car size={20} />
                             </div>
                             <div>
                               <h4 className="font-black text-slate-100 text-sm leading-none mb-1">{v.make} {v.model}</h4>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{v.color} • {v.plate}</p>
                             </div>
                           </div>
                           
                           {vehicleToDelete === v.id ? (
                             <div className="flex items-center gap-1.5 bg-rose-500/10 p-1.5 rounded-xl border border-rose-500/20 animate-fadeIn">
                               <span className="text-[9px] text-rose-400 font-black uppercase tracking-wider pl-1">Confirm Remove?</span>
                               <button
                                 type="button"
                                 onClick={() => {
                                   handleRemoveVehicle(v.id);
                                   setVehicleToDelete(null);
                                 }}
                                 className="bg-rose-500 hover:bg-rose-600 text-white font-black text-[9px] uppercase px-2 py-1 rounded-lg transition-all"
                               >
                                 Yes
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setVehicleToDelete(null)}
                                 className="text-slate-400 hover:text-slate-200 font-bold text-[9px] uppercase px-1.5 py-1"
                               >
                                 No
                               </button>
                             </div>
                           ) : (
                             <div className="flex items-center gap-1">
                               <button className="text-slate-600 hover:text-slate-400 p-1.5 hover:bg-white/5 rounded-lg transition-all">
                                 <History size={16} />
                               </button>
                               <button 
                                 type="button"
                                 onClick={() => setVehicleToDelete(v.id)}
                                 className="text-rose-500/60 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                                 title="Remove Vehicle (Sold / Given Away)"
                               >
                                 <Trash2 size={16} />
                               </button>
                             </div>
                           )}
                         </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Settings</h3>
                  <div className="glass-card p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-slate-500" />
                        <span className="text-sm font-bold text-slate-300">Privacy & Security</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </div>
                    <button 
                      onClick={() => setShowEmergencyModal(true)}
                      className="w-full flex items-center justify-between text-left hover:bg-white/5 p-2 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-slate-500" />
                        <span className="text-sm font-bold text-slate-300">Emergency Contacts</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </button>

                    <div className="border-t border-white/5 pt-2">
                      {showSettingsResetConfirm ? (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl space-y-2 animate-fadeIn mt-1">
                          <p className="text-[10px] text-rose-400 font-black uppercase tracking-wider">Are you absolutely sure? All vehicles & requests will be wiped.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                triggerFirstTimeSetup();
                                setShowSettingsResetConfirm(false);
                              }}
                              className="bg-rose-500 hover:bg-rose-600 text-white font-black text-[9px] uppercase px-3 py-1.5 rounded-lg transition-all"
                            >
                              Yes, Wipe All Data
                            </button>
                            <button
                              onClick={() => setShowSettingsResetConfirm(false)}
                              className="text-slate-400 hover:text-slate-200 font-bold text-[9px] uppercase px-2 py-1.5"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSettingsResetConfirm(true)}
                          className="w-full flex items-center justify-between hover:bg-white/5 p-2 rounded-xl transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Trash2 size={16} className="text-rose-500" />
                            <span className="text-sm font-bold text-rose-400">Reset to Clean Slate</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {currentUser ? (
                <div className="space-y-4">
                  <button 
                    onClick={() => firebaseLogout().then(() => notify.success('Signed out from Google!', 'user'))}
                    className="w-full py-4 rounded-2xl bg-white/5 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-500/10 transition-all border border-rose-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={() => signInWithGoogle().then(() => notify.success('Signed in successfully!', 'user'))}
                    className="w-full py-4 rounded-2xl bg-slate-yellow text-charcoal font-bold text-xs uppercase tracking-widest hover:bg-slate-yellow/90 transition-all shadow-lg shadow-slate-yellow/10"
                  >
                    Sign In with Google
                  </button>
                  <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest px-4">
                    Sign in to secure and sync your vehicles & roadside assistance requests to the cloud
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="bg-charcoal border-t border-border-theme p-4 flex justify-around items-center absolute bottom-0 left-0 right-0 max-w-md sm:max-w-lg mx-auto z-20 transition-colors duration-300 md:hidden">
        <button 
          onClick={() => setActiveTab('home')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'home' ? "text-slate-yellow" : "text-slate-500"
          )}
        >
          <Navigation size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        {!isProviderMode && (
          <button 
            onClick={() => setActiveTab('care')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === 'care' ? "text-slate-yellow" : "text-slate-500"
            )}
          >
            <Sparkles size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Care</span>
          </button>
        )}
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'history' ? "text-slate-yellow" : "text-slate-500"
          )}
        >
          <History size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'profile' ? "text-slate-yellow" : "text-slate-500"
          )}
        >
          <Activity size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>

      {/* Location Picker Modal */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[60] flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-charcoal w-full max-w-md sm:max-w-lg rounded-t-[2.5rem] p-8 pb-12 space-y-6 shadow-2xl h-[80vh] flex flex-col border-t border-border-theme"
            >
              <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowLocationPicker(false)}
                    className="p-2 bg-charcoal-light/80 hover:bg-charcoal-light rounded-xl text-slate-400 hover:text-slate-100 transition-all border border-border-theme flex items-center justify-center"
                    aria-label="Go back"
                    id="back-to-booking-btn"
                  >
                    <ArrowLeft size={16} className="text-slate-yellow" />
                  </button>
                  <h2 className="text-xl font-black text-slate-100">Select Location</h2>
                </div>
                <button 
                  onClick={() => setShowLocationPicker(false)}
                  className="p-2 bg-charcoal-light rounded-full text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <button
                  onClick={getCurrentLocation}
                  className="w-full bg-slate-yellow/10 border border-slate-yellow/20 rounded-2xl p-4 flex items-center gap-4 text-slate-yellow font-bold hover:bg-slate-yellow/20 transition-all shrink-0"
                >
                  <div className="bg-slate-yellow p-2 rounded-xl text-charcoal">
                    <Navigation size={20} />
                  </div>
                  <span>Use Current Location</span>
                </button>

                <div className="relative shrink-0">
                  <input 
                    type="text" 
                    placeholder="Search areas in Tanzania..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-charcoal-light border border-border-theme rounded-xl py-3 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-yellow/20 focus:border-slate-yellow transition-all text-slate-100"
                  />
                  <MapPin className="absolute left-3 top-3.5 text-slate-yellow" size={18} />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2">Popular Areas</p>
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocation({ address: loc });
                        setShowLocationPicker(false);
                      }}
                      className="w-full p-4 rounded-xl border border-border-theme hover:border-slate-yellow hover:bg-slate-yellow/5 flex items-center gap-3 transition-all text-left"
                    >
                      <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-700" />
                      <span className="text-sm font-medium text-slate-300">{loc}</span>
                    </button>
                  ))}
                  {filteredLocations.length === 0 && (
                    <div className="py-10 text-center text-slate-400 dark:text-slate-600 text-sm">
                      No matching locations found.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-charcoal w-full max-w-md sm:max-w-lg rounded-t-[2.5rem] p-6 pb-8 md:p-8 md:pb-12 space-y-4 shadow-2xl border-t border-border-theme max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Back Button and Close on Top of Section */}
              <div className="flex justify-between items-center w-full shrink-0 border-b border-border-theme pb-3">
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedService(null);
                    setSelectedAddOns([]);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-charcoal-light/80 hover:bg-charcoal-light rounded-xl text-slate-300 hover:text-slate-100 transition-all border border-border-theme group text-[10px] font-black uppercase tracking-wider"
                  aria-label="Go back"
                  id="back-to-services-detail-btn"
                >
                  <ArrowLeft size={14} className="text-slate-yellow group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedService(null);
                    setSelectedAddOns([]);
                  }}
                  className="p-1.5 bg-charcoal-light rounded-xl text-slate-500 hover:text-slate-300 transition-colors border border-transparent hover:border-border-theme"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Service Info Header */}
              <div className="flex items-center gap-3 shrink-0 py-1">
                <div className={cn("p-2.5 rounded-2xl text-white shadow-lg shrink-0", selectedService.color)}>
                  <selectedService.icon size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-100 leading-none">{selectedService.title}</h2>
                  <p className="text-slate-400 text-[10px] font-bold tracking-wider mt-1 uppercase">
                    Est TSh {getBookingPriceTSh().toLocaleString()}
                  </p>
                </div>
              </div>

              <form onSubmit={handleRequest} className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-hide pb-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Location</label>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="w-full bg-charcoal-light/50 border border-border-theme rounded-2xl py-4 px-4 flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-viyeko-red/50 focus:border-viyeko-red transition-all text-slate-100"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MapPin className="text-viyeko-red shrink-0" size={18} />
                      <span className={cn("truncate", !location.address && "text-slate-500")}>
                        {location.address || "Select your location"}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-slate-500" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Vehicle Details</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. White Maruti Swift (CH01-XX-0000)"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    className="input-viyeko w-full"
                  />
                </div>

                {/* Custom Options per Service Type */}
                {selectedService.id === 'breakdown' && (
                  <div className="bg-charcoal-light/30 border border-white/5 p-4 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-slate-100 uppercase tracking-wider">Tow Distance (Miles)</label>
                      <span className="text-xs font-black text-slate-yellow font-mono">{towMiles} Miles</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase leading-none">Summoning: 200,000 TSh Base + 15,000 TSh / Mile</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={towMiles} 
                        onChange={(e) => setTowMiles(parseInt(e.target.value) || 1)}
                        className="w-full accent-slate-yellow"
                      />
                      <input 
                        type="number"
                        min="1"
                        value={towMiles}
                        onChange={(e) => setTowMiles(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 bg-charcoal border border-white/10 p-1 text-center rounded text-xs font-bold text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                )}

                {selectedService.id === 'tire' && (
                  <div className="bg-charcoal-light/30 border border-white/5 p-4 rounded-2xl space-y-4 animate-fadeIn">
                    {/* Spare vs New */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tire Option</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTireOption('spare')}
                          className={cn(
                            "p-2.5 rounded-xl border text-xs font-bold uppercase transition-all tracking-wider text-center",
                            tireOption === 'spare' 
                              ? "bg-slate-yellow text-charcoal font-black border-slate-yellow shadow-md" 
                              : "bg-charcoal/40 border-white/5 text-slate-400"
                          )}
                        >
                          Have Spare Tire
                        </button>
                        <button
                          type="button"
                          onClick={() => setTireOption('new')}
                          className={cn(
                            "p-2.5 rounded-xl border text-xs font-bold uppercase transition-all tracking-wider text-center",
                            tireOption === 'new' 
                              ? "bg-slate-yellow text-charcoal font-black border-slate-yellow shadow-md" 
                              : "bg-charcoal/40 border-white/5 text-slate-400"
                          )}
                        >
                          Need New Tire
                        </button>
                      </div>
                    </div>

                    {/* Basic labor vs Full package */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Service Quality Tier</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTireServiceType('basic')}
                          className={cn(
                            "p-2.5 rounded-xl border text-xs font-bold uppercase transition-all tracking-wider text-center",
                            tireServiceType === 'basic' 
                              ? "bg-white/10 border-white/30 text-white font-black" 
                              : "bg-charcoal/40 border-white/5 text-slate-400"
                          )}
                        >
                          Labor Only (8K TSh)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTireServiceType('full')}
                          className={cn(
                            "p-2.5 rounded-xl border text-xs font-bold uppercase transition-all tracking-wider text-center",
                            tireServiceType === 'full' 
                              ? "bg-white/10 border-white/30 text-white font-black" 
                              : "bg-charcoal/40 border-white/5 text-slate-400"
                          )}
                        >
                          Full Pkg (40K TSh)
                        </button>
                      </div>
                    </div>

                    {/* Budget/Price choice ranges from 85,000 to 600,000 if "new" is selected */}
                    {tireOption === 'new' && (
                      <div className="space-y-2 pt-2 border-t border-white/5 animate-fadeIn">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-black text-slate-100 uppercase tracking-wider">New Tire Cost</label>
                          <span className="text-xs font-black text-slate-yellow font-mono">{newTirePrice.toLocaleString()} TSh</span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase leading-none">New tire range: 85,000 to 600,000+ TSh</p>
                        <div className="flex items-center gap-3">
                          <input 
                            type="range" 
                            min="85000" 
                            max="600000" 
                            step="5000"
                            value={newTirePrice} 
                            onChange={(e) => setNewTirePrice(parseInt(e.target.value) || 85000)}
                            className="w-full accent-slate-yellow"
                          />
                          <input 
                            type="number"
                            min="85000"
                            max="1000000"
                            value={newTirePrice}
                            onChange={(e) => setNewTirePrice(Math.max(85000, parseInt(e.target.value) || 85000))}
                            className="w-20 bg-charcoal border border-white/10 p-1 text-center rounded text-xs font-bold text-slate-100 font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedService.id === 'fuel' && (
                  <div className="bg-charcoal-light/30 border border-white/5 p-4 rounded-2xl space-y-4 animate-fadeIn">
                    {/* Fuel Type selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-bold">Fuel Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFuelType('petrol')}
                          className={cn(
                            "p-2.5 rounded-xl border text-xs transition-all tracking-wider text-center font-black uppercase",
                            fuelType === 'petrol' 
                              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                              : "bg-charcoal/40 border-white/5 text-slate-400"
                          )}
                        >
                          ⛽ Petrol (4,086/L)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFuelType('diesel')}
                          className={cn(
                            "p-2.5 rounded-xl border text-xs transition-all tracking-wider text-center font-black uppercase",
                            fuelType === 'diesel' 
                              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                              : "bg-charcoal/40 border-white/5 text-slate-400"
                          )}
                        >
                          🚜 Diesel (4,333/L)
                        </button>
                      </div>
                    </div>

                    {/* Liters slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-100 uppercase tracking-wider">Volume (Liters)</label>
                        <span className="text-xs font-black text-emerald-400 font-mono">{fuelLiters} Liters</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          value={fuelLiters} 
                          onChange={(e) => setFuelLiters(parseInt(e.target.value) || 1)}
                          className="w-full accent-emerald-500"
                        />
                        <input 
                          type="number"
                          min="1"
                          value={fuelLiters}
                          onChange={(e) => setFuelLiters(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 bg-charcoal border border-white/10 p-1 text-center rounded text-xs font-bold text-slate-100 font-mono"
                        />
                      </div>
                    </div>

                    {/* Distance delivery charge slider: 2,000 per km */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-100 uppercase tracking-wider">Delivery Distance (KM)</label>
                        <span className="text-xs font-black text-emerald-400 font-mono">{fuelDistanceKm} KM</span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Delivery Charge: 2,000 TSh per KM</p>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="1" 
                          max="50" 
                          value={fuelDistanceKm} 
                          onChange={(e) => setFuelDistanceKm(parseInt(e.target.value) || 1)}
                          className="w-full accent-emerald-500"
                        />
                        <input 
                          type="number"
                          min="1"
                          value={fuelDistanceKm}
                          onChange={(e) => setFuelDistanceKm(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 bg-charcoal border border-white/10 p-1 text-center rounded text-xs font-bold text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedService.id === 'wash' && (
                  <div className="bg-charcoal-light/30 border border-white/5 p-4 rounded-2xl space-y-4 animate-fadeIn">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Select Wash Inclusions</label>
                    
                    {/* Basic Wash */}
                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-all">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={carWashBasic} 
                          onChange={(e) => setCarWashBasic(e.target.checked)}
                          className="rounded border-white/10 text-slate-yellow focus:ring-slate-yellow/50 bg-charcoal w-4 h-4"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-100">Basic Wash</span>
                          <p className="text-[9px] text-slate-400 font-medium">Exterior wash & dry</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-yellow font-mono">15,000 TSh</span>
                    </div>

                    {/* Interior Vacuuming */}
                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-all">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={carWashVacuum} 
                          onChange={(e) => setCarWashVacuum(e.target.checked)}
                          className="rounded border-white/10 text-slate-yellow focus:ring-slate-yellow/50 bg-charcoal w-4 h-4"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-100">Interior Vacuuming</span>
                          <p className="text-[9px] text-slate-400 font-medium">Deep-suction upholstery & carpets</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-yellow font-mono">55,000 TSh</span>
                    </div>

                    {/* Detailing */}
                    <div className="space-y-3 p-2 hover:bg-white/5 rounded-xl transition-all border-t border-white/5 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={carWashDetailing} 
                            onChange={(e) => setCarWashDetailing(e.target.checked)}
                            className="rounded border-white/10 text-slate-yellow focus:ring-slate-yellow/50 bg-charcoal w-4 h-4"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-100">Showroom Detailing</span>
                            <p className="text-[9px] text-slate-400 font-medium">Polishing, wax & detailing</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-yellow font-mono">300K - 650K TSh</span>
                      </div>
                      
                      {carWashDetailing && (
                        <div className="pt-2 pl-7 space-y-2 border-t border-white/5 animate-fadeIn">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Detailing Price</label>
                            <span className="text-xs font-black text-slate-yellow font-mono">{carWashDetailingPrice.toLocaleString()} TSh</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input 
                              type="range" 
                              min="300000" 
                              max="650000" 
                              step="10000"
                              value={carWashDetailingPrice} 
                              onChange={(e) => setCarWashDetailingPrice(parseInt(e.target.value) || 300000)}
                              className="w-full accent-slate-yellow"
                            />
                            <input 
                              type="number"
                              min="300000"
                              max="650000"
                              value={carWashDetailingPrice}
                              onChange={(e) => setCarWashDetailingPrice(Math.max(300000, Math.min(650000, parseInt(e.target.value) || 300000)))}
                              className="w-20 bg-charcoal border border-white/10 p-1 text-center rounded text-xs font-bold text-slate-100 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Drinks & Snacks Add-ons</label>
                  <p className="text-[9px] text-slate-500 font-bold uppercase leading-none mb-1">Delivered cold for your refreshment</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES.filter(s => s.isAddOn).map((addon) => (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => {
                          setSelectedAddOns(prev => 
                            prev.includes(addon.id) ? prev.filter(id => id !== addon.id) : [...prev, addon.id]
                          );
                        }}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex flex-col gap-1",
                          selectedAddOns.includes(addon.id) 
                            ? "bg-slate-yellow/10 border-slate-yellow text-slate-yellow" 
                            : "bg-charcoal-light/30 border-border-theme text-slate-400 hover:border-slate-400/50"
                        )}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] font-bold uppercase tracking-wider">{addon.title}</span>
                          <span className="text-[10px] font-black">TSh {(addon.price * 100).toLocaleString()}</span>
                        </div>
                        <span className="text-[9px] opacity-70">{addon.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedAddOns.length > 0 && (
                  <div className="space-y-1 bg-charcoal-light/20 p-4 rounded-2xl border border-white/5 animate-fadeIn">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Specify Drink & Snack Choices
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. 2 cold Fanta Oranges, 1 package of roasted peanuts"
                      value={addOnSpecification}
                      onChange={(e) => setAddOnSpecification(e.target.value)}
                      className="input-viyeko w-full text-xs"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Additional Notes</label>
                  <textarea 
                    placeholder="Describe any other requests or conditions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-viyeko w-full h-16 resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-border-theme space-y-3">
                  {/* Grand Total Breakdown */}
                  {selectedService && (
                    <div className="bg-charcoal-light/20 border border-white/5 rounded-xl p-3.5 space-y-2.5 animate-fadeIn">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-1.5">
                        Cost Breakdown
                      </h4>
                      <div className="space-y-2 text-xs">
                        {getBookingPriceBreakdown().map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-300">
                            <span className="font-semibold text-slate-400 text-[11px]">{item.label}</span>
                            <span className="font-mono font-bold text-slate-200 text-[11px]">TSh {item.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Cost (Est)</span>
                    <span className="text-xl font-black text-slate-yellow text-right font-mono">
                      TSh {getBookingPriceTSh().toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5 text-[9px] text-amber-400 leading-relaxed font-semibold">
                    ⚠️ Note: This is an initial reference estimate. The final service price is set dynamically by the roadside provider based on actual distance, fuel, tires, or other materials used.
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-viyeko-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Request
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {lastRequestId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-charcoal w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl text-center border border-white/5"
            >
                <div className="bg-emerald-100/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-2">
                  <CheckCircle2 size={40} />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-100">Request Confirmed!</h2>
                  <p className="text-slate-400 text-sm">We've received your request and are assigning a provider.</p>
                </div>

                {requests.find(r => r.id === lastRequestId) && (
                  <div className="bg-slate-yellow/10 border border-slate-yellow/20 rounded-2xl p-6 space-y-2">
                    <p className="text-[10px] font-bold text-slate-yellow uppercase tracking-widest">Estimated Arrival</p>
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 size={24} className="text-slate-yellow animate-spin" />
                      <span className="text-3xl font-black text-slate-100">
                        {requests.find(r => r.id === lastRequestId)?.estimatedArrival} mins
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">This will update as the provider moves</p>
                  </div>
                )}

              <button 
                onClick={() => {
                  setLastRequestId(null);
                  setActiveTab('history');
                }}
                className="btn-viyeko-primary w-full"
              >
                Track Progress
                <ChevronRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency & VIYEKO Personnel Support Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-charcoal w-full max-w-sm rounded-[2.5rem] p-6 space-y-6 shadow-2xl border border-white/5 relative"
            >
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="text-slate-yellow animate-pulse" size={20} />
                  <h3 className="text-lg font-black text-slate-100 uppercase italic tracking-tight">VIYEKO Personnel Support</h3>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Call or message VIYEKO personnel directly in Tanzania</p>
              </div>

              <div className="space-y-3">
                {/* Godson Martin */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-3 hover:border-slate-yellow/20 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-100 text-sm leading-none mb-1">Godson Martin</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">VIYEKO Director & Operations</p>
                    </div>
                    <span className="text-[8px] font-black bg-slate-yellow/10 text-slate-yellow px-2 py-0.5 rounded uppercase">Active</span>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href="tel:+255750057757"
                      className="flex-1 bg-slate-yellow text-charcoal font-black text-[10px] py-2.5 rounded-xl uppercase tracking-wider hover:bg-slate-yellow/90 active:scale-95 transition-all text-center flex items-center justify-center"
                    >
                      Call
                    </a>
                    <a 
                      href="https://wa.me/255750057757"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] py-2.5 rounded-xl uppercase tracking-wider active:scale-95 transition-all text-center flex items-center justify-center"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* Francis Masanja */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-3 hover:border-slate-yellow/20 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-100 text-sm leading-none mb-1">Francis Masanja</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">VIYEKO Technical Lead</p>
                    </div>
                    <span className="text-[8px] font-black bg-slate-yellow/10 text-slate-yellow px-2 py-0.5 rounded uppercase">Active</span>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href="tel:+255747746619"
                      className="flex-1 bg-slate-yellow text-charcoal font-black text-[10px] py-2.5 rounded-xl uppercase tracking-wider hover:bg-slate-yellow/90 active:scale-95 transition-all text-center flex items-center justify-center"
                    >
                      Call
                    </a>
                    <a 
                      href="https://wa.me/255747746619"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] py-2.5 rounded-xl uppercase tracking-wider active:scale-95 transition-all text-center flex items-center justify-center"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* General Emergency 112 */}
                <div className="bg-viyeko-red/10 border border-viyeko-red/20 p-4 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-rose-400 text-sm leading-none mb-1">National Emergency Hotline</h4>
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Police, Ambulance, & Rescue</p>
                    </div>
                    <span className="text-[8px] font-black bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded uppercase">Tanzania 24/7</span>
                  </div>
                  <a 
                    href="tel:112"
                    className="block w-full bg-viyeko-red hover:bg-viyeko-red-dark text-white font-black text-[10px] py-2.5 rounded-xl uppercase tracking-wider active:scale-95 transition-all text-center"
                  >
                    Dial 112
                  </a>
                </div>
              </div>

              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="w-full bg-white/5 border border-white/10 text-slate-400 font-bold py-2.5 rounded-xl text-xs hover:bg-white/10 transition-all uppercase tracking-widest mt-2"
              >
                Close Support Directory
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Dispatch/Booking Modal */}
      <AnimatePresence>
        {(transferringRequestId || transferringJobId) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-charcoal w-full max-w-sm rounded-[2.5rem] p-6 space-y-6 shadow-2xl border border-white/5 relative"
            >
              <button 
                onClick={() => {
                  setTransferringRequestId(null);
                  setTransferringJobId(null);
                }}
                className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CornerUpRight className="text-slate-yellow" size={20} />
                  <h3 className="text-lg font-black text-slate-100 uppercase italic tracking-tight">Transfer Dispatch</h3>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Select a nearby rescue unit to hand over this dispatch</p>
              </div>

              <div className="space-y-3">
                {TRANSFERABLE_PROVIDERS.map((provider) => (
                  <div key={provider.name} className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-3 hover:border-slate-yellow/20 transition-all flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-100 text-sm leading-none mb-1">{provider.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{provider.specialty}</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">Vehicle: {provider.vehicle} ({provider.distance})</p>
                      </div>
                      <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase shrink-0">Available</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (transferringRequestId) {
                          handleTransferRequest(transferringRequestId, provider.name, provider.phone);
                        } else if (transferringJobId) {
                          handleTransferSimulatedJob(transferringJobId, provider.name, provider.phone);
                        }
                      }}
                      className="w-full bg-slate-yellow text-charcoal font-black text-[10px] py-2 rounded-xl uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-1"
                    >
                      <CornerUpRight size={10} />
                      Transfer to {provider.name.split(' ')[0]}
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  setTransferringRequestId(null);
                  setTransferringJobId(null);
                }}
                className="w-full bg-white/5 border border-white/10 text-slate-400 font-bold py-2.5 rounded-xl text-xs hover:bg-white/10 transition-all uppercase tracking-widest mt-2"
              >
                Cancel Transfer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
