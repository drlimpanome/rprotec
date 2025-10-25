import * as React from 'react';
import { useState } from 'react';
import { ApiService } from '@/services/ApiServices';
import dayjs from '@/utils/dayjs-config';
import {
  Box,
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
import { Pen } from '@phosphor-icons/react';

import { User } from '@/types/user';

const apiService = new ApiService();

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
  onPageChange: any;
  onRowsPerPageChange?: any;
  onEdit?: any;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 25,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
}: CustomersTableProps): React.JSX.Element {
  const [localRows, setLocalRows] = useState<User[]>(rows);

  React.useEffect(() => {
    setLocalRows(rows); // Atualiza localRows quando rows é alterado pelo pai
  }, [rows]);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    onPageChange(event, newPage);
  };

  const toggleActiveStatus = async (customerId: string) => {
    try {
      await apiService.putApi(`/client/${customerId}/toggle-status`);
      setLocalRows((prevRows) =>
        prevRows.map((row) => (row.id === customerId ? { ...row, active: !row.active } : row))
      );
    } catch (error) {
      console.error('Erro ao atualizar status do cliente:', error);
    }
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Data de Cadastro</TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell>Editar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {localRows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>
                  <Typography variant="subtitle2">{row.username}</Typography>
                </TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{dayjs(row.created_at).format('MMM D, YYYY')}</TableCell>
                <TableCell>
                  <Checkbox checked={row.active} onChange={() => toggleActiveStatus(row.id)} color="primary" />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit?.(row)} aria-label="edit">
                    <Pen type="bold" size={32} />
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
        rowsPerPageOptions={[25, 50, 100]}
      />
    </Card>
  );
}
