'use client';

import * as React from 'react';
import dayjs from '@/utils/dayjs-config';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Eye } from '@phosphor-icons/react';

import 'dayjs/locale/pt-br';

import { ProcessPrazos } from '@/types/prazos';

dayjs.locale('pt-br');

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: ProcessPrazos[];
  rowsPerPage?: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit?: (process: ProcessPrazos) => void;
}

export function PrazosTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
}: CustomersTableProps): React.JSX.Element {
  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    onPageChange(event, newPage);
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Nº Processo</TableCell>
              <TableCell>Prazo Final</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Area de Atuação</TableCell>
              <TableCell>Prazo em Dias</TableCell>
              <TableCell>Ver Avaliação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>{row.numero_processo}</TableCell>
                <TableCell>{dayjs(row.cumprimento_prazo, 'DD/MM/YYYY').format('D [de] MMMM [de] YYYY')}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.area_atuacao}</TableCell>
                <TableCell>{row.legal_prazo + ' Dias'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit?.(row)} aria-label="edit">
                    <Eye type="bold" size={32} />
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
  );
}
