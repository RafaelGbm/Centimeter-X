const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Informe o e-mail.';
  if (!EMAIL_RE.test(value.trim())) return 'E-mail inválido.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Informe a senha.';
  if (value.length < 8) return 'A senha deve ter ao menos 8 caracteres.';
  return null;
}

export function validateName(value: string): string | null {
  if (!value.trim()) return 'Informe o nome.';
  if (value.trim().length < 2) return 'O nome deve ter ao menos 2 caracteres.';
  return null;
}

export function validateRequired(value: string, field = 'Campo'): string | null {
  return value.trim() ? null : `${field} é obrigatório.`;
}
