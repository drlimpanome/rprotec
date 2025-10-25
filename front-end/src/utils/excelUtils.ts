import { formatCurrency, formatCurrencyNoRound } from '@/utils/formaters';
import * as XLSX from 'xlsx';

import { listData, ListGroupData, ReviewData } from '@/types/list';

export const handleFileUpload = (file: File, setFormData: React.Dispatch<React.SetStateAction<ReviewData>>) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: ['nome', 'cpf'], defval: '' });

    // Remove header row from data by skipping the first element
    const dataWithoutHeader = jsonData.slice(1);

    setFormData((prev) => ({
      ...prev,
      listData: dataWithoutHeader as listData[],
    }));
  };
  reader.readAsArrayBuffer(file);
};

export const downloadTemplate = () => {
  const worksheetData = [
    { nome: 'João Silva', 'DOCUMENTO(CPF/CNPJ)': '12345678901' },
    { nome: 'Maria Oliveira', 'DOCUMENTO(CPF/CNPJ)': '09876543210' },
  ];
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');

  XLSX.writeFile(workbook, 'ListaModelo.xlsx');
};

export const handleDownloadListGroupNamesInfo = (lists: ListGroupData['lists']) => {
  // Criação do array de dados no formato necessário
  const worksheetData = lists.flatMap((list) =>
    list.listData.map((item: any) => ({
      Cliente: list.client?.username,
      'Responsavel pelo cliente': list.client?.responsible,
      nome: item.nome,
      'DOCUMENTO(CPF/CNPJ)': item.cpf,
      Preço: list.client?.price_consult,
    }))
  );

  // Gerar a planilha a partir dos dados
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ListGroupData');

  // Gerar nome do arquivo com a data atual
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Lista_agrupamento_nomes_${dateStr}.xlsx`;

  // Exportar o arquivo
  XLSX.writeFile(workbook, filename);
};
