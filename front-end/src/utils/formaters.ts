export const formatDate = (date: string | Date | undefined) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(parsedDate.getTime())) return '';

  // Adiciona 3 horas
  parsedDate.setHours(parsedDate.getHours() + 3);

  return parsedDate.toLocaleDateString();
};

export const formatProcessCats = (category: string) => {
  const categoryMappings: { [key: string]: string } = {
    Diligências_Judiciais: 'Diligências Judiciais',
    Diligências_ExtraJudiciais: 'Diligências Extrajudiciais',
    Audiências_Judiciais: 'Audiências Judiciais',
    Audiências_ExtraJudiciais: 'Audiências Extrajudiciais',
    Duo_Diligence: 'Duo Diligence',
  };

  return categoryMappings[category] || category;
};

// src/utils/formatters.ts

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
};

export const formatCurrencyNoRound = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
