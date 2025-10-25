'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import dayjs from '@/utils/dayjs-config';
import {
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import * as icon from '@phosphor-icons/react';

export interface SlimListItem {
  id: number;
  protocol?: string | number; // ✅ novo: protocolo para roteamento
  price: number | null;
  names_quantity: number | null;
  created_at?: string;
  creation_date?: string;
  client?: {
    username: string;
  };
}

type Props = {
  items: SlimListItem[];
  adminView?: boolean;
};

const fmtBRL = (v?: number | null) =>
  typeof v === 'number' ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';

const getWhen = (it: SlimListItem) => it.created_at ?? it.creation_date ?? '';
const getProtocol = (it: SlimListItem) => (it.protocol ?? it.id)?.toString();

export default function SlimLists({ items, adminView }: Props) {
  const router = useRouter();

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ pt: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <icon.ListBullets size={22} />
          <Typography variant="subtitle1" fontWeight={700}>
            {adminView ? 'Listas recebidas' : 'Minhas listas'}
          </Typography>
        </Stack>

        <List disablePadding>
          {items?.length ? (
            items.map((it, idx) => {
              const protocol = getProtocol(it);

              return (
                <React.Fragment key={`${it.id}-${protocol}`}>
                  <ListItem
                    onClick={() => router.push(`/dashboard/logistic/visualize/${encodeURIComponent(protocol)}`)}
                    sx={{
                      px: 1,
                      py: 1.25,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'background-color .15s ease, transform .1s ease',
                      '&:hover': {
                        bgcolor: (t) => t.palette.action.hover,
                      },
                      '&:active': {
                        transform: 'translateY(1px)',
                      },
                    }}
                    aria-label={`Abrir lista ${protocol}`}
                  >
                    {/* quem enviou */}
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Tooltip title={adminView ? 'Quem enviou' : 'Você'}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <icon.UserCircle size={20} />
                        </Box>
                      </Tooltip>
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{
                        variant: 'body1',
                        fontWeight: 700, // ✅ maior e mais forte
                        sx: { fontSize: '1rem' }, // ✅ aumenta fonte
                      }}
                      primary={adminView ? it.client?.username ?? '—' : 'Você'}
                      sx={{ maxWidth: { xs: '25%', md: '20%' } }}
                    />

                    {/* valor */}
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Tooltip title="Valor da lista">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <icon.CurrencyDollar size={20} />
                        </Box>
                      </Tooltip>
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{
                        variant: 'body1',
                        sx: { fontSize: '1rem' }, // ✅ maior
                      }}
                      primary={fmtBRL(it.price ?? 0)}
                      sx={{ maxWidth: { xs: '25%', md: '20%' } }}
                    />

                    {/* data */}
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Tooltip title="Data">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <icon.CalendarBlank size={20} />
                        </Box>
                      </Tooltip>
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{
                        variant: 'body1',
                        sx: { fontSize: '0.98rem' }, // ✅ um tico menor que valor/quem
                      }}
                      primary={getWhen(it) ? dayjs(getWhen(it)).format('DD/MM/YYYY HH:mm') : '—'}
                      sx={{ maxWidth: { xs: '30%', md: '25%' } }}
                    />

                    {/* # nomes */}
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Tooltip title="Qtde de nomes">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <icon.UsersThree size={20} />
                        </Box>
                      </Tooltip>
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{
                        variant: 'body1',
                        fontWeight: 700, // ✅ destaque
                        sx: { fontSize: '1rem' }, // ✅ maior
                      }}
                      primary={it.names_quantity ?? 0}
                      sx={{ maxWidth: { xs: '20%', md: '15%' } }}
                    />
                  </ListItem>

                  {idx < items.length - 1 && <Divider sx={{ mx: 1 }} />}
                </React.Fragment>
              );
            })
          ) : (
            <Box py={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Nenhuma lista encontrada.
              </Typography>
            </Box>
          )}
        </List>
      </CardContent>
    </Card>
  );
}
