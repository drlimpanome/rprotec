'use client';

import * as React from 'react';
import ServiceBuilder, { InputField } from '@/app/services/page';
import { ApiService } from '@/services/ApiServices';
import { Box, Button, Card, CardContent, Grid, Stack, Switch, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';

import { useUser } from '@/hooks/use-user';

const apiService = new ApiService();

export interface Service {
  id: number;
  name: string;
  saved: boolean;
  servicesForm?: {
    id: number;
    name: string;
    formFields: InputField[];
    active: boolean;
  }[];
}

export default function ServiceManagement(): React.JSX.Element {
  const [existingServices, setExistingServices] = React.useState<Service[]>([]);
  const [newServices, setNewServices] = React.useState<Service[]>([]);
  const [openServiceBuilder, setOpenServiceBuilder] = React.useState<Record<number, boolean>>({});
  const { user } = useUser();

  const fetchServices = async () => {
    try {
      const response = await apiService.getApi<Service[]>('/services?admin=true');
      const fetchedServices = response.map((service) => ({
        id: service.id,
        name: service.name,
        saved: true,
        servicesForm: service.servicesForm,
      }));
      setExistingServices(fetchedServices);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  React.useEffect(() => {
    fetchServices();
  }, []);

  const addNewServiceRow = () => {
    setNewServices([...newServices, { id: Math.random(), name: '', saved: false }]);
  };

  const handleExistingServiceChange = (id: number, value: string) => {
    setExistingServices((prevServices) =>
      prevServices.map((service) => (service.id === id ? { ...service, name: value, saved: false } : service))
    );
  };

  const handleNewServiceChange = (id: number, value: string) => {
    setNewServices((prevServices) =>
      prevServices.map((service) => (service.id === id ? { ...service, name: value } : service))
    );
  };

  const handleSaveService = async (service: Service, isExisting: boolean) => {
    try {
      if (isExisting) {
        await apiService.putApi(`/services/${service.id}`, { name: service.name });
        setExistingServices((prevServices) =>
          prevServices.map((s) => (s.id === service.id ? { ...s, saved: true } : s))
        );
      } else {
        const response: any = await apiService.postApi('/services', { name: service.name });
        setNewServices((prevServices) =>
          prevServices.map((s) => (s.id === service.id ? { ...s, id: response.id, saved: true } : s))
        );
        setExistingServices([...existingServices, { ...service, id: response.id, saved: true }]);
        setNewServices((prevServices) => prevServices.filter((s) => s.id !== service.id));
      }
      toast.success('Serviço salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    }
  };

  const toggleServiceBuilder = (id: number) => {
    setOpenServiceBuilder((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleSaveFormService = async (name: string, service: InputField[], id: number) => {
    try {
      await apiService.putApi(`/services/form/${id}`, { name, formFields: service });

      setOpenServiceBuilder((prevState) => ({
        ...prevState,
        [id]: false,
      }));

      fetchServices();
      toast.success('Serviço salvo com sucesso!');
    } catch (error: any) {
      if (error.response?.data?.message) toast.error(error.response?.data?.message);
      else toast.error('Erro ao salvar serviço. Tente novamente mais tarde.');
    }
  };

  const toggleActiveStatus = async (formId: number, serviceId: number) => {
    try {
      const service = existingServices.find((s) => s.id === serviceId);
      if (!service) return;

      const activeForms = service.servicesForm?.filter((form: any) => form.active);

      // Impede a desativação se houver apenas um formulário ativo
      if (activeForms?.length === 1 && activeForms[0]?.id === formId) {
        toast.error('Pelo menos um formulário deve permanecer ativo.');
        return;
      }

      // Atualiza o status do formulário no backend
      const response: any = await apiService.putApi(`/services/active/${formId}`, {
        active: !service.servicesForm?.find((form) => form.id === formId)?.active,
      });

      if (response.status === 200) {
        toast.success('Status atualizado com sucesso!');
        fetchServices();
      }
    } catch (error) {
      console.error('Erro ao atualizar o status do formulário:', error);
      toast.error('Erro ao atualizar o status do formulário.');
    }
  };

  return (
    <>
      {user?.role === 1 ? (
        <Stack spacing={3}>
          <Typography variant="h4">Gerenciamento de Serviços</Typography>

          <Typography variant="h6">Serviços Existentes</Typography>
          {existingServices.map((service) => (
            <Card key={`existing-service-${service.id}`} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Nome do Serviço"
                      value={service.name}
                      onChange={(e) => handleExistingServiceChange(service.id, e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleSaveService(service, true)}
                      disabled={service.saved}
                    >
                      Salvar
                    </Button>
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      color="secondary"
                      onClick={() => toggleServiceBuilder(service.id)}
                    >
                      {openServiceBuilder[service.id] ? 'Cancelar' : 'Criar Formulário'}
                    </Button>
                  </Grid>
                </Grid>
                {openServiceBuilder[service.id] && (
                  <ServiceBuilder handleSaveService={handleSaveFormService} serviceId={service.id} />
                )}
                {!openServiceBuilder[service.id] && (service.servicesForm?.length || 0) > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                      Formulários cadastrados
                    </Typography>
                    {service.servicesForm?.map((form) => (
                      <Card key={`form-${form.id}`} sx={{ mb: 2 }}>
                        <CardContent>
                          <Grid container alignItems="center" justifyContent={'space-between'} spacing={2}>
                            <Grid item xs={8}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Nome : {form.name}
                              </Typography>
                            </Grid>
                            <Grid item xs={2} alignItems={'flex-end'}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  Ativo
                                </Typography>
                                <Switch
                                  checked={form.active}
                                  onChange={() => toggleActiveStatus(form.id, service.id)}
                                  color="primary"
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={2} alignItems={'flex-end'}>
                              <Button variant="outlined" onClick={() => toggleServiceBuilder(form.id)} color="primary">
                                {openServiceBuilder[form.id] ? 'Cancelar Edição' : 'Criar copia'}
                              </Button>
                            </Grid>
                          </Grid>
                          {openServiceBuilder[form.id] && (
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                              <ServiceBuilder
                                handleSaveService={handleSaveFormService}
                                serviceId={service.id}
                                defaultEditForm={form}
                              />
                            </Grid>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          <Typography variant="h6" sx={{ mt: 3 }}>
            Adicionar Novo Serviço
          </Typography>
          {newServices.map((service) => (
            <Card key={`new-service-${service.id}`} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Nome do Serviço"
                      value={service.name}
                      onChange={(e) => handleNewServiceChange(service.id, e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button variant="contained" color="primary" onClick={() => handleSaveService(service, false)}>
                      Salvar
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          <Button variant="outlined" onClick={addNewServiceRow}>
            Adicionar Novo Serviço
          </Button>
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Typography variant="h6">Nenhuma permissão de acesso</Typography>
        </Stack>
      )}
    </>
  );
}
