import * as React from 'react';
import { Button, Card, Grid, InputAdornment, MenuItem, OutlinedInput, Select, Typography } from '@mui/material';
import { FunnelSimple } from '@phosphor-icons/react';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

interface ServiceFiltersProps {
  setClientFilters: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setAffiliateFilter?: (value: string) => void;
  group?: boolean;
  affiliates?: { id: number; username: string }[];
  sendData?: () => void;
  role?: number;
  responsibleFilter?: string[];
  setResponsible?: (value: string) => void;
}

export function ServiceFilters({
  setClientFilters,
  setStatusFilter,
  setAffiliateFilter,
  group,
  sendData,
  affiliates,
  role,
  responsibleFilter,
  setResponsible,
}: ServiceFiltersProps): React.JSX.Element {
  const handleStatusChange = (event: any) => {
    setStatusFilter(event.target.value as string);
  };
  const handleAffiliateChange = (event: any) => {
    if (setAffiliateFilter) setAffiliateFilter(event.target.value as string);
  };

  const handleResponsibleChange = (event: any) => {
    if (setResponsible) setResponsible(event.target.value as string);
  };

  return (
    <Card sx={{ p: 1.5, mb: 2 }}>
      <Grid container spacing={1.5}>
        {!group && (
          <Grid item xs={12} md={4}>
            <OutlinedInput
              fullWidth
              size="small"
              onChange={(event): void => setClientFilters(event.target.value)}
              placeholder="Filtrar lista por Protocolo"
              startAdornment={
                <InputAdornment position="start">
                  <MagnifyingGlassIcon fontSize="18px" />
                </InputAdornment>
              }
            />
          </Grid>
        )}

        {role !== 3 && (
          <>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                size="small"
                displayEmpty
                defaultValue=""
                onChange={(e) => handleAffiliateChange(e)}
                sx={{ maxWidth: '500px' }}
              >
                <MenuItem value="">
                  <em>Filtrar por Afiliado</em>
                </MenuItem>
                {affiliates?.map((affiliate) => (
                  <MenuItem key={affiliate.id} value={affiliate.id}>
                    {affiliate.username}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                size="small"
                displayEmpty
                defaultValue=""
                onChange={(e) => handleResponsibleChange(e)}
                sx={{ maxWidth: '500px' }}
              >
                <MenuItem value="">
                  <em>Filtrar por Responsavel</em>
                </MenuItem>
                {responsibleFilter?.map((responsible, index) => (
                  <MenuItem key={`responsible-${index}`} value={responsible}>
                    {responsible}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </>
        )}
        <Grid item xs={12} md={4}>
          <Select
            fullWidth
            size="small"
            displayEmpty
            defaultValue=""
            onChange={(e) => handleStatusChange(e)}
            sx={{ maxWidth: '500px' }}
          >
            <MenuItem value="">
              <em>Filtrar por Status</em>
            </MenuItem>
            <MenuItem value="aguardando pagamento">Aguardando Pagamento</MenuItem>
            <MenuItem value="em analise">Em Análise</MenuItem>
            <MenuItem value="pagamento aprovado">Pagamento Aprovado</MenuItem>
            <MenuItem value="finalizada">Finalizada</MenuItem>
            <MenuItem value="erro">Erro</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
            <MenuItem value="aguardando protocolar">Aguardando Protocolar</MenuItem>
            <MenuItem value="decisão judicial">Decisão Judicial</MenuItem>
            <MenuItem value="spc">SPC</MenuItem>
            <MenuItem value="boa vista">Boa Vista</MenuItem>
            <MenuItem value="cenprot sp">Cenprot SP</MenuItem>
            <MenuItem value="cenprot br">Cenprot BR</MenuItem>
            <MenuItem value="quod">Quod</MenuItem>
            <MenuItem value="serasa">Serasa</MenuItem>
            <MenuItem value="aprovado">Aprovado</MenuItem>
            <MenuItem value="Formulario Reprovado">Formulario Reprovado</MenuItem>
            <MenuItem value="Aguardando confirmação do pagamento">Aguardando confirmação do pagamento</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            startIcon={<FunnelSimple fontSize="18px" />}
            variant="contained"
            size="small"
            onClick={sendData}
            sx={{
              width: '100%',
              height: '100%',
              minHeight: '36px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textTransform: 'none',
            }}
          >
            Filtrar
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
