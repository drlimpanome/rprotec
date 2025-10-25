// NameListComponent.tsx
import React from 'react';
import { Button, Card, Divider, Grid, IconButton, List, ListItem, TextField, Typography } from '@mui/material';
import { Trash } from '@phosphor-icons/react/dist/ssr';

import { ListStatus } from '@/types/list';
import { User } from '@/types/user';

import MaskInputText from './MaskInputComponent';

interface listData {
  nome: string;
  cpf: string;
}

interface NameListComponentProps {
  listData: listData[];
  onChange: (index: number, field: keyof listData, value: string) => void;
  addProcess: () => void;
  removeProcess: (index: number) => void; // New prop for removing a process
  errors: any;
  status: ListStatus;
  user?: User | null;
}

const NameListComponent: React.FC<NameListComponentProps> = ({
  listData,
  onChange,
  addProcess,
  removeProcess,
  errors,
  status,
  user,
}) => (
  <Card sx={{ 
    p: 2, 
    mb: 2,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 183, 197, 0.2)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  }}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
      Lista de nomes / Documento
    </Typography>
    <List>
      {listData.map((process, index) => (
        <ListItem key={index} sx={{ display: 'block', position: 'relative', py: 1 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                label="Nome"
                fullWidth
                size="small"
                value={process.nome}
                disabled={user?.role !== 1 && status !== 'aguardando pagamento'}
                onChange={(e) => onChange(index, 'nome', e.target.value)}
                error={errors[`process-${index}-nome`]}
                helperText={errors[`process-${index}-nome`] ? 'Este campo é obrigatório.' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <MaskInputText
                label="Documento"
                maskType="cpf_cnpj"
                fullWidth
                size="small"
                value={process.cpf}
                disabled={user?.role !== 1 && status !== 'aguardando pagamento'}
                onChange={(value: any) => onChange(index, 'cpf', value)}
                error={errors[`process-${index}-cpf`]}
                helperText={
                  errors[`process-${index}-cpf`] &&
                  (errors[`process-${index}-cpf`] === 'invalid'
                    ? 'Documento inválido (CPF ou CNPJ).'
                    : 'Este campo é obrigatório.')
                }
              />
            </Grid>
            <Grid item xs={11} sm={1}>
              <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>
                {index + 1}/{listData.length}
              </Typography>
            </Grid>
            <Grid item xs={1} sm={1} sx={{ textAlign: 'right' }}>
              <IconButton
                color="error"
                size="small"
                onClick={() => removeProcess(index)}
                disabled={status !== 'aguardando pagamento' && user?.role !== 1}
              >
                <Trash size={18} />
              </IconButton>
            </Grid>
          </Grid>
          <Divider sx={{ my: 1.5 }} />
        </ListItem>
      ))}
    </List>

    {status === 'aguardando pagamento' && (
      <Button variant="outlined" size="small" onClick={addProcess} sx={{ mt: 1.5, px: 2, py: 0.75 }}>
        Adicionar Nome
      </Button>
    )}
  </Card>
);

export default NameListComponent;
