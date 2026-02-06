import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PHONE_COUNTRY_CODES } from '@shared/countryFormConfig';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  defaultCountryCode?: string;
  className?: string;
}

export function PhoneInput({ 
  value, 
  onChange, 
  label = 'Phone Number',
  required = false,
  defaultCountryCode = '+1',
  className = ''
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(value.replace(countryCode, '').trim());

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    onChange(`${newCode} ${phoneNumber}`);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    setPhoneNumber(newNumber);
    onChange(`${countryCode} ${newNumber}`);
  };

  return (
    <div className={className}>
      {label && (
        <Label className="text-white mb-2 block">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={handleCountryCodeChange}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/20 max-h-60">
            {PHONE_COUNTRY_CODES.map((item) => (
              <SelectItem 
                key={item.code} 
                value={item.code}
                className="text-white hover:bg-white/10 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>{item.flag}</span>
                  <span>{item.code}</span>
                  <span className="text-xs text-white/50">({item.country})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="123-456-7890"
          required={required}
          className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/30"
        />
      </div>
    </div>
  );
}

export default PhoneInput;
