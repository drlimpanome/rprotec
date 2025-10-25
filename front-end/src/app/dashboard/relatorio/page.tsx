'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { ApiService } from '@/services/ApiServices';
import { Button, Card, MenuItem, TextField } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowSquareOut, Spinner } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import { useUser } from '@/hooks/use-user';
import { exportReportToExcel } from '@/components/dashboard/responsibles/exportReportToExcel';
import {
  ResponsibleReport,
  ResponsibleReportViewer,
} from '@/components/dashboard/responsibles/ResponsibleReportViewer';

const apiService = new ApiService();

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [reportMap, setReportMap] = useState<ResponsibleReport[] | null>(null);

  const fetchCustomers = async () => {
    try {
      const response = await apiService.getApi<string[]>('/client/responsible');
      setCustomers(response);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportMap(null); // limpa o relatório anterior

    if (!startDate || !endDate) {
      toast.error('Por favor, selecione o período.');
      setLoading(false);
      return;
    }

    const diff = dayjs(endDate).diff(dayjs(startDate), 'day');
    if (diff > 31) {
      toast.error('O intervalo máximo permitido é de 31 dias.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        responsibles: selectedResponsibles,
        startDate,
        endDate,
      };

      const report = await apiService.postApi<ResponsibleReport[]>('/client/responsible/report', payload);
      setReportMap(report);
    } catch (err) {
      console.error('Erro ao extrair relatório:', err);
      toast.error('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between">
        {' '}
        <Typography variant="h4">Relatório por Responsável</Typography>
        {reportMap && reportMap.length > 0 && (
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowSquareOut size={20} />}
              onClick={() => exportReportToExcel(reportMap)}
              sx={{ alignSelf: 'flex-end', mt: 2 }}
            >
              Exportar Excel
            </Button>
          </Stack>
        )}
      </Stack>

      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <TextField
            select
            SelectProps={{ multiple: true }}
            label="Responsáveis"
            value={selectedResponsibles}
            onChange={(e) => setSelectedResponsibles(e.target.value as any)}
          >
            {customers.map((responsible) => (
              <MenuItem key={responsible} value={responsible}>
                {responsible}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2}>
            <TextField
              type="date"
              label="Data Inicial"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
            <TextField
              type="date"
              label="Data Final"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />
          </Stack>

          <Button variant="contained" onClick={handleGenerateReport} disabled={loading}>
            {loading ? <Spinner size={16} weight="bold" /> : <span>Gerar Relatório</span>}
          </Button>
        </Stack>
      </Card>

      {reportMap && <ResponsibleReportViewer reportList={reportMap} />}
    </Stack>
  );
}
