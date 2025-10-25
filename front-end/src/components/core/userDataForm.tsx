// UserDataForm.tsx
import React from 'react';
import { Card, Grid, TextField, Typography } from '@mui/material';

import { ListStatus } from '@/types/list';

interface UserDataFormProps {
  username: string;
  phone: string;
  email: string;
  onChange: (field: string, value: string) => void;
  errors: { [key: string]: boolean };
  status: ListStatus;
}

const UserDataForm: React.FC<UserDataFormProps> = ({ username, phone, email, onChange, errors, status }) => (
  <Card sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 3 }} gutterBottom>
      Insira seus dados
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Usuário"
          fullWidth
          value={username}
          disabled={status !== 'aguardando pagamento'}
          onChange={(e) => onChange('username', e.target.value)}
          error={errors.username}
          helperText={errors.username ? 'Este campo é obrigatório.' : ''}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Telefone"
          fullWidth
          value={phone}
          disabled={status !== 'aguardando pagamento'}
          onChange={(e) => onChange('phone', e.target.value)}
          error={errors.phone}
          helperText={errors.phone ? 'Este campo é obrigatório.' : ''}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Email"
          fullWidth
          value={email}
          disabled={status !== 'aguardando pagamento'}
          onChange={(e) => onChange('email', e.target.value)}
          error={errors.email}
          helperText={errors.email ? 'Este campo é obrigatório.' : ''}
        />
      </Grid>
    </Grid>
  </Card>
);

export default UserDataForm;
