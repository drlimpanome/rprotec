'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ApiService } from '@/services/ApiServices';
import dayjs from '@/utils/dayjs-config';
import { formatCurrency } from '@/utils/formaters';
import { Box, Card, CircularProgress, Stack, Typography } from '@mui/material';
import { CurrencyDollar } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

import { ReviewData } from '@/types/list';
import { useUser } from '@/hooks/use-user';
import ApproveWithouPay from '@/components/core/approveWithouPay';
import SeeComprovante from '@/components/core/seeComprovante';
import ReviewPage from '@/components/dashboard/logistic/review-page';
import { AppBreadcrumbs } from '@/components/core/AppBreadcrumbs';

const apiService = new ApiService();

export default function ProtocolPage(): React.JSX.Element {
  const { protocol } = useParams(); // Get protocol from URL
  const { user } = useUser();

  const [listData, setListData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (protocol) {
        try {
          setLoading(true);
          const response = await apiService.getApi<ReviewData>(`/list/${protocol}`);
          setListData(response);
        } catch (error) {
          console.error('Failed to fetch service:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchServiceData();
  }, [protocol]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando dados do serviço...</Typography>
      </Box>
    );
  }

  if (!listData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Erro ao carregar os dados do serviço.</Typography>
      </Box>
    );
  }

  const handleUpdate = async (data: ReviewData) => {
    try {
      const { protocol } = await apiService.putApi<{ id: number; message: string; protocol: string }>('/list', data);
      toast.success(`Lista Atualizada com sucesso! numero de protocolo: ${protocol}`);
    } catch (error) {
      toast.error('Erro ao Atualizar, tente novamente.');
    }
  };

  // Check if the list group has an expiration date in the future
  const isWithinProcessingPeriod = listData.listGroup && dayjs().isBefore(dayjs(listData.listGroup.expires_at));

  return (
    <>
      <AppBreadcrumbs 
        items={[
          { label: 'Ver listas', href: '/dashboard/logistic/visualize' },
          { label: String(protocol || '') }
        ]}
      />
      
      <Stack sx={{ mb: 2 }}>
        {user?.role === 1 &&
          (listData.status === 'Aguardando aprovação do pagamento' || listData.status === 'aguardando pagamento') && (
            <Card sx={{ 
              p: 2, 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 183, 197, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            }} variant="outlined">
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Aprovar lista manualmente:</Typography>
              </Box>
              <ApproveWithouPay id={listData.id as any} />
            </Card>
          )}
      </Stack>
      {((user?.role === 1 && listData && listData.status === 'Aguardando aprovação do pagamento') ||
        (user?.role === 2 &&
          listData &&
          listData.status === 'Aguardando confirmação do pagamento' &&
          listData.affiliateId)) && (
        <Stack sx={{ mb: 2 }}>
          {listData.group_payment_total ? (
            <Card sx={{ 
              p: 2, 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 183, 197, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            }} variant="outlined">
              <Box display="flex" alignItems="center">
                <CurrencyDollar size={32} weight="fill" color="#008BBB" style={{ marginRight: '12px' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#008BBB', fontWeight: 600 }}>
                    Pagamento feito agrupado. Valor total de todos os itens:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(listData.group_payment_total * 100)}
                  </Typography>
                </Box>
              </Box>
              <SeeComprovante
                id={listData.id || ''}
                type="list"
                src={listData.comprovanteUrl}
                group_payment_id={listData.group_payment_id}
              />
            </Card>
          ) : (
            <Card sx={{ 
              p: 2, 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 183, 197, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            }} variant="outlined">
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Para confirmar e aprovar o pagamento da lista, veja o comprovante:</Typography>
              </Box>
              <SeeComprovante
                type="list"
                id={listData.id || ''}
                src={listData.comprovanteUrl}
                group_payment_id={listData.group_payment_id}
              />
            </Card>
          )}
        </Stack>
      )}
      {!listData.listGroup?.admin && (
        <>
          {isWithinProcessingPeriod ? (
            <Card sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText', mx: 'auto' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Data de Processamento da Lista
              </Typography>
              <Typography variant="body2">
                Esta lista será processada Dia:{' '}
                <strong>{dayjs(listData.listGroup?.expires_at).format('DD/MM/YYYY')}</strong>
              </Typography>
            </Card>
          ) : (
            <Card sx={{ p: 2, mb: 2, bgcolor: 'warning.light', color: 'warning.contrastText', mx: 'auto' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Sem previsão de processamento
              </Typography>
              <Typography variant="body2">
                Atualmente, não há uma data de processamento prevista para esta lista. A lista será enviada sem um
                agrupamento associado.
              </Typography>
            </Card>
          )}
        </>
      )}
      <ReviewPage
        data={listData}
        onConfirm={handleUpdate}
        onCancel={() => console.log('Edit canceled')}
        isEditing={true}
        currentUser={{ username: 'User1', email: 'user1@example.com', UserInfo: { phone: '123456789' } }}
      />
    </>
  );
}
