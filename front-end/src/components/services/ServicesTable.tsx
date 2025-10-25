import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/services/ApiServices';
import dayjs from '@/utils/dayjs-config';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Eye } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

import { ServiceFormSubmission } from '@/types/service_answers';
import { useUser } from '@/hooks/use-user';

import { PayDialog } from '../core/Pay-dialog';
import { statusColors } from '../dashboard/logistic/logistic-table';

interface ServicesTableProps {
  count?: number;
  page?: number;
  rows?: ServiceFormSubmission[];
  rowsPerPage?: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit?: (id: string) => void;
  fetchData: () => void;
}

export function ServicesTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  fetchData,
}: ServicesTableProps): React.JSX.Element {
  const { user } = useUser();
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<any>(new Set());
  const apiService = new ApiService();

  // Estados para o modal de pagamento
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [pixPayload, setPixPayload] = useState<string | undefined>(undefined);
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [totalPriceSelectedServices, setTotalPriceSelectedServices] = useState(0);

  // Simulação de API para gerar QR Code e Pix Payload
  const generatePaymentInfo = async () => {
    if (selectedServices.size === 0) return;

    try {
      // Simulando uma chamada de API
      const response = await apiService.getApi<any>('/cobranca/generate-payment');

      if (response.pix_key) {
        setPixPayload(response.pix_key);
        setOpenPayDialog(true);
      }
    } catch (error) {
      console.error('Erro ao gerar informação de pagamento:', error);
      toast.error('Erro ao gerar informação de pagamento. Tente novamente mais tarde.');
    }
  };

  // Função para confirmar pagamento
  const handleConfirmPayment = async () => {
    if (!comprovante) return;

    // Convertendo o Set para um array de IDs
    const selectedIds = Array.from(selectedServices);

    const formData = new FormData();
    formData.append('comprovante', comprovante);
    formData.append('id', JSON.stringify(selectedIds)); // Enviar como JSON

    const response = await apiService.postApi('/cobranca/comprovante?type=service', formData);

    if (response) {
      toast.success('Comprovante enviado com sucesso! Aguarde a confirmação do pagamento.');
      setOpenPayDialog(false);
      setSelectedServices(new Set()); // Resetar seleção após pagamento
      fetchData();
    } else {
      console.error('Erro ao confirmar pagamento');
    }
  };

  const allowedPaymentStatus =
    user?.role !== 2 ? ['aguardando pagamento'] : ['aguardando pagamento', 'Aguardando confirmação do envio'];

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.filter((row: any) => allowedPaymentStatus.includes(row.status)).map((row) => row.id);
      setSelectedServices(new Set(newSelecteds));
    } else {
      setSelectedServices(new Set());
    }
  };

  const handleSelectOne = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const newSelectedServices = new Set(selectedServices);
    if (event.target.checked) {
      newSelectedServices.add(id);
    } else {
      newSelectedServices.delete(id);
    }
    setSelectedServices(newSelectedServices);
  };

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    onPageChange(event, newPage);
  };

  React.useEffect(() => {
    let total = 0;
    selectedServices.forEach((id: string) => {
      const service = rows.find((row: any) => row.id === id);
      if (service) {
        total += service.price;
      }
    });
    setTotalPriceSelectedServices(total);
  }, [selectedServices, rows]);

  return (
    <>
      <Card>
        <Box sx={{ p: 2 }} justifyContent={'space-between'} display={'flex'}>
          <Typography variant="h5">Selecione os serviços para Pagar</Typography>
          <Button
            variant="contained"
            color="primary"
            disabled={selectedServices.size === 0}
            onClick={generatePaymentInfo}
          >
            Pagar serviços
          </Button>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedServices.size > 0 && selectedServices.size < rows.length}
                    checked={rows.length > 0 && selectedServices.size === rows.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Protocolo</TableCell>
                {user?.role !== 3 && <TableCell>Cliente</TableCell>}
                <TableCell>Serviço</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Cadastro</TableCell>
                <TableCell>Visualizar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow hover key={row.id} selected={selectedServices.has(row.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedServices.has(row.id)}
                      onChange={(event) => handleSelectOne(event, row.id)}
                      disabled={!allowedPaymentStatus.includes(row.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{row.protocol}</Typography>
                  </TableCell>
                  {user?.role !== 3 && (
                    <TableCell>
                      <Typography variant="subtitle2">{row.user?.username}</Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="subtitle2">{row.serviceForm?.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ width: '15%' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: statusColors[row.status?.toLowerCase()] || '#BDBDBD',
                        color: '#FFFFFF',
                        fontSize: 12,
                        textAlign: 'center',
                        width: '100%',
                      }}
                    >
                      {row.status}
                    </Box>
                  </TableCell>
                  <TableCell>{dayjs(row.created_at).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => router.push(`/dashboard/services/${row.id}`)} aria-label="view">
                      <Eye />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={count}
          onPageChange={handlePageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          labelRowsPerPage="Linhas por página"
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      {/* Modal de Pagamento */}
      <PayDialog
        open={openPayDialog}
        pixPayload={pixPayload}
        comprovante={comprovante}
        setComprovante={setComprovante}
        onClose={() => setOpenPayDialog(false)}
        onConfirmPayment={handleConfirmPayment}
        totalPrice={totalPriceSelectedServices}
      />
    </>
  );
}
