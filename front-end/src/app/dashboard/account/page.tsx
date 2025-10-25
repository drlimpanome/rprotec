'use client';

import * as React from 'react';
import { ApiService } from '@/services/ApiServices';
import { Alert, Card } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { toast } from 'react-toastify';

import { useUser } from '@/hooks/use-user';
import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { AccountInfo } from '@/components/dashboard/account/account-info';
import { AffiliateFeeCard } from '@/components/dashboard/account/affiliate-config-form';
import { AssasIntegrationCard } from '@/components/dashboard/account/assasIntegration-form';
import { AppBreadcrumbs } from '@/components/core/AppBreadcrumbs';

const apiService = new ApiService();

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const [affiliateFee, setAffiliateFee] = React.useState<number>(0);
  const [apikey, setApikey] = React.useState<string | undefined>();

  const saveAffiliateConfig = async (token?: string, uses_pix?: boolean, pixKey?: string) => {
    try {
      await apiService.postApi('/client/affiliate-config', {
        fee: affiliateFee,
        apikey: token,
        uses_pix: uses_pix,
        pix_key: pixKey,
      }); // */
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações de afiliados:', error);
      toast.error('Erro ao salvar configurações. Tente novamente mais tarde.');
    }
  };

  React.useEffect(() => {
    if (user?.price_consult) {
      setAffiliateFee(user.price_consult);
      setApikey(user.api_key);
    }
  }, [user]);

  return (
    <Stack spacing={3}>
      <AppBreadcrumbs 
        items={[
          { label: 'Conta' }
        ]}
      />
      <div>
        <Typography variant="h4">Perfil</Typography>
      </div>
      <Grid container spacing={3}>
        <Grid lg={4} md={6} xs={12}>
          {user && <AccountInfo user={user} />}
        </Grid>
        <Grid lg={8} md={6} xs={12}>
          {user && <AccountDetailsForm user={user} />}
        </Grid>
      </Grid>
      {user?.role == 2 && user && (
        <Card sx={{ p: 3 }}>
          <div>
            <Typography variant="h4">Configurações de Afiliados</Typography>
          </div>
          <AffiliateFeeCard
            link={`https://rpro.tec.br/auth/sign-up?affiliate=mmvi.consultoria.vc@gmail.com`}//${user.email}
            service="Consulta"
            cost={affiliateFee}
            onCostChange={(newCost) => setAffiliateFee(newCost)}
            onSave={() => saveAffiliateConfig()}
          />
        </Card>
      )}
      {user?.role === 1 && user && (
        <Card sx={{ p: 3 }}>
          <div>
            <Typography variant="h4">Configurações de Integração para Pagamento</Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Ao selecionar uma das opções, a outra é automaticamente invalidada. Ou seja, selecione entre receber os
              pagamentos via chave pix ou integração com a assas
            </Alert>
          </div>
          <AssasIntegrationCard
            apikey={apikey}
            onSave={saveAffiliateConfig}
            uses_pix={user.uses_pix}
            pix_key={user.pix_key}
          />
        </Card>
      )}
    </Stack>
  );
}
