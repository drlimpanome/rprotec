// ListNameField.tsx
import React from 'react';
import { Card, Grid, TextField, Typography } from '@mui/material';

import { ListStatus } from '@/types/list';
import { User } from '@/types/user';

interface ListNameFieldProps {
  listName: string;
  onChange: (value: string) => void;
  error: boolean;
  status: ListStatus;
  user?: User | null;
}

const ListNameField: React.FC<ListNameFieldProps> = ({ listName, onChange, error, status, user }) => (
  <Card sx={{ 
    p: 2, 
    mb: 2,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 183, 197, 0.2)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  }}>
    <Typography sx={{ mb: 1.5 }} variant="subtitle1" fontWeight={600}>
      Informações Gerais
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Nome da Lista"
          fullWidth
          size="small"
          value={listName}
          disabled={status !== 'aguardando pagamento' && user?.role !== 1}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          helperText={error ? 'Este campo é obrigatório.' : ''}
        />
      </Grid>
    </Grid>
  </Card>
);

export default ListNameField;
