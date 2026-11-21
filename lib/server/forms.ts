import type { Address } from '../types';

/** A form error that names the field to put the cursor back in. */
export type FieldError = { error: string; field: string };

/** Trims a typed value and squeezes its spaces; anything that isn't text comes back empty. */
export const tidy = (value: unknown) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '');

export function checkName(value: unknown): string | FieldError {
  const name = tidy(value);
  if (name.length < 2 || name.length > 80) return { error: 'Enter your full name.', field: 'name' };
  return name;
}

export function checkCity(value: unknown): string | FieldError {
  const city = tidy(value);
  if (!city || city.length > 60) return { error: 'Enter the city we’ll deliver to.', field: 'city' };
  return city;
}

/** A delivery address as typed on the address screen, checked the way a courier would need it. */
export function checkAddress(raw: unknown): Address | FieldError {
  const a = (raw ?? {}) as Record<string, unknown>;
  const line = tidy(a.line);
  const area = tidy(a.area);
  const city = tidy(a.city);
  const pin = tidy(a.pin).replace(/\s/g, '');
  // Indian mobile numbers: ten digits, with or without +91 or a leading 0.
  const phone = tidy(a.phone).replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');

  if (line.length < 3 || line.length > 80) return { error: 'Enter your house or flat number and street.', field: 'line' };
  if (area.length > 80) return { error: 'Keep the area to 80 characters.', field: 'area' };
  if (!city || city.length > 60) return { error: 'Enter your city.', field: 'city' };
  if (!/^[1-9]\d{5}$/.test(pin)) return { error: 'Enter your 6-digit PIN code.', field: 'pin' };
  if (!/^[6-9]\d{9}$/.test(phone)) return { error: 'Enter a 10-digit mobile number for the courier.', field: 'phone' };
  return { line, area, city, pin, phone };
}

export const isError = <T,>(value: T | FieldError): value is FieldError =>
  typeof value === 'object' && value !== null && 'error' in value && 'field' in value;
