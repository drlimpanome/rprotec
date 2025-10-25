'use client';

import * as React from 'react';
import dayjs from '@/utils/dayjs-config';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import * as icon from '@phosphor-icons/react';

export interface HomeListGroup {
  id: number;
  name?: string | null;
  expires_at: string; // ISO
}

type Props = {
  grouping: HomeListGroup | null;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export default function NextGroupingCard({ grouping }: Props) {
  const now = dayjs();
  const expires = grouping?.expires_at ? dayjs(grouping.expires_at) : null;

  const totalMs = expires ? expires.diff(now, 'millisecond') : 0;
  // fallback para 48h como base de cálculo visual (não precisa ser exato, é lúdico)
  const baseMs = 48 * 60 * 60 * 1000;
  const progress = expires ? clamp(100 - (totalMs / baseMs) * 100) : 100;
  const label =
    expires && expires.isAfter(now)
      ? expires.fromNow() // ex.: "em 2 dias"
      : 'encerrado';

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        p: 1.5,
        bgcolor: (t) => (t.palette.mode === 'light' ? '#F7F9FF' : t.palette.background.paper),
        backgroundImage:
          'radial-gradient(120px 50px at 100% 0%, rgba(255,200,0,0.15), transparent), radial-gradient(120px 50px at 0% 100%, rgba(120,180,255,0.15), transparent)',
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
          <Avatar
            sx={{
              bgcolor: '#FFD76B',
              color: '#5B4100',
              width: 56,
              height: 56,
              boxShadow: 2,
              fontSize: 24,
            }}
          >
            🧩
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
              Próximo agrupamento
            </Typography>
            <Stack direction="row" spacing={1} mt={0.5}>
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                icon={<icon.Trophy size={16} />}
                label={grouping ? grouping.name ?? `#${grouping.id}` : '—'}
                sx={{ borderRadius: 2 }}
              />
              <Chip
                size="small"
                variant="outlined"
                icon={<icon.ClockCountdown size={16} />}
                label={expires ? dayjs(expires).format('DD/MM HH:mm') : '—'}
                sx={{ borderRadius: 2 }}
              />
            </Stack>
          </Box>
        </Stack>

        {/* Barra de progresso lúdica */}
        <Box mt={2}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {expires ? 'Contagem' : 'Status'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 12,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
              },
            }}
          />
        </Box>

        {/* Ações minimalistas */}
        <Stack direction="row" spacing={1} mt={2}>
          <Tooltip title="Ver detalhes do agrupamento">
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<icon.ArrowRight size={16} />}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
              onClick={() => {
                // router.push('/groups'); // opcional
              }}
            >
              Detalhes
            </Button>
          </Tooltip>

          <Tooltip title="Regras e prazos">
            <Button
              size="small"
              variant="outlined"
              startIcon={<icon.Question size={16} />}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
              onClick={() => {
                // abrir modal de ajuda (opcional)
              }}
            >
              Ajuda
            </Button>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}
