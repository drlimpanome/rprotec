'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ApiService } from '@/services/ApiServices';
import { formatCurrency, formatDate } from '@/utils/formaters';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CopySimple, CurrencyDollar, User } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

import { ListStatus } from '@/types/list';
import { ServiceFormSubmission } from '@/types/service_answers';
import { useUser } from '@/hooks/use-user';
import UploadButton from '@/components/core/confirm-affiliate-list';
import SeeComprovante from '@/components/core/seeComprovante';
import FileUpload from '@/components/services/FileUpload';
import GeneratedForm from '@/components/services/GeneratedForm';

export const StatusMap = [
  'finalizada',
  'spc',
  'boa vista',
  'cenprot sp',
  'cenprot br',
  'quod',
  'serasa',
  'finalizada',
  'erro',
  'cancelada',
];

const apiService = new ApiService();

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const { id } = useParams();
  const [submission, setSubmission] = useState<ServiceFormSubmission | null>(null);

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixPayload, setPixPayload] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [openQrCodeModal, setOpenQrCodeModal] = useState(false);
  const [comprovante, setComprovante] = useState<File | null>(null); // Estado para armazenar o arquivo do comprovante
  const [status, setStatus] = useState<string>('');

  const handleChange = (event: any) => {
    setStatus(event.target.value as string);
  };

  const handleUpdateStatus = async () => {
    try {
      await apiService.putApi<ServiceFormSubmission>(`/form-answers/status/${id}`, { status });
      fetchServices();
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Failed to fetch servicesSubmitions:', error);
      toast.error('Erro ao buscar serviços enviados. Tente novamente mais tarde.');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await apiService.getApi<ServiceFormSubmission>(`/form-answers/${id}`);
      setSubmission(response);
      setStatus(response.status.toLocaleLowerCase());
    } catch (error) {
      console.error('Failed to fetch servicesSubmitions:', error);
      toast.error('Erro ao buscar serviços enviados. Tente novamente mais tarde.');
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleReject = async (data: any) => {
    try {
      await apiService.putApi<ServiceFormSubmission>(`/form-answers/${id}`, { invalids_answers: data });
      fetchServices();
      toast.success('Serviço rejeitado com sucesso!');
    } catch (error) {
      console.error('Failed to fetch servicesSubmitions:', error);
      toast.error('Erro ao buscar serviços enviados. Tente novamente mais tarde.');
    }
  };

  const handleEditFields = async (data: any) => {
    try {
      await apiService.putApi<ServiceFormSubmission>(`/form-answers/edit/${id}`, { updated_answers: data });
      fetchServices();
      toast.success('Correções feitas com sucesso!');
    } catch (error) {
      console.error('Failed to fetch servicesSubmitions:', error);
      toast.error('Erro ao enviar correções. Tente novamente mais tarde.');
    }
  };

  const handleApproveForm = async () => {
    try {
      await apiService.putApi<ServiceFormSubmission>(`/form-answers/approve/${id}`);
      fetchServices();
      toast.success('Serviço aprovado com sucesso!');
    } catch (error) {
      console.error('Failed to fetch servicesSubmitions:', error);
      toast.error('Erro ao aprovar serviço. Tente novamente mais tarde.');
    }
  };

  const handleCopyPayload = () => {
    toast.success('PIX copiado para a área de transferência!');
    if (pixPayload) navigator.clipboard.writeText(pixPayload);
  };

  const handleGenerateQrCode = async () => {
    if (submission?.pix_key) {
      setPixPayload(submission?.pix_key);
      setPaymentStatus('pending');
      setOpenQrCodeModal(true);
      return;
    }
    try {
      if (!submission?.price) {
        toast.error('Erro ao gerar o QR code de pagamento! Tente novamente mais tarde.');
        return;
      }
      const response = await apiService.postApi<{ cobranca: any; qrCode: any }>('/cobranca/pix', {
        valor: submission?.price,
        descricao: 'Pagamento de Processamento de serviço',
        serviceId: parseInt(id),
      });
      setQrCode(response.qrCode.encodedImage);
      setPixPayload(response.qrCode.payload);
      setPaymentStatus('pending');
      setOpenQrCodeModal(true);
    } catch (error) {
      toast.error('Ocorreu um Erro ao gerar o QR code de pagamento! Tente novamente mais tarde.');
    }
  };

  const handleConfirmPayment = async () => {
    if (!comprovante) {
      toast.error('Por favor, anexe o comprovante de pagamento.');
      return;
    }

    const formData = new FormData();
    formData.append('comprovante', comprovante);
    formData.append('id', id?.toString() || '');

    try {
      const response: any = await apiService.postApi('/cobranca/comprovante?type=service', formData);
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
          const statusResponse = await apiService.getApi<{ status: string }>(`/cobranca/pix/status/${id}?type=service`);
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
  }, [qrCode, paymentStatus, id]);

  const hasInvalidFields = submission?.answers?.some((field) => field.invalid_reason);

  const allowedPaymentStatus =
    user?.role !== 2
      ? ['aguardando pagamento', 'pagamento confirmado']
      : ['aguardando pagamento', 'pagamento confirmado', 'Aguardando confirmação do envio'];

  return (
    <Stack spacing={3}>
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
              {submission?.pix_key && (
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
      {((user?.role === 1 && submission && submission.status === 'Aguardando aprovação do pagamento') ||
        (user?.role === 2 &&
          submission &&
          submission.status === 'Aguardando confirmação do pagamento' &&
          submission.affiliate_id)) && (
        <Stack sx={{ mb: 3 }}>
          {submission.group_payment_total ? (
            <Card sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between' }} variant="outlined">
              <Box display="flex" alignItems="center">
                <CurrencyDollar size={40} weight="fill" color="#ff9800" style={{ marginRight: '16px' }} />
                <Box>
                  <Typography variant="h6" sx={{ color: '#ff9800' }}>
                    Pagamento feito agrupado. Valor total de todos os itens:
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(submission.group_payment_total * 100)}
                  </Typography>
                </Box>
              </Box>
              <SeeComprovante
                id={submission.id.toString()}
                type="service"
                src={submission.comprovanteUrl}
                group_payment_id={submission.group_payment_id}
              />
            </Card>
          ) : (
            <Card sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between' }} variant="outlined">
              <Box display="flex" alignItems="center">
                <Typography variant="h6">
                  Para confirmar e aprovar o pagamento do serviço, veja o comprovante:
                </Typography>
              </Box>
              <SeeComprovante
                type="service"
                id={submission.id.toString()}
                src={submission.comprovanteUrl}
                group_payment_id={submission.group_payment_id}
              />
            </Card>
          )}
        </Stack>
      )}
      {user?.role === 1 && submission && (
        <Card
          sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          variant="outlined"
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', flexShrink: 0 }}>
            Selecione o status desse Serviço:
          </Typography>
          <Stack direction="row" spacing={2}>
            <Select
              id="status"
              name="status"
              value={status}
              onChange={handleChange}
              sx={{ minWidth: 250, maxWidth: 300, flexShrink: 0 }}
            >
              <MenuItem value="" disabled>
                Selecione o status
              </MenuItem>
              {StatusMap.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              color="primary"
              sx={{ ml: 2, flexShrink: 0 }}
              onClick={handleUpdateStatus}
              disabled={!status || submission?.status.toLocaleLowerCase() === status}
            >
              Atualizar
            </Button>
          </Stack>
        </Card>
      )}

      <Stack direction="column" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Serviços de numero: {submission?.protocol} </Typography>
          </Stack>
          <Alert severity="info">
            <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
              Serviço criado em {formatDate(submission?.created_at)}
            </Typography>
          </Alert>

          {user?.role === 3 && hasInvalidFields && (
            <Alert severity="error">
              Existem campos inválidos no formulário. Por favor, corrija os erros antes de continuar o processo.
            </Alert>
          )}
        </Stack>

        {/* Novo Card de Informações */}
        {submission && (
          <Grid container spacing={3}>
            <Grid item xl={4} xs={12} md={6} lg={4} sx={{ height: '100%' }}>
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center">
                    <CurrencyDollar size={80} weight="fill" color="#ff9800" style={{ marginRight: '16px' }} />
                    <Stack>
                      <Typography variant="h6" sx={{ color: '#ff9800' }}>
                        Custo total do Formulario
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, mb: 4, ml: 2 }}>
                        {formatCurrency(submission.price * 100)}
                      </Typography>
                    </Stack>
                  </Box>
                  {allowedPaymentStatus.includes(submission?.status?.toLocaleLowerCase()) && (
                    <Box>
                      <Button
                        onClick={handleGenerateQrCode}
                        sx={{
                          backgroundColor: '#4caf50',
                          borderRadius: 2,
                          p: 2,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': { backgroundColor: '#388e3c' },
                          mt: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="h6" sx={{ color: '#ffffff' }}>
                            Clique para Pagar
                          </Typography>
                        </Box>
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={8}>
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    📄 Detalhes do Formulario
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={4}>
                      <InfoItem label="Protocolo" value={submission.protocol} icon="🆔" />
                      <InfoItem
                        label="Status"
                        value={submission.status}
                        icon="📌"
                        valueStyle={{
                          color: submission.status === 'Aprovado' ? '#2e7d32' : '#d32f2f',
                          fontWeight: 'bold',
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                      <InfoItem label="Usuário" value={submission.user.username || 'N/A'} icon="👤" />
                      <InfoItem label="Documento" value={submission.user.document || 'N/A'} icon="📃" />
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                      <InfoItem label="Formulário" value={submission.serviceForm.name} icon="📋" />
                      <InfoItem
                        label="Data de Criação"
                        value={new Date(submission.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                        icon="📅"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {submission?.status === 'Aguardando confirmação do envio' && user?.role === 2 && (
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Alert severity="info">
                <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
                  Para subir esse serviçõ do afiliado, favor pagar e anexar o comprovante
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        )}

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }} gutterBottom>
            Respostas do Formulario
          </Typography>
          {submission?.answers && (
            <GeneratedForm
              canReject={user?.role === 1 && submission.status === 'Pagamento aprovado'}
              formFields={submission.answers.map((fields) => ({
                ...fields.formField,
                id: fields.id,
                answer: fields.answer,
                invalid_reason: fields.invalid_reason,
              }))}
              handleFormSubmit={handleEditFields}
              formSubmitButtonName="Salvar"
              handleResetParentState={() => {}}
              handleReject={handleReject}
              HandleApprove={
                user?.role === 1 &&
                (submission.status === 'Pagamento aprovado' || submission.status === 'Aguardando aprovação')
                  ? handleApproveForm
                  : undefined
              }
              renderOnly={
                submission.status !== 'aguardando pagamento' &&
                submission.status !== 'Formulario Reprovado' &&
                submission.status !== 'Aguardando aprovação'
              }
            />
          )}
        </Card>
      </Stack>
    </Stack>
  );
}

// Componente auxiliar para itens de informação
const InfoItem = ({
  label,
  value,
  icon,
  valueStyle,
}: {
  label: string;
  value: string | number;
  icon: string;
  valueStyle?: React.CSSProperties;
}) => (
  <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'baseline' }}>
    <Typography variant="body2" sx={{ minWidth: 24 }}>
      {icon}
    </Typography>
    <Stack>
      <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500, ...valueStyle }}>
        {value}
      </Typography>
    </Stack>
  </Stack>
);
