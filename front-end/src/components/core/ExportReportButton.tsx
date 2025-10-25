'use client';

import * as React from 'react';
import { Button, Stack } from '@mui/material';
import { Export } from '@phosphor-icons/react';
import * as XLSX from 'xlsx';

interface ExportReportButtonProps {
  totalizersInfo: any;
  totalPendingAmount: number;
  totalProcessedAmount: number;
  monthlyChartData: any;
}

export const ExportReportButton: React.FC<ExportReportButtonProps> = ({
  totalizersInfo,
  totalPendingAmount,
  totalProcessedAmount,
  monthlyChartData,
}) => {
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Aba de Totalizadores
    const totalizersSheet = XLSX.utils.json_to_sheet([
      { Nome: 'Total de Nomes', Valor: totalizersInfo.totalNames },
      { Nome: 'Clientes Únicos', Valor: totalizersInfo.uniqueClients },
      { Nome: 'Receita Total', Valor: totalizersInfo.totalRevenue },
      { Nome: 'Total de Clientes', Valor: totalizersInfo.totalClients },
      { Nome: 'Receita do Próximo Mês', Valor: totalizersInfo.nextMontRevenue },
      { Nome: 'Aumento do Próximo Mês', Valor: totalizersInfo.nextMontIncrease },
      { Nome: 'Valor Pendente', Valor: totalPendingAmount },
      { Nome: 'Valor Processado', Valor: totalProcessedAmount },
    ]);

    XLSX.utils.book_append_sheet(wb, totalizersSheet, 'Totalizadores');

    // Aba de Dados Mensais Formatados
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const monthlySheetData = Object.entries(monthlyChartData || {}).map(([month, values]: any) => ({
      Mês: months[Number(month) - 1] || `Mês ${month}`,
      'Novos Parceiros': values.newPartnersCount,
      'Não Enviaram': values.notSendingCount,
      'Aumento de Faturamento (%)': values.revenueIncreasePercentage.toFixed(2), // Formatação percentual
    }));

    const monthlySheet = XLSX.utils.json_to_sheet(monthlySheetData);
    XLSX.utils.book_append_sheet(wb, monthlySheet, 'Indicadores Mensais');

    // Salvar o arquivo
    XLSX.writeFile(wb, `dashboard_report_${new Date().toISOString()}.xlsx`);
  };

  return (
    <Stack
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 2,
        gap: 2,
        flexWrap: 'wrap',
        backgroundColor: 'background.paper',
        border: 'none',
      }}
    >
      <Button variant="contained" color="primary" onClick={exportExcel} sx={{ minWidth: 180 }} endIcon={<Export />}>
        Exportar Excel
      </Button>
    </Stack>
  );
};
