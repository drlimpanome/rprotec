'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { ApiService } from '@/services/ApiServices';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { ProcessPrazos } from '@/types/prazos';
import { ServiceFilters } from '@/components/dashboard/logistic/logistic-filters';
import { PrazosTable } from '@/components/dashboard/prazos/prazos-table';

const apiService = new ApiService();

export default function Page(): React.JSX.Element {
  const [services, setServices] = useState<ProcessPrazos[]>([]);
  const [serviceFilters, setServiceFilters] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItensRows, setTotal] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editService, setEditService] = useState<ProcessPrazos | null>(null);
  const [tipoData, setTipoData] = useState<string>('no_prazo'); // State for selected tipoData

  // Handle tab change for tipoData
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTipoData(newValue);
    setPage(0); // Reset to first page when tab changes
  };

  // Fetch services from the API whenever the page, rowsPerPage, or tipoData changes
  const fetchServices = async () => {
    try {
      const response = await apiService.getApi<{ prazos: ProcessPrazos[]; totalItens: number }>(
        '/pastaprocesso/all/prazos/processos', // Endpoint to fetch services
        {
          page: page + 1, // API might expect 1-based page index
          limit: rowsPerPage,
          tipoData, // Add tipoData to the query
        }
      );
      setServices(response.prazos);
      setTotal(response.totalItens); // Set the total number of items
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, rowsPerPage, tipoData]); // Refetch whenever page, rowsPerPage, or tipoData changes

  // Handle opening the form in create mode
  const handleOpenCreateForm = () => {
    setFormMode('create');
    setEditService(null); // No service for edit in create mode
    setOpenForm(true);
  };

  // Handle opening the form in edit mode
  const handleOpenEditForm = (service: ProcessPrazos) => {
    setFormMode('edit');
    setEditService(service); // Set the service to be edited
    setOpenForm(true);
  };

  // Handle page change
  const handlePageChange = (event: any, newPage: number) => {
    setPage(newPage); // Update page state
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Update rows per page
    setPage(0); // Reset page to 0 when rows per page changes
  };

  const filteredServices = services.filter((service) =>
    service.parte_cliente?.toLowerCase().includes(serviceFilters.toLowerCase())
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Publicações</Typography>
        </Stack>
        <div>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={handleOpenCreateForm}
          >
            Adicionar
          </Button>
        </div>
      </Stack>

      {/* Tabs for selecting tipoData */}
      <Tabs value={tipoData} onChange={handleTabChange} aria-label="prazo-tabs">
        <Tab label="Dentro do Prazo" value="no_prazo" />
        <Tab label="Prazo Restrito (D-2)" value="d-2" />
        <Tab label="Prazo Fatal (D-1)" value="d-1" />
        <Tab label="Prazo Fatalíssimo (D-0)" value="d-0" />
      </Tabs>

      <ServiceFilters setClientFilters={setServiceFilters} />
      <PrazosTable
        count={totalItensRows} // Total number of rows in the database (not just filteredServices.length)
        page={page}
        rows={filteredServices} // Pass filtered services here
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleOpenEditForm}
      />

      {/* Form Component for both create and edit 
      <ServiceFormComponent
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        mode={formMode}
        initialData={editService} // Pass the data when editing
      />*/}
    </Stack>
  );
}
