import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { COUNTRIES, DEFAULT_COUNTRY, flagEmoji } from '@/lib/countries';

export type PhoneValue = { iso2: string; dialCode: string; number: string };

export const DEFAULT_PHONE_VALUE: PhoneValue = {
  iso2: DEFAULT_COUNTRY.iso2,
  dialCode: DEFAULT_COUNTRY.dialCode,
  number: '',
};

export function formatE164(value: PhoneValue): string {
  return `${value.dialCode}${value.number.replace(/^0+/, '')}`;
}

type PhoneInputProps = {
  id: string;
  label: string;
  icon?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value: PhoneValue;
  onChange: (value: PhoneValue) => void;
};

const authInputClass =
  'h-11 rounded-[12px] border-border bg-white px-3.5 text-[13px] text-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:border-[var(--emerald)] focus-visible:ring-[3px] focus-visible:ring-[#0ba66f26] aria-invalid:border-destructive';

export function PhoneInput({ id, label, icon, required, disabled, error, value, onChange }: PhoneInputProps) {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return COUNTRIES;
    const digits = query.replace(/[^\d]/g, '');
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        (digits && country.dialCode.replace('+', '').startsWith(digits)),
    );
  }, [search]);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[11px] font-black text-[var(--deep)]">
        {label}
      </Label>
      <div className="flex gap-2">
        <Select
          value={value.iso2}
          onValueChange={(iso2) => {
            const country = COUNTRIES.find((c) => c.iso2 === iso2) ?? DEFAULT_COUNTRY;
            onChange({ ...value, iso2: country.iso2, dialCode: country.dialCode });
          }}
          onOpenChange={(open) => {
            if (open) window.setTimeout(() => searchInputRef.current?.focus(), 0);
            else setSearch('');
          }}
          disabled={disabled}
        >
          <SelectTrigger className="h-11 w-[108px] shrink-0 rounded-[12px] border-border bg-white px-3 text-[13px]">
            <SelectValue>
              {flagEmoji(value.iso2)} {value.dialCode}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={4} className="max-h-80 w-72 p-0">
            <div className="sticky top-0 z-10 border-b border-border bg-popover p-1.5">
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Escape') e.stopPropagation();
                }}
                placeholder="Search country or code"
                className="h-8 w-full rounded-md border border-input bg-white px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            {filteredCountries.length === 0 ? (
              <p className="p-3 text-center text-xs text-muted-foreground">No countries found.</p>
            ) : (
              filteredCountries.map((country) => (
                <SelectItem key={country.iso2} value={country.iso2}>
                  <span className="truncate">
                    {flagEmoji(country.iso2)} {country.name} ({country.dialCode})
                  </span>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          {icon ? (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <Input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            placeholder="801 234 5678"
            className={cn(authInputClass, icon && 'pl-10')}
            value={value.number}
            onChange={(e) => onChange({ ...value, number: e.target.value.replace(/[^\d]/g, '') })}
          />
        </div>
      </div>
      {error ? <p className="text-[11px] font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}
