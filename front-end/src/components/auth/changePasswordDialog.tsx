'use client';

import * as React from 'react';
import { ApiService } from '@/services/ApiServices';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { PasswordConfirmFields } from '../dashboard/settings/update-password';

type PasswordChangeDialogProps = {
  open: boolean;
  onClose: () => void;
  userId: string | number;
};

const api = new ApiService();

export default function PasswordChangeDialog({ open, onClose, userId }: PasswordChangeDialogProps) {
  const [pwd, setPwd] = React.useState('');
  const [pwd2, setPwd2] = React.useState('');
  const [canSubmit, setCanSubmit] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleClose = () => {
    if (!submitting) {
      setPwd('');
      setPwd2('');
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Ajuste o endpoint conforme sua API.
      // Mantive o padrão do seu profile update (PUT em /client/:id).
      await api.putApi(`/client/${userId}`, { password: pwd });

      handleClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Falha ao atualizar a senha');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Alterar senha</DialogTitle>
      <DialogContent dividers>
        <PasswordConfirmFields
          value={pwd}
          confirmValue={pwd2}
          onChange={setPwd}
          onConfirmChange={setPwd2}
          onValidityChange={setCanSubmit}
          minLength={6} // ou 8 — ajuste como preferir
          requireNumber // exige ao menos um número
          caption="A senha deve ter pelo menos 6 caracteres e conter ao menos um número."
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? 'Salvando…' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
