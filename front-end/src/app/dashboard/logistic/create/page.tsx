'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/services/ApiServices';
import dayjs from '@/utils/dayjs-config';
import { Box, Card, Typography } from '@mui/material';
import { toast } from 'react-toastify';

import { ReviewData } from '@/types/list';
import { useUser } from '@/hooks/use-user';
import ReviewPage from '@/components/dashboard/logistic/review-page';
import { AppBreadcrumbs } from '@/components/core/AppBreadcrumbs';

const apiService = new ApiService();

const CreateNewService = () => {
  const { user } = useUser();
  const [isReview, setIsReview] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [nearestGroup, setNearestGroup] = useState<{ id: number; expires_at: string } | null>(null);
  const router = useRouter();

  // Fetch the nearest list group on component mount
  useEffect(() => {
    const fetchNearestGroup = async () => {
      try {
        const response = await apiService.getApi<{ id: number; expires_at: string }>('/list-groups/nearest');
        setNearestGroup(response);
      } catch (error) {
        setNearestGroup(null); // No group available for this period
      }
    };

    fetchNearestGroup();
  }, []);

  // Handle the list creation confirmation
  const handleConfirm = async (data: ReviewData) => {
    try {
      const { protocol } = await apiService.postApi<{ id: number; message: string; protocol: string }>('/list', {
        ...data,
        list_group_id: nearestGroup ? nearestGroup.id : null, // Pass null if no group is available
      });

      toast.success(`Lista cadastrada com sucesso! Número de protocolo: ${protocol}`);
      router.push(`/dashboard/logistic/visualize/${protocol}`);
    } catch (error) {
      toast.error('Erro ao cadastrar, tente novamente.');
    }
  };

  const handleCancel = () => {
    setIsReview(false);
  };

  return (
    <Box>
      <AppBreadcrumbs 
        items={[
          { label: 'Enviar Lista' }
        ]}
      />
      {user?.role !== 1 && (
        <>
          {nearestGroup ? (
            <>
              <Card
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  maxWidth: '800px',
                  mx: 'auto',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Data de Processamento da Lista
                </Typography>
                <Typography variant="body1">
                  Esta lista será processada até: <strong>{dayjs(nearestGroup.expires_at).format('DD/MM/YYYY')}</strong>
                </Typography>
              </Card>

              {user?.services.some((x: any) => x.service_id == 1) ? (
                <ReviewPage
                  data={formData}
                  currentUser={{
                    id: '1',
                    username: 'John doe',
                    email: 'johndoe@email.com',
                    UserInfo: {
                      phone: '(31)97412-3123',
                    },
                  }}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                />
              ) : (
                <Card
                  sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: 'warning.light',
                    color: 'warning.contrastText',
                    maxWidth: '800px',
                    mx: 'auto',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Acesso ainda não liberado ao envio de listas
                  </Typography>
                  <Typography variant="body1">
                    Favor contatar o suporte para solicitar o acesso ao envio de listas.
                  </Typography>
                </Card>
              )}
            </>
          ) : (
            <Card
              sx={{
                p: 3,
                mb: 3,
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Sem previsão de processamento
              </Typography>
              <Typography variant="body1">
                Atualmente, não há uma data de processamento prevista para esta lista. A lista será enviada sem um
                agrupamento associado.
              </Typography>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default CreateNewService;
