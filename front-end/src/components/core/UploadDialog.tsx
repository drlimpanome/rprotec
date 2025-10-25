import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';

interface ProtocolData {
  id: number;
  protocol: string;
}

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: () => void;
  type: string;
  data: ProtocolData[]; // Array de objetos com id e protocol
}

const UploadDialog: React.FC<UploadDialogProps> = ({ open, onClose, onUpload, type, data }) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Título do Diálogo */}
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          fontSize: '1.25rem',
        }}
      >
        Confirmar envio
      </DialogTitle>

      {/* Conteúdo do Diálogo */}
      <DialogContent sx={{ padding: theme.spacing(3) }}>
        <Typography variant="body1" gutterBottom sx={{ marginBottom: theme.spacing(2) }} mt={2}>
          Você está prestes a enviar os itens selecionados para tratativa. Confira os protocolos abaixo:
        </Typography>

        {/* Divisor visual */}
        <Divider sx={{ marginBottom: theme.spacing(2) }} />

        {/* Lista de protocolos */}
        <List sx={{ maxHeight: '300px', overflowY: 'auto', marginBottom: theme.spacing(2) }}>
          {data.map((item) => (
            <ListItem
              key={item.id}
              sx={{
                backgroundColor: theme.palette.grey[100],
                borderRadius: theme.shape.borderRadius,
                marginBottom: theme.spacing(1),
                '&:last-child': {
                  marginBottom: 0,
                },
              }}
            >
              <ListItemText primary={`Protocolo: ${item.protocol}`} primaryTypographyProps={{ fontWeight: 'medium' }} />
            </ListItem>
          ))}
        </List>

        {/* Mensagem de contagem */}
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
          Total de itens selecionados: {data.length}
        </Typography>
      </DialogContent>

      {/* Ações do Diálogo */}
      <DialogActions sx={{ padding: theme.spacing(2), borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} color="secondary" variant="outlined" sx={{ marginRight: theme.spacing(1) }}>
          Cancelar
        </Button>
        <Button onClick={onUpload} color="primary" variant="contained">
          Confirmar envio
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDialog;
