import * as XLSX from 'xlsx';

import { ResponsibleReport } from './ResponsibleReportViewer';

export const exportReportToExcel = (reportList: ResponsibleReport[]) => {
  const wb = XLSX.utils.book_new();

  // Aba única: "Relatório"
  const flatData = reportList.flatMap((responsibleItem) =>
    responsibleItem.lists.map((list) => ({
      Responsável: responsibleItem.responsible,
      Cliente: list.client,
      'Nome da Lista': list.list_name,
      'Quantidade de Nomes': list.names_quantity,
      'Valor Total (R$)': list.total_price,
    }))
  );

  const sheet = XLSX.utils.json_to_sheet(flatData);
  XLSX.utils.book_append_sheet(wb, sheet, 'Relatório');

  XLSX.writeFile(wb, `relatorio_responsaveis_${new Date().toISOString()}.xlsx`);
};
