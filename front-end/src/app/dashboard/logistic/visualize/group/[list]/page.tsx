'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ApiService } from '@/services/ApiServices';
import { handleDownloadListGroupNamesInfo } from '@/utils/excelUtils';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { CalendarBlank, ClipboardText, CurrencyDollar, Download, Users } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import { ListGroupData, ListStatus } from '@/types/list';
import GroupedListReview from '@/components/dashboard/logistic/GroupedListReview';

const apiService = new ApiService();

export default function ProtocolPage(): React.JSX.Element {
  const { list } = useParams();
  const [groupData, setGroupData] = useState<ListGroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<ListStatus[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ListStatus | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (list) {
          const response = await apiService.getApi<ListGroupData>(`/list-groups/${list}`);
          setGroupData(response);
          setSelectedStatuses(response.statusHistory.length > 0 ? response.statusHistory.map((x) => x.status) : []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [list]);

  const openDialog = (status: ListStatus) => {
    setPendingStatus(status);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setPendingStatus(null);
    setDialogOpen(false);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;

    try {
      await apiService.putApi(`/list-groups/${list}`, {
        status: pendingStatus,
        updateListsStatus: true,
      });
      const isSelected = selectedStatuses.includes(pendingStatus);
      const newSelectedStatuses = isSelected
        ? selectedStatuses.filter((s) => s !== pendingStatus)
        : [...selectedStatuses, pendingStatus];
      setSelectedStatuses(newSelectedStatuses);
      toast.success('Status do grupo e listas atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar o status, tente novamente.');
      setSelectedStatuses(groupData?.status ? [groupData.status] : []);
    } finally {
      closeDialog();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando dados...</Typography>
      </Box>
    );
  }

  if (!groupData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Erro ao carregar os dados.</Typography>
      </Box>
    );
  }

  const totalNames = groupData.lists.reduce((sum, list) => sum + list.listData.length, 0);
  const totalLists = groupData.lists.length;
  const totalValue = groupData.lists.reduce(
    (sum, list) => sum + list.listData.length * (list.client?.price_consult || 0),
    0
  );

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'space-between' }}>
        <Stack>
          <Typography variant="h4" gutterBottom>
            <strong>{groupData.name}</strong>
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
            <CalendarBlank size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Data de Expiração: {dayjs(groupData.expires_at).format('MMM D, YYYY')}
          </Typography>
        </Stack>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ ml: 2, height: '50%', alignSelf: 'flex-end' }}
            onClick={() => handleDownloadListGroupNamesInfo(groupData.lists)}
            startIcon={<Download />}
          >
            Exportar Planilha
          </Button>
        </div>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Status Checkbox Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.primary' }}>
          Status do Grupo
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {['decisão judicial', 'spc', 'boa vista', 'cenprot sp', 'cenprot br', 'quod', 'serasa', 'finalizada'].map(
            (status) => (
              <Grid item xs={6} md={4} key={status}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: selectedStatuses.includes(status as ListStatus) ? 'primary.light' : 'grey.100',
                    borderRadius: 1,
                    p: 1.5,
                    transition: 'background-color 0.3s ease',
                    boxShadow: selectedStatuses.includes(status as ListStatus)
                      ? '0 4px 8px rgba(0, 0, 0, 0.2)'
                      : '0 2px 5px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedStatuses.includes(status as ListStatus)}
                        onChange={() => openDialog(status as ListStatus)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: selectedStatuses.includes(status as ListStatus) ? 'primary.dark' : 'text.secondary',
                        }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Box>
              </Grid>
            )
          )}
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Summary Section */}
      <Card
        sx={{ my: 3, p: 2, borderRadius: 3, backgroundColor: '#ffffff', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)' }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumo do Agrupamento
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <Box display="flex" alignItems="center">
                <Users size={24} style={{ marginRight: '8px' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Total de Nomes:
                </Typography>
              </Box>
              <Typography variant="h5" color="primary" sx={{ ml: 3 }}>
                {totalNames}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Box display="flex" alignItems="center">
                <ClipboardText size={24} style={{ marginRight: '8px' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Total de Listas:
                </Typography>
              </Box>
              <Typography variant="h5" color="primary" sx={{ ml: 3 }}>
                {totalLists}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Box display="flex" alignItems="center">
                <CurrencyDollar size={24} style={{ marginRight: '8px' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Valor Total:
                </Typography>
              </Box>
              <Typography variant="h5" color="primary" sx={{ ml: 3 }}>
                R$ {totalValue.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Grouped List Review */}
      <GroupedListReview groupData={groupData} />

      {/* Dialog for Confirmation */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Confirmar Alteração de Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja atualizar o status para: <strong>{pendingStatus}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="secondary">
            Não
          </Button>
          <Button onClick={confirmStatusChange} color="primary" autoFocus>
            Sim
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restante do conteúdo */}
    </Box>
  );
}
