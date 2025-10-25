'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { ApiService } from '@/services/ApiServices';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { toast } from 'react-toastify';

import { ServiceFormSubmission } from '@/types/service_answers';
import { useUser } from '@/hooks/use-user';
import { ServiceFilters } from '@/components/dashboard/logistic/logistic-filters';
import { ServicesTable } from '@/components/services/ServicesTable';

const apiService = new ApiService();

export default function Page(): React.JSX.Element {
  const { user } = useUser();

  // Estados para controle das abas
  const [tabIndex, setTabIndex] = useState(0);
  const isAffiliateTab = tabIndex === 1; // Se estiver na segunda aba, precisa adicionar type=affiliate

  const [servicesSubmitions, setServices] = useState<ServiceFormSubmission[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItensRows, setTotal] = useState(0);
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [affiliateFilter, setAffiliateFilter] = useState('');

  const [affiliates, setAffiliates] = useState<{ id: number; username: string }[]>([]);

  const fetchAffiliates = async () => {
    try {
      const response: any = await apiService.getApi('/client/affiliates');
      setAffiliates(response.customers);
    } catch (error) {
      console.error('Failed to fetch affiliates:', error);
    }
  };

  // Fetch servicesSubmitions from the API whenever the page, rowsPerPage, or filters change
  const fetchServices = async () => {
    try {
      const response = await apiService.getApi<{
        services: ServiceFormSubmission[];
        totalPages: number;
        totalItens: number;
      }>(`/form-answers${isAffiliateTab ? '?type=affiliate' : ''}`, {
        page: page + 1, // API might expect 1-based page index
        limit: rowsPerPage,
        clientFilter,
        statusFilter,
        affiliateFilter,
      });

      setServices(response.services);
      setTotal(response.totalItens);
    } catch (error) {
      console.error('Failed to fetch servicesSubmitions:', error);
      toast.error('Erro ao buscar serviços enviados. Tente novamente mais tarde.');
    }
  };

  useEffect(() => {
    fetchServices();
    fetchAffiliates();
  }, [tabIndex, page, rowsPerPage]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
    setPage(0); // Reset page ao trocar de aba
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

  // Handle filter changes
  const handleClientFilterChange = (value: string) => {
    setClientFilter(value);
    setPage(0); // Reset page to 0 when filter changes
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(0); // Reset page to 0 when filter changes
  };

  const handleAffiliateFilterChange = (value: string) => {
    setAffiliateFilter(value);
    setPage(0); // Reset page to 0 when filter changes
  };

  return (
    <Stack spacing={3}>
      {user?.role === 2 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Serviços Tabs">
            <Tab label="Serviços Enviados" value={0} />
            <Tab label="Serviços de Afiliados" value={1} />
          </Tabs>
        </Box>
      )}

      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">{isAffiliateTab ? 'Serviços de Afiliados' : 'Serviços Enviados'}</Typography>
        </Stack>
      </Stack>

      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <ServiceFilters
          setClientFilters={handleClientFilterChange}
          setStatusFilter={handleStatusFilterChange}
          setAffiliateFilter={handleAffiliateFilterChange}
          sendData={fetchServices}
          role={user?.role}
          affiliates={affiliates}
        />
      </Stack>

      <ServicesTable
        count={totalItensRows} // Total number of rows in the database (not just filteredServices.length)
        page={page}
        rows={servicesSubmitions} // Pass filtered servicesSubmitions here
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={() => {}}
        fetchData={fetchServices}
      />
    </Stack>
  );
}
