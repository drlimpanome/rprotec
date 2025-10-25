'use client';

import * as React from 'react';
import { ApiService } from '@/services/ApiServices';
import dayjs from '@/utils/dayjs-config';
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List as MUIList,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import * as icon from '@phosphor-icons/react';

import { useUser } from '@/hooks/use-user';
import NextGroupingCard from '@/components/home/NextGroupingCard';
import NextListStatCard from '@/components/home/NextListStatCard';
import RecentListsCard from '@/components/home/RecentListsCard';
import SlimLists from '@/components/home/SlimLists';

// ------------- TYPES (fortemente tipado) -------------
type Role = 1 | 2 | 3;

interface HomeListItem {
  id: number;
  client_id: number;
  names_quantity: number | null;
  price: number | null;
  created_at?: string; // se seu backend usa "created_at"
  creation_date?: string; // se seu backend usa "creation_date"
  client?: {
    id: number;
    username: string;
    email: string;
  };
}

interface HomeListGroup {
  id: number;
  name?: string | null;
  expires_at: string; // ISO
}

interface HomeSummaryPayload {
  sentListsCount: number;
  totalNamesSent: number;
  totalClients: number | null; // null se não for admin
  recentLists: HomeListItem[];
  nextListGrouping: HomeListGroup | null;
}

interface HomeSummaryResponse {
  role: Role;
  data: HomeSummaryPayload;
}

// ------------- HELPERS -------------
const isAdmin = (role?: Role) => role === 1;

const formatCurrencyBRL = (value?: number | null) =>
  typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';

const formatDate = (iso?: string) => (iso ? dayjs(iso).format('DD/MM/YYYY HH:mm') : '—');

const diffFromNow = (iso?: string) => {
  if (!iso) return '—';
  const d = dayjs(iso);
  if (d.isBefore(dayjs())) return 'encerrado';
  const days = d.diff(dayjs(), 'day');
  const hours = d.diff(dayjs().add(days, 'day'), 'hour');
  return `${days}d ${hours}h`;
};

const getListDate = (l: HomeListItem) => l.created_at ?? l.creation_date ?? '';

// ------------- UI SUBCOMPONENTS -------------
type StatCardProps = {
  title: string;
  value: string | number;
  iconEl: React.ReactNode;
  subtitle?: string;
  highlight?: 'primary' | 'success' | 'warning';
};

function StatCard({ title, value, iconEl, subtitle, highlight = 'primary' }: StatCardProps) {
  return (
    <Card 
      className="animate-fade-in"
      sx={{ 
        height: '100%', 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 183, 197, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: '1px solid rgba(0, 225, 194, 0.4)',
          boxShadow: '0 8px 24px rgba(0, 225, 194, 0.15)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Avatar
            sx={{
              bgcolor: highlight === 'primary' ? '#1a0b44' : highlight === 'success' ? '#00E1C2' : '#008BBB',
              color: 'white',
              width: 48,
              height: 48,
              boxShadow: 2,
            }}
          >
            {iconEl}
          </Avatar>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} lineHeight={1.2}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function RecentListItem({ item, isAdminView }: { item: HomeListItem; isAdminView: boolean }) {
  return (
    <ListItem
      sx={{
        px: 1,
        borderRadius: 2,
        '&:hover': { bgcolor: (t) => t.palette.action.hover },
      }}
      secondaryAction={
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            icon={<icon.UsersThree size={16} weight="fill" />}
            label={`${item.names_quantity ?? 0} nome(s)`}
            variant="outlined"
          />
          <Tooltip title="Preço total da lista">
            <Chip
              size="small"
              icon={<icon.CurrencyDollar size={16} weight="fill" />}
              label={formatCurrencyBRL(item.price ?? 0)}
              color="success"
              variant="outlined"
            />
          </Tooltip>
        </Stack>
      }
    >
      <ListItemAvatar>
        <Avatar>
          <icon.ListBullets size={20} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography fontWeight={600}>Lista #{item.id}</Typography>
            <Chip size="small" label={dayjs(getListDate(item)).fromNow()} variant="outlined" />
          </Stack>
        }
        secondary={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              Criada em {formatDate(getListDate(item))}
            </Typography>
            {isAdminView && item.client && (
              <Typography variant="body2" color="text.secondary">
                • Cliente: <strong>{item.client.username}</strong>
              </Typography>
            )}
          </Stack>
        }
      />
    </ListItem>
  );
}

// ------------- PAGE -------------
export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const api = React.useMemo(() => new ApiService(), []);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<HomeSummaryResponse | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // ajuste o endpoint se necessário
      const res = await api.getApi<HomeSummaryResponse>('/dashboard/home');
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível carregar os dados da Home.');
    } finally {
      setLoading(false);
    }
  };

  const hasFetched = React.useRef(false);
  React.useEffect(() => {
    if (!loading && !hasFetched.current) {
      fetchDashboardData();
      hasFetched.current = true;
    }
  }, []);

  const role: Role | undefined = data?.role;
  const adminView = isAdmin(role);

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Atualizar">
            <Button variant="outlined" startIcon={<icon.ArrowClockwise size={18} />} onClick={fetchDashboardData}>
              Recarregar
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      {loading && (
        <Box mb={2}>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      )}

      {/* ===== KPIs ===== */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={user?.role === 1 ? 3 : 4}>
          <StatCard
            title={adminView ? 'Listas (todas)' : 'Minhas listas enviadas'}
            value={data?.data.sentListsCount ?? '—'}
            iconEl={<icon.PaperPlaneTilt size={24} weight="fill" />}
            highlight="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={user?.role === 1 ? 3 : 4}>
          <StatCard
            title={adminView ? 'Total de nomes (geral)' : 'Total de nomes enviados'}
            value={data?.data.totalNamesSent ?? '—'}
            iconEl={<icon.AddressBook size={24} weight="fill" />}
            highlight="success"
          />
        </Grid>
        {adminView && (
          <Grid item xs={12} sm={6} md={user?.role === 1 ? 3 : 4}>
            <StatCard
              title="Clientes cadastrados"
              value={data?.data.totalClients ?? '—'}
              iconEl={<icon.UsersThree size={24} weight="fill" />}
              highlight="warning"
            />
          </Grid>
        )}{' '}
        <Grid item xs={12} sm={6} md={user?.role === 1 ? 3 : 4}>
          <NextListStatCard expiresAt={data?.data.nextListGrouping?.expires_at ?? null} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SlimLists items={data?.data.recentLists ?? []} adminView={!!(data && data.role === 1)} />
        </Grid>
      </Grid>

      {/* ===== Dica UX discreta ===== */}
      <Alert severity="info" icon={<icon.Sparkle size={20} weight="fill" />} sx={{ borderRadius: 2, mt: 1 }}>
        Dica: mantenha suas listas pequenas e frequentes para otimizar tempo de processamento e feedback.
      </Alert>
    </Container>
  );
}
