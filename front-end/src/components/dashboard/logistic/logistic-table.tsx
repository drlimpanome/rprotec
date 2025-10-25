import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiService } from '@/services/ApiServices';
import dayjs from '@/utils/dayjs-config';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Pen, User } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

import { ListGroupData, ReviewData } from '@/types/list';
import { useUser } from '@/hooks/use-user';
import { PayDialog } from '@/components/core/Pay-dialog';

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: ReviewData[] | ListGroupData[];
  rowsPerPage?: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit?: (service: ReviewData) => void;
  isListGroup?: boolean;
  fetchData: () => void; // Para atualizar a tabela após pagamento
}

export function ServiceTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 100,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  isListGroup = false,
  fetchData,
}: CustomersTableProps): React.JSX.Element {
  const { user } = useUser();
  const apiService = new ApiService();
  const [selectedLists, setSelectedLists] = useState<any>(new Set());

  // Estados para o modal de pagamento
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [pixPayload, setPixPayload] = useState<string | undefined>(undefined);
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);

  // Simulação de API para gerar QR Code e Pix Payload
  const generatePaymentInfo = async () => {
    if (selectedLists.size === 0) return;

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
    const selectedIds = Array.from(selectedLists);

    const formData = new FormData();
    formData.append('comprovante', comprovante);
    formData.append('id', JSON.stringify(selectedIds)); // Enviar como JSON

    const response = await apiService.postApi('/cobranca/comprovante?type=list', formData);

    if (response) {
      toast.success('Comprovante enviado com sucesso! Aguarde a confirmação do pagamento.');
      setOpenPayDialog(false);
      setSelectedLists(new Set()); // Resetar seleção após pagamento
      fetchData(); // Atualiza a tabela
    } else {
      console.error('Erro ao confirmar pagamento');
    }
  };

  const allowedPaymentStatus =
    user?.role !== 2 ? ['aguardando pagamento'] : ['aguardando pagamento', 'Aguardando confirmação do envio'];

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.filter((row: any) => allowedPaymentStatus.includes(row.status)).map((row) => row.id);
      setSelectedLists(new Set(newSelecteds));
    } else {
      setSelectedLists(new Set());
    }
  };

  const handleSelectOne = (event: any, id: any) => {
    const newSelectedLists = new Set(selectedLists);
    if (event.target.checked) {
      newSelectedLists.add(id);
    } else {
      newSelectedLists.delete(id);
    }
    setSelectedLists(newSelectedLists);
  };

  useEffect(() => {
    let total = 0;
    selectedLists.forEach((id: string) => {
      const list = rows.find((row: any) => row.id === id);
      if (list) {
        total += list.price || 0; // Verifica se há um preço na lista
      }
    });
    setTotalPrice(total);
  }, [selectedLists, rows]);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    onPageChange(event, newPage);
  };

  return (
    <>
      <Card>
        {user?.role !== 1 && (
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }} justifyContent={'space-between'} display={'flex'} alignItems={'center'}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Selecione as listas para Pagar</Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={selectedLists.size === 0}
              onClick={generatePaymentInfo}
              sx={{ px: 2.5, py: 0.75 }}
            >
              Pagar listas
            </Button>
          </Box>
        )}
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }} size="small">
            <TableHead>
              <TableRow>
                {user?.role !== 1 && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedLists.size > 0 && selectedLists.size < rows.length}
                      checked={rows.length > 0 && selectedLists.size === rows.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}
                {user?.role === 1 && <TableCell>Nome {isListGroup ? 'do Agrupamento' : 'do Cliente'}</TableCell>}
                {isListGroup ? (
                  <>
                    <TableCell>Número de Listas</TableCell>
                    <TableCell>Data de Expiração</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Editar</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Nº de Protocolo</TableCell>
                    <TableCell>Data de Cadastro</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Quantidade de nomes</TableCell>
                    <TableCell>Responsavel</TableCell>
                    <TableCell>Editar</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isListGroup
                ? (rows as ListGroupData[]).map((group) => (
                    <TableRow hover key={group.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{group.name}</Typography>
                      </TableCell>
                      <TableCell>{group.lists?.length}</TableCell>
                      <TableCell>{group.expires_at ? dayjs(group.expires_at).format('MMM D, YYYY') : 'N/A'}</TableCell>
                      <TableCell sx={{ width: '15%' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.4,
                            borderRadius: 0.75,
                            backgroundColor: statusColors[group.status.toLowerCase()] || '#BDBDBD',
                            color: '#FFFFFF',
                            fontSize: 11,
                            fontWeight: 500,
                            textAlign: 'center',
                            width: '100%',
                          }}
                        >
                          {group.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/logistic/visualize/group/${group.id}`} passHref>
                          <Box
                            component="span"
                            sx={{
                              color: 'black',
                              display: 'inline-flex',
                              alignItems: 'center',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              '&:hover': {
                                color: 'primary.main',
                              },
                            }}
                          >
                            <Pen size={20} weight="fill" />
                          </Box>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                : (rows as ReviewData[]).map((row) => (
                    <TableRow hover key={row.id} selected={selectedLists.has(row.id)}>
                      {user?.role !== 1 && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedLists.has(row.id)}
                            onChange={(event) => handleSelectOne(event, row.id)}
                            disabled={!allowedPaymentStatus.includes(row.status)}
                          />
                        </TableCell>
                      )}
                      {user?.role === 1 && (
                        <TableCell>
                          <Typography variant="subtitle2">{row.client?.name}</Typography>
                        </TableCell>
                      )}
                      <TableCell>{row.protocol}</TableCell>
                      <TableCell>{dayjs(row.creationDate).format('MMM D, YYYY')}</TableCell>
                      <TableCell sx={{ width: '15%' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.4,
                            borderRadius: 0.75,
                            backgroundColor: statusColors[row.status?.toLowerCase()] || '#BDBDBD',
                            color: '#FFFFFF',
                            fontSize: 11,
                            fontWeight: 500,
                            textAlign: 'center',
                            width: '100%',
                          }}
                        >
                          {row.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography>{row.listData?.length}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{row.client?.responsible}</Typography>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/logistic/visualize/${row.protocol}`} passHref>
                          <Box
                            component="span"
                            sx={{
                              color: 'black',
                              display: 'inline-flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                              '&:hover': {
                                color: 'primary.main',
                              },
                            }}
                          >
                            <Pen size={20} weight="fill" />
                          </Box>
                        </Link>
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
          rowsPerPageOptions={[100, 150]}
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
        totalPrice={totalPrice}
      />
    </>
  );
}

export const statusColors: Record<string, string> = {
  'formulario reprovado': '#EF5350',
  'aguardando pagamento': '#008BBB',
  'aguardando confirmação do envio': '#0060A0',
  'aguardando aprovação': '#00B7C5',
  'em analise': '#0060A0',
  'pagamento aprovado': '#1a0b44',
  'pagamento confirmado': '#1a0b44',
  aprovado: '#00E1C2',
  finalizada: '#00B7C5',
  erro: '#EF5350',
  cancelada: '#6c757d',
  'aguardando confirmação do pagamento': '#008BBB',
  'aguardando aprovação do pagamento': '#008BBB',
  'pagamento aprovado afiliado': '#1a0b44',
  'aguardando protocolar': '#0060A0',
  'decisão judicial': '#EF5350',
  spc: '#00B7C5',
  'boa vista': '#00E1C2',
  'cenprot sp': '#0060A0',
  'cenprot br': '#6c757d',
  quod: '#008BBB',
  serasa: '#00E1C2',
};
