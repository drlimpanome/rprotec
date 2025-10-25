import * as React from 'react';
import { useState } from 'react';
import { formatCurrency } from '@/utils/formaters';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { CopySimple, CurrencyDollar } from '@phosphor-icons/react';

import FileUpload from '../services/FileUpload';

interface PayDialogProps {
  open: boolean;
  qrCode?: string;
  pixPayload?: string;
  comprovante: File | null;
  setComprovante: (file: File | null) => void;
  onClose: () => void;
  onConfirmPayment: () => Promise<void>; // Agora espera um retorno async
  totalPrice: number;
}

export const PayDialog: React.FC<PayDialogProps> = ({
  open,
  pixPayload,
  comprovante,
  setComprovante,
  onClose,
  onConfirmPayment,
  totalPrice,
}) => {
  const [loading, setLoading] = useState(false); // Estado para controlar o loading

  const handleCopyPayload = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload);
    }
  };

  const handleConfirmClick = async () => {
    if (!comprovante) return;

    setLoading(true); // Ativa o loading
    try {
      await onConfirmPayment(); // Aguarda a função de pagamento
    } finally {
      setLoading(false); // Desativa o loading após o término da operação
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3f51b5' }}>
        Copie o Código Pix para Efetuar o Pagamento
      </DialogTitle>
      <DialogContent>
        <Card sx={{ p: 2 }} variant="outlined">
          <Box display="flex" alignItems="center">
            <CurrencyDollar size={40} weight="fill" color="#ff9800" style={{ marginRight: '16px' }} />
            <Box>
              <Typography variant="h6" sx={{ color: '#ff9800' }}>
                Custo Total
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(totalPrice * 100)}
              </Typography>
            </Box>
          </Box>
        </Card>
        {pixPayload && (
          <>
            <Box display="flex" alignItems="center" sx={{ mt: 3 }}>
              <TextField
                label="Código Pix (copia e cola)"
                variant="outlined"
                fullWidth
                value={pixPayload}
                disabled
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopyPayload} sx={{ ml: 1 }}>
                        <CopySimple color="primary" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Campo de Upload de Comprovante */}
            <Box sx={{ mt: 3 }}>
              <FileUpload label="Comprovante de Pagamento" required value={comprovante} onChange={setComprovante} />
            </Box>

            {/* Botão de Confirmação com Loading */}
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleConfirmClick}
                disabled={!comprovante || loading} // Desabilita enquanto estiver processando
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null} // Ícone de loading
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
