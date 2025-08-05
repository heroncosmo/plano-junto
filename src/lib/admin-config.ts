// ========================================
// CONFIGURAÇÃO DE ADMINISTRADORES
// ========================================

export const ADMIN_EMAILS = [
  'calcadosdrielle@gmail.com',
  'rodrigoheleno7@gmail.com'
];

export const isAdmin = (email: string | undefined): boolean => {
  return email ? ADMIN_EMAILS.includes(email) : false;
};

export const getAdminEmails = (): string[] => {
  return [...ADMIN_EMAILS];
}; 