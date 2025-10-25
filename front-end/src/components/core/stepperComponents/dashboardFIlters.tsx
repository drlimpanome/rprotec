import React from 'react';
import { Button, Card, CardContent, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export interface FilterProps {
  clients: { id: number; username: string }[];
  onFilter: (filters: { clientId: number | null; startDate: Date | null; endDate: Date | null }) => void;
}

export function Filters({ clients, onFilter }: FilterProps): React.JSX.Element {
  const [clientId, setClientId] = React.useState<number | null>(null);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  const handleApplyFilters = () => {
    onFilter({ clientId, startDate, endDate });
  };

  return (
    <Card sx={{ padding: 2 }}>
      <CardContent>
        <Grid container spacing={3} alignItems="center" justifyContent="flex-end">
          <Grid item xs={12} sm={4} md={4}>
            <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              Removido Dashboard
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <DatePicker
              label="Data Início"
              value={startDate}
              onChange={(date: any) => setStartDate(date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <DatePicker
              label="Data Fim"
              value={endDate}
              onChange={(date: any) => setEndDate(date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Button variant="contained" onClick={handleApplyFilters} fullWidth sx={{ height: '100%' }}>
              Aplicar Filtros
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
