// Page.tsx

'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/services/ApiServices';
import { Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr';

import { ListGroupData, ReviewData } from '@/types/list';
import { useUser } from '@/hooks/use-user';
import { ServiceFilters } from '@/components/dashboard/logistic/logistic-filters';
import { ServiceTable } from '@/components/dashboard/logistic/logistic-table';
import { AppBreadcrumbs } from '@/components/core/AppBreadcrumbs';

const apiService = new ApiService();

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>(''); // New status filter state
  const [affiliateFilter, setAffiliateFilter] = useState<string>(''); // New status filter state
  const [serviceFilters, setServiceFilters] = useState<string>('');

  const [services, setServices] = useState<ReviewData[]>([]);
  const [listGroups, setListGroups] = useState<ListGroupData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalItensRows, setTotal] = useState(0);
  const [affiliates, setAffiliates] = useState<{ id: number; username: string }[]>([]);
  const [affliatesLists, setAffliatesLists] = useState<ReviewData[]>([]);
  const [responsibleFilter, setResponsibleFilter] = useState<string[]>();
  const [responsible, setResponsible] = useState<string>();
  const [allResponsibles, setAllResponsibles] = useState<Set<string>>(new Set());

  const fetchAffiliates = async () => {
    try {
      const response: any = await apiService.getApi('/client/affiliates');
      setAffiliates(response.customers);
    } catch (error) {
      console.error('Failed to fetch affiliates:', error);
    }
  };

  // Fetch data based on the selected tab
  const fetchData = async () => {
    try {
      if (tabIndex === 0) {
        const response = await apiService.getApi<{ services: ReviewData[]; totalItens: number }>('/list', {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter,
          protocol: serviceFilters,
          affiliate: affiliateFilter,
          responsible: responsible,
        });
        // Acumula novos responsáveis
        const newResponsibles = response.services.map((s) => s.client?.responsible).filter(Boolean);
        setAllResponsibles((prev: any) => new Set([...prev, ...newResponsibles]));

        setServices(response.services);
        setTotal(response.totalItens);
      } else if (tabIndex === 1) {
        if (user?.role === 1) {
          const response = await apiService.getApi<ListGroupData[]>('/list-groups', {
            listDetails: 1,
            status: statusFilter,
          });
          setListGroups(response);
        } else if (user?.role === 2) {
          const response = await apiService.getApi<{ services: ReviewData[]; totalItens: number }>(
            '/list?type=affiliate',
            {
              page: page + 1,
              limit: rowsPerPage,
              status: statusFilter,
              protocol: serviceFilters,
              affiliate: affiliateFilter,
            }
          );
          setAffliatesLists(response.services);
          setTotal(response.totalItens);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAffiliates();
  }, [tabIndex, page, rowsPerPage, statusFilter]);

  const handleTabChange = (event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
    setPage(0); // Reset pagination when switching tabs
  };

  const handleOpenCreateForm = () => {
    router.push('/dashboard/logistic/create');
  };

  const handlePageChange = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack spacing={2}>
      <AppBreadcrumbs 
        items={[
          { label: 'Ver listas' }
        ]}
      />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          aria-label="Listas Tabs"
          sx={{ minHeight: '42px', '& .MuiTab-root': { minHeight: '42px', py: 1 } }}
        >
          <Tab label={`Listas${user?.role === 2 || user?.role === 3 ? ' enviadas' : ' individuais'}`} />
          {user?.role === 1 && <Tab label="Agrupamento de Listas" />}
          {user?.role === 2 && <Tab label="Listas de afiliados" />}
        </Tabs>
      </Box>

      <TabPanel value={tabIndex} index={0}>
        <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
          <Stack spacing={0} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{`Todas as listas${user?.role === 2 || user?.role === 3 ? ' enviadas' : ' individuais'}`}</Typography>
          </Stack>
          <Button
            startIcon={<PlusIcon fontSize="18px" />}
            variant="contained"
            onClick={handleOpenCreateForm}
            sx={{ px: 2.5, py: 0.75, minHeight: '36px' }}
          >
            Adicionar
          </Button>
        </Stack>
        <ServiceFilters
          setClientFilters={setServiceFilters}
          setStatusFilter={setStatusFilter}
          sendData={fetchData}
          affiliates={affiliates}
          setAffiliateFilter={setAffiliateFilter}
          role={user?.role}
          responsibleFilter={Array.from(allResponsibles)}
          setResponsible={setResponsible}
        />
        <ServiceTable
          count={totalItensRows}
          page={page}
          rows={services}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={() => {}}
          fetchData={fetchData}
        />
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        {user?.role === 1 && (
          <>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Agrupamento de Listas
            </Typography>
            <ServiceFilters setClientFilters={() => {}} setStatusFilter={setStatusFilter} group />
            <ServiceTable
              count={listGroups.length}
              page={page}
              rows={listGroups}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              isListGroup={true}
              fetchData={fetchData}
            />
          </>
        )}
        {user?.role === 2 && (
          <>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Listas dos afiliados
            </Typography>
            <ServiceFilters setClientFilters={() => {}} setStatusFilter={setStatusFilter} group />
            <ServiceTable
              count={affliatesLists.length}
              page={page}
              rows={affliatesLists}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              fetchData={fetchData}
            />
          </>
        )}
      </TabPanel>
    </Stack>
  );
}

// Tab Panel Component
function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}
