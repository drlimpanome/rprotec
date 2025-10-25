'use client';

import { AnyTxtRecord } from 'dns';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { ApiService } from '@/services/ApiServices';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';

import { User } from '@/types/user';
import { useUser } from '@/hooks/use-user';
import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import { UserFormComponent } from '@/components/dialog/UserForm';

const apiService = new ApiService();

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const [customers, setCustomers] = useState<User[]>([]);
  const [clientFilters, setClientFilters] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'saldo'>('create');
  const [editUser, setEditUser] = useState<any | null>(null);
  const [totalItensRows, setTotal] = useState(0);

  // Check if user has permission to access this page (only role 1)
  if (user && user.role !== 1) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Erro 404</Typography>
        <Typography>Página não encontrada ou você não tem permissão para acessá-la.</Typography>
      </Stack>
    );
  }

  // Fetch customers from the API whenever the page or rowsPerPage changes
  const fetchCustomers = async () => {
    try {
      const response = await apiService.getApi<{ customers: User[]; totalPages: number; totalItens: number }>(
        '/client',
        {
          page: page + 1, // API might expect 1-based page index
          limit: rowsPerPage,
        }
      );
      setCustomers(response.customers);
      setTotalPages(response.totalPages); // Set total pages for pagination
      setTotal(response.totalItens);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage]);

  // Handle opening the form in create mode
  const handleOpenCreateForm = () => {
    setFormMode('create');
    setEditUser(null); // No user for edit in create mode
    setOpenForm(true);
  };

  // Handle opening the form in edit mode
  const handleOpenEditForm = (customer: any) => {
    setFormMode('edit');
    setEditUser(customer); // Set the user to be edited
    setOpenForm(true);
  };

  // Handle form submission
  const handleFormSubmit = async (data: FormData) => {
    try {
      if (formMode === 'create') {
        await apiService.postApi('/client', { ...data, role: 2 });
      } else if (formMode === 'edit' && editUser) {
        await apiService.putApi(`/client/${editUser.id}`, { ...data, role: 2 }); // You might need to adjust for PUT
      } else if (formMode === 'saldo' && editUser) {
        await apiService.putApi(`/client/price/${editUser.id}`, { ...data, role: 2 });
      }
      toast.success(
        `${user?.role === 1 ? 'Parceiro' : 'Afiliado'} ${formMode === 'create' ? 'Criado' : 'Editado'} com sucesso!`
      );
      fetchCustomers(); // Refresh customers after form submission
      setOpenForm(false); // Close the form after submission
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  };

  // Handle page change
  const handlePageChange = (event: any, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page changes
  };

  const filteredCustomers = customers.filter((clients) =>
    clients.username?.toLowerCase().includes(clientFilters.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <UserFormComponent
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        mode={formMode}
        initialData={editUser} // Pass the data when editing
      />
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Parceiros</Typography>
        </Stack>
        <div>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={handleOpenCreateForm}
          >
            Novo
          </Button>
        </div>
      </Stack>
      <CustomersFilters setClientFilters={setClientFilters} />
      <CustomersTable
        count={totalItensRows} // Total number of rows in the database (not just filteredCustomers.length)
        page={page}
        rows={filteredCustomers} // Pass filtered customers here
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleOpenEditForm}
      />
    </Stack>
  );
}
