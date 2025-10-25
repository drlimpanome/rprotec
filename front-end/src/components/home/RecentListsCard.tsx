'use client';

import * as React from 'react';
import dayjs from '@/utils/dayjs-config';
import { Avatar, Box, Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import * as icon from '@phosphor-icons/react';

export interface HomeListItem {
  id: number;
  client_id: number;
  names_quantity: number | null;
  price: number | null;
  created_at?: string;
  creation_date?: string;
  client?: {
    id: number;
    username: string;
    email: string;
  };
}

type Props = {
  items: HomeListItem[];
  adminView?: boolean;
  onOpenAll?: () => void;
};

const pastel = [
  '#FFEE93', // amarelo
  '#A0E7E5', // ciano
  '#B4F8C8', // verde
  '#FBE7C6', // pêssego
  '#E7C6FF', // lilás
];

const getWhen = (it: HomeListItem) => it.created_at ?? it.creation_date ?? '';

export default function RecentListsCard({ items, adminView, onOpenAll }: Props) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        p: 1.5,
        boxShadow: 3,
        bgcolor: (t) => (t.palette.mode === 'light' ? '#FFFDF7' : t.palette.background.paper),
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{
                bgcolor: '#B4F8C8',
                color: '#004D40',
                width: 48,
                height: 48,
                fontSize: 22,
                boxShadow: 2,
              }}
            >
              📦
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                {adminView ? 'Listas recebidas' : 'Minhas últimas listas'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                mais recentes
              </Typography>
            </Box>
          </Stack>

          <Tooltip title="Ver todas as listas">
            <IconButton size="small" onClick={onOpenAll} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
              <icon.ArrowRight size={18} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Carrossel horizontal de mini-cards */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.25,
            overflowX: 'auto',
            py: 1,
            px: 0.5,
            scrollSnapType: 'x mandatory',
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(0,0,0,0.2)',
              borderRadius: 999,
            },
          }}
        >
          {(items ?? []).slice(0, 10).map((it, idx) => (
            <Box
              key={it.id}
              sx={{
                minWidth: 180,
                maxWidth: 200,
                flex: '0 0 auto',
                p: 1.25,
                borderRadius: 3,
                bgcolor: pastel[idx % pastel.length],
                boxShadow: 2,
                scrollSnapAlign: 'start',
                transition: 'transform .15s ease, box-shadow .15s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    sx={{
                      bgcolor: 'white',
                      color: 'black',
                      width: 36,
                      height: 36,
                      boxShadow: 1,
                    }}
                  >
                    <icon.ListMagnifyingGlass size={18} />
                  </Avatar>
                  <Typography fontWeight={800}>#{it.id}</Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    size="small"
                    icon={<icon.UsersThree size={14} />}
                    label={`${it.names_quantity ?? 0}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}
                  />
                  <Chip
                    size="small"
                    icon={<icon.CurrencyDollar size={14} />}
                    label={(it.price ?? 0).toLocaleString('pt-BR')}
                    sx={{ bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}
                  />
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {getWhen(it) ? dayjs(getWhen(it)).fromNow() : '—'}
                </Typography>

                {adminView && it.client?.username && (
                  <Chip
                    size="small"
                    icon={<icon.User size={14} />}
                    label={it.client.username}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.8)',
                      borderRadius: 2,
                      maxWidth: '100%',
                    }}
                  />
                )}
              </Stack>
            </Box>
          ))}

          {!items?.length && (
            <Box
              sx={{
                minWidth: 220,
                p: 2,
                borderRadius: 3,
                bgcolor: '#F1F5F9',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 1,
              }}
            >
              <Typography variant="body2">Nada por aqui… crie sua primeira lista! 🎈</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
