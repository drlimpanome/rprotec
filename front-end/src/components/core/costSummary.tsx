import React, { useEffect, useState } from 'react';
import { ApiService } from '@/services/ApiServices';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { CopySimple, CurrencyDollar, User } from '@phosphor-icons/react/dist/ssr';
import { toast } from 'react-toastify';

import { ListStatus } from '@/types/list';
import { useUser } from '@/hooks/use-user';

import FileUpload from '../services/FileUpload';

interface CostSummaryProps {
  itemCount: number;
  idLista: string | undefined;
  costPerItem: number;
  status: ListStatus;
  pix_key?: string;
}

const apiService = new ApiService();

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CostSummary: React.FC<CostSummaryProps> = ({ idLista, itemCount, costPerItem, status, pix_key }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixPayload, setPixPayload] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [openQrCodeModal, setOpenQrCodeModal] = useState(false);
  const [comprovante, setComprovante] = useState<File | null>(null); // Estado para armazenar o arquivo do comprovante
  const totalCost = itemCount * costPerItem;
  const { user } = useUser();

  const handleGenerateQrCode = async () => {
    if (pix_key) {
      setPixPayload(pix_key);
      setPaymentStatus('pending');
      setOpenQrCodeModal(true);
      return;
    }
    try {
      const response = await apiService.postApi<{ cobranca: any; qrCode: any }>('/cobranca/pix', {
        valor: totalCost,
        descricao: 'Pagamento de Processamento da Lista',
        listId: idLista,
      });
      setQrCode(response.qrCode);
      setPixPayload(response.cobranca.payload);
      setPaymentStatus('pending');
      setOpenQrCodeModal(true);
    } catch (error) {
      toast.error('Ocorreu um Erro ao gerar o QR code de pagamento! Tente novamente mais tarde.');
    }
  };

  const handleCopyPayload = () => {
    toast.success('PIX copiado para a área de transferência!');
    if (pixPayload) navigator.clipboard.writeText(pixPayload);
  };

  const handleConfirmPayment = async () => {
    if (!comprovante) {
      toast.error('Por favor, anexe o comprovante de pagamento.');
      return;
    }

    const formData = new FormData();
    formData.append('comprovante', comprovante);
    formData.append('id', idLista || '');

    try {
      const response: any = await apiService.postApi('/cobranca/comprovante?type=list', formData);
      if (response.success) {
        toast.success('Comprovante enviado com sucesso! Aguarde a confirmação do pagamento.');
        setOpenQrCodeModal(false);
        window.location.reload();
      } else {
        toast.error('Erro ao enviar o comprovante. Tente novamente.');
      }
    } catch (error) {
      toast.error('Erro ao enviar o comprovante. Tente novamente.');
    }
  };

  const POLLING_TIMEOUT = 400000; // 5 minutos

  useEffect(() => {
    const startTime = Date.now();
    let isMounted = true;
    let timer: NodeJS.Timeout;

    if (qrCode && paymentStatus === 'pending') {
      timer = setInterval(async () => {
        if (Date.now() - startTime > POLLING_TIMEOUT) {
          if (isMounted) {
            setPaymentStatus('timeout');
            clearInterval(timer);
          }
          return;
        }

        try {
          const statusResponse = await apiService.getApi<{ status: string }>(
            `/cobranca/pix/status/${idLista}?type=list`
          );
          if (isMounted && statusResponse.status === 'pagamento aprovado') {
            setPaymentStatus('pagamento aprovado');
            clearInterval(timer);
            setOpenQrCodeModal(false);
            window.location.reload();
          }
        } catch (error) {
          if (isMounted) console.error('Erro ao verificar o status do pagamento:', error);
        }
      }, 3000);
    }

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [qrCode, paymentStatus, idLista]);

  return (
    <Card sx={{ 
      p: 2, 
      mb: 2,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 183, 197, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        Resumo de Custos para Processamento da Lista
      </Typography>

      <Grid container spacing={2} alignItems="center">
        {/* Item Count Section */}
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center">
            <User size={32} weight="fill" color="#003677" style={{ marginRight: '12px' }} />
            <Box>
              <Typography variant="body2" sx={{ color: '#003677', fontSize: '0.8125rem' }}>
                Total de Itens
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {itemCount}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Cost per Item Section */}
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center">
            <CurrencyDollar size={32} weight="fill" color="#008BBB" style={{ marginRight: '12px' }} />
            <Box>
              <Typography variant="body2" sx={{ color: '#008BBB', fontSize: '0.8125rem' }}>
                Custo por Item
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(costPerItem)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Total Cost Section - as Button when payment is pending */}
        <Grid item xs={12}>
          {status === 'aguardando pagamento' ||
          status === 'Pagamento confirmado' ||
          (status === 'Aguardando confirmação do envio' && user?.role == 2) ? (
            <Button
              onClick={handleGenerateQrCode}
              sx={{
                mt: 1.5,
                background: 'linear-gradient(135deg, #008bbb 0%, #00b7c5 100%)',
                borderRadius: 2,
                p: 1.5,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #006a8e 0%, #0096a0 100%)',
                },
              }}
            >
              <CurrencyDollar size={32} weight="fill" color="#ffffff" style={{ marginRight: '12px' }} />
              <Box>
                <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '0.8125rem' }}>
                  {status == 'Pagamento confirmado' || status == 'Aguardando confirmação do envio'
                    ? 'Clique para pagar, e subir a lista do afiliado para o REMOVIDO'
                    : 'Clique para pagar'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                  {formatCurrency(totalCost)}
                </Typography>
              </Box>
            </Button>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{ 
                mt: 1.5, 
                background: 'linear-gradient(135deg, #008bbb 0%, #00b7c5 100%)', 
                borderRadius: 2, 
                p: 1.5 
              }}
            >
              <CurrencyDollar size={32} weight="fill" color="#ffffff" style={{ marginRight: '12px' }} />
              <Box>
                <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '0.8125rem' }}>
                  Custo Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                  {formatCurrency(totalCost)}
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
      {(status === 'Pagamento confirmado' || status === 'Aguardando confirmação do envio') && user?.role == 2 && (
        <Alert sx={{ mt: 1.5 }} severity="warning">
          <Typography variant="body2">
            Para subir a lista do afiliado para a REMOVIDO, voce precisa anexar o comprovante do pagamento para essa
            lista, ou pagar varias de uma vez na tela de listas.{' '}
          </Typography>
        </Alert>
      )}

      {/* Modal para exibir o QR Code */}
      <Dialog open={openQrCodeModal} onClose={() => setOpenQrCodeModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3f51b5' }}>
          {qrCode ? 'Escaneie o QR Code para Efetuar o Pagamento' : 'Copie o Código Pix para Efetuar o Pagamento'}
        </DialogTitle>
        <DialogContent>
          {qrCode && (
            <>
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2, mb: 2 }}>
                <Box
                  component="img"
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code de Pagamento"
                  sx={{ width: 250, height: 250 }}
                />
              </Box>
              <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 2 }}>
                Abra o aplicativo do seu banco e escaneie o QR Code para completar o pagamento. A verificação será feita
                automaticamente.
              </Typography>
            </>
          )}

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

              {/* Campo de Upload de Comprovante usando o componente FileUpload */}
              {pix_key && (
                <>
                  <Box sx={{ mt: 3 }}>
                    <FileUpload
                      label="Comprovante de Pagamento"
                      required
                      value={comprovante}
                      onChange={setComprovante}
                    />
                  </Box>

                  {/* Botão de Confirmação */}
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleConfirmPayment}
                      disabled={!comprovante} // Desabilita o botão se não houver comprovante
                    >
                      Confirmar Pagamento
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CostSummary;
