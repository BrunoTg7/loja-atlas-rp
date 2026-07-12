const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\(/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<form/gi,
  /document\./gi,
  /window\./gi,
  /eval\(/gi,
  /alert\(/gi,
  /confirm\(/gi,
  /prompt\(/gi,
  /fetch\(/gi,
  /XMLHttpRequest/gi,
  /<img[^>]+onerror/gi,
  /<svg[^>]+onload/gi,
];

export function sanitizeInput(input: string): string {
  let clean = input;
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, "");
  }
  return clean
    .replace(/[<>]/g, "")
    .replace(/\{/g, "(")
    .replace(/\}/g, ")")
    .trim();
}

export function hasSuspiciousContent(input: string): boolean {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) return true;
  }
  if (input.length > 0 && input.length < 3) return true;
  if (/(.)\1{10,}/.test(input)) return true;
  if (/^[a-zA-Z0-9]{50,}$/.test(input) && /\d{5,}/.test(input)) return true;
  return false;
}
