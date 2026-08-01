export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidDNI(dni: string): boolean {
  const dniRegex = /^\d{8}$/;
  return dniRegex.test(dni);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^9\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function isValidTrackingCode(code: string): boolean {
  return /^ECO-[A-Z0-9]+-[A-Z0-9]+$/.test(code);
}
