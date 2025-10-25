'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/services/ApiServices';
import dayjs from '@/utils/dayjs-config';
import { formatCurrencyNoRound } from '@/utils/formaters';
import { Box, Card, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { BarChart, PieChart } from '@mui/x-charts';
import { LineChart } from '@mui/x-charts/LineChart';
import { CurrencyCircleDollar } from '@phosphor-icons/react/dist/ssr';

import { useUser } from '@/hooks/use-user';
import { ExportReportButton } from '@/components/core/ExportReportButton';
import { Filters } from '@/components/core/stepperComponents/dashboardFIlters';
import { CardInfos } from '@/components/dashboard/overview/cardInfos';
import { MultipleCard } from '@/components/dashboard/overview/multipleCardInfo';

const apiService = new ApiService();

interface totalizersData {
  totalNames: number;
  uniqueClients: number;
  totalRevenue: number;
  totalClients: number;
  nextMontRevenue: number;
  nextMontIncrease: number;
}

interface MonthlyData {
  [month: string]: {
    newPartnersCount: number;
    notSendingCount: number;
    revenueIncreasePercentage: number;
  };
}

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const router = useRouter();
  const [totalizersInfo, setTotalizersInfo] = React.useState<totalizersData>({
    totalNames: 0,
    uniqueClients: 0,
    totalRevenue: 0,
    totalClients: 0,
    nextMontRevenue: 0,
    nextMontIncrease: 0,
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const [totalPendingAmount, setTotalPendingAmount] = React.useState<number>(0);
  const [totalProcessedAmount, setTotalProcessedAmount] = React.useState<number>(0);
  const [monthlyData, setMonthlyData] = React.useState<number[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [filters, setFilters] = React.useState<{
    clientId: number | null;
    startDate: Date | null;
    endDate: Date | null;
  }>({
    clientId: null,
    startDate: null,
    endDate: null,
  });

  const [monthlyChartData, setMonthlyChartData] = React.useState<MonthlyData | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, totalizersResponse, monthlyResponse] = await Promise.all([
        apiService.getApi<{ lists: { lists: any[]; totalItems: number }; clients: any[] }>('/dashboard', {
          page: 'all',
          clientId: filters.clientId || undefined,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
        }),
        apiService.getApi<totalizersData>('/dashboard/totalizers', {
          clientId: filters.clientId || undefined,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
        }),
        apiService.getApi<MonthlyData>('/dashboard/monthly'),
      ]);

      setTotalizersInfo(totalizersResponse);
      processLists(dashboardResponse.lists.lists);
      setClients(dashboardResponse.clients);
      setMonthlyChartData(monthlyResponse);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const hasFetched = React.useRef(false); // Ref para impedir a chamada dupla na montagem

  React.useEffect(() => {
    if (user?.role === 1 && !loading && !hasFetched.current) {
      fetchDashboardData();
      hasFetched.current = true; // Impede nova chamada na montagem
    }
  }, [filters]);

  const processLists = (lists: any[]) => {
    let pendingAmount = 0;
    let processedAmount = 0;
    const currentYear = dayjs().year();
    const monthCounts = Array(12).fill(0);

    lists.forEach((list) => {
      const listMonth = dayjs(list.creationDate).month();
      const listYear = dayjs(list.creationDate).year();
      const listLength = list.listData.length;
      const priceConsult = list.client?.price_consult || 0;

      if (list.status === 'aguardando pagamento') {
        pendingAmount += priceConsult * listLength;
      } else {
        processedAmount += priceConsult * listLength;
      }

      if (listYear === currentYear) {
        monthCounts[listMonth] += 1;
      }
    });

    setTotalPendingAmount(pendingAmount);
    setTotalProcessedAmount(processedAmount);
    setMonthlyData(monthCounts);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Preparando dados para o gráfico com 3 linhas no mesmo chart
  const lineChartData = React.useMemo(() => {
    if (!monthlyChartData) return null;
    const months = Object.keys(monthlyChartData);

    // Cada array abaixo terá a ordem dos meses mapeada pela posição
    const newPartnersValues = months.map((month) => monthlyChartData[month].newPartnersCount);
    const notSendingValues = months.map((month) => monthlyChartData[month].notSendingCount);
    const revenueIncreaseValues = months.map((month) => monthlyChartData[month].revenueIncreasePercentage);

    return { months, newPartnersValues, notSendingValues, revenueIncreaseValues };
  }, [monthlyChartData]);

  const thisMonth = dayjs().month();

  if (user?.role !== 1 && router) {
    router.push('/dashboard/logistic/visualize');
  }

  return (
    <>
      {user?.role === 1 ? (
        <Grid container spacing={3}>
          <Grid lg={11.5} sm={11.5} xs={11.5}>
            <ExportReportButton
              totalizersInfo={totalizersInfo}
              totalPendingAmount={totalPendingAmount}
              totalProcessedAmount={totalProcessedAmount}
              monthlyChartData={monthlyChartData}
            />
          </Grid>
          <Grid lg={11.5} sm={12} xs={12}>
            <Filters clients={clients} onFilter={handleFilterChange} />
          </Grid>
          <Grid container spacing={2} lg={9}>
            <Grid lg={3} sm={4} xs={12}>
              <CardInfos
                trend={totalPendingAmount > 0 ? 'up' : 'down'}
                value={totalizersInfo.totalNames}
                title="Quantidade de nomes"
                subtitle="Valores a receber"
                icon={<CurrencyCircleDollar fontSize="var(--icon-fontSize-lg)" />}
              />
            </Grid>
            <Grid lg={4} sm={4} xs={12}>
              <CardInfos
                trend={totalProcessedAmount > 0 ? 'up' : 'down'}
                value={formatCurrencyNoRound(totalizersInfo.totalRevenue)}
                title="Faturamento"
                subtitle="Valores recebidos"
                icon={<CurrencyCircleDollar fontSize="var(--icon-fontSize-lg)" />}
              />
            </Grid>
            <Grid lg={4} sm={4} xs={12}>
              <CardInfos
                trend={totalProcessedAmount > 0 ? 'up' : 'down'}
                value={totalizersInfo.uniqueClients}
                title="Parceiros que enviaram"
                subtitle="Valores recebidos"
                icon={<CurrencyCircleDollar fontSize="var(--icon-fontSize-lg)" />}
              />
            </Grid>
            <Grid lg={12} sm={12} xs={12} sx={{ width: '100%' }}>
              {lineChartData && (
                <Card 
                  className="animate-fade-in"
                  sx={{ 
                    mt: 2, 
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 183, 197, 0.2)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '1px solid rgba(0, 225, 194, 0.4)',
                      boxShadow: '0 8px 24px rgba(0, 225, 194, 0.15)',
                    }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      background: 'linear-gradient(90deg, #1a0b44 0%, #003677 50%, #0060a0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                    }}
                  >
                    Indicadores Mensais
                  </Typography>
                  <LineChart
                    height={200}
                    series={[
                      { data: lineChartData.newPartnersValues, color: '#00e1c2' },
                      { data: lineChartData.notSendingValues, color: '#008bbb' },
                      { data: lineChartData.revenueIncreaseValues, color: '#1a0b44' },
                    ]}
                    xAxis={[{ data: lineChartData.months, scaleType: 'band' }]}
                    yAxis={[{ scaleType: 'linear' }]}
                    grid={{ horizontal: false, vertical: false }}
                    sx={{ backgroundColor: 'transparent' }}
                    margin={{ top: 20, bottom: 20, left: 40, right: 20 }}
                  />
                </Card>
              )}
            </Grid>
          </Grid>
          <Grid lg={2.5} sm={12} xs={12}>
            <MultipleCard
              sx={{ height: '100%', mb: 2 }}
              trend={totalProcessedAmount > 0 ? 'up' : 'down'}
              value={totalizersInfo}
              icon={<CurrencyCircleDollar fontSize="var(--icon-fontSize-lg)" />}
            />
          </Grid>
          <Grid lg={6} sm={12} xs={12}>
            {lineChartData && (
              <Card 
                className="animate-fade-in"
                sx={{ 
                  p: 3, 
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 183, 197, 0.2)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '1px solid rgba(0, 225, 194, 0.4)',
                    boxShadow: '0 8px 24px rgba(0, 225, 194, 0.15)',
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    background: 'linear-gradient(90deg, #1a0b44 0%, #003677 50%, #0060a0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  Indicadores
                </Typography>
                <PieChart
                  height={200}
                  series={[
                    {
                      data: [
                        {
                          value: lineChartData.newPartnersValues[thisMonth],
                          color: '#00e1c2',
                          label: 'Novos Parceiros',
                        },
                        {
                          value: lineChartData.notSendingValues[thisMonth],
                          color: '#008bbb',
                          label: 'Parceiros não enviaram',
                        },
                        {
                          value: lineChartData.revenueIncreaseValues[thisMonth],
                          color: '#1a0b44',
                          label: 'Aumento de Faturamento',
                        },
                      ],
                      innerRadius: 35,
                      cx: 100,
                    },
                  ]}
                  xAxis={[{ data: lineChartData.months, scaleType: 'band' }]}
                  yAxis={[{ scaleType: 'linear' }]}
                  sx={{ backgroundColor: 'transparent' }}
                  margin={{ top: 20, bottom: 20, right: 100 }}
                />
              </Card>
            )}
          </Grid>
          <Grid lg={5.5} sm={12} xs={12}>
            {lineChartData && (
              <Card 
                className="animate-fade-in"
                sx={{ 
                  p: 3, 
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 183, 197, 0.2)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '1px solid rgba(0, 225, 194, 0.4)',
                    boxShadow: '0 8px 24px rgba(0, 225, 194, 0.15)',
                  }
                }}
              >
                <BarChart
                  height={200}
                  series={[
                    { data: lineChartData.newPartnersValues, color: '#00e1c2' },
                    { data: lineChartData.notSendingValues, color: '#008bbb' },
                    { data: lineChartData.revenueIncreaseValues, color: '#1a0b44' },
                  ]}
                  xAxis={[{ data: lineChartData.months, scaleType: 'band' }]}
                  yAxis={[{ scaleType: 'linear' }]}
                  grid={{ horizontal: false, vertical: false }}
                  sx={{ backgroundColor: 'transparent' }}
                  margin={{ top: 20, bottom: 20, left: 40, right: 20 }}
                />
              </Card>
            )}
          </Grid>
        </Grid>
      ) : (
        <></>
      )}
    </>
  );
}
