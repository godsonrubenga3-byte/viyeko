export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', flag: '🇹🇿' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼' },
  { name: 'Burundi', code: 'BI', dialCode: '+257', flag: '🇧🇮' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
];

export const getCountryByCode = (code: string) => 
  COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
