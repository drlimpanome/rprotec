'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { InputField } from '@/app/services/page';
import { ApiService } from '@/services/ApiServices';
import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';

import GeneratedForm from '@/components/services/GeneratedForm';
import { useUser } from '@/hooks/use-user';

const apiService = new ApiService();

interface Service {
  id: number;
  name: string;
  saved: boolean;
  service_id: number;
  cost: number;
  service: {
    id: number;
    name: string;
    servicesForm: {
      id: number;
      name: string;
      formFields: InputField[];
    }[];
  };
}

interface ServiceState {
  id: number;
  name: string;
  saved: boolean;
  formFields: InputField[];
  service_id: number;
  price: number;
  serviceForm_id: number;
}

export default function ServiceManagement(): React.JSX.Element {
  const { user } = useUser();
  const [existingServices, setExistingServices] = React.useState<ServiceState[]>([]);
  const [openForms, setOpenForms] = React.useState<{ [key: number]: boolean }>({});
  const router = useRouter();

  // Check if user has permission to access this page (only role 3)
  if (user && user.role !== 3) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Erro 404</Typography>
        <Typography>Página não encontrada ou você não tem permissão para acessá-la.</Typography>
      </Stack>
    );
  }

  const fetchServices = async () => {
    try {
      const response = await apiService.getApi<Service[]>('/services/page/geral?affiliate=true');
      const fetchedServices = response
        .filter((id) => id.id !== 1)
        .map((service) => ({
          id: service.id,
          name: service.service.name,
          saved: true,
          formFields: service.service.servicesForm[0].formFields,
          service_id: service.service_id,
          serviceForm_id: service.service.servicesForm[0].id,
          price: service.cost,
        }));
      setExistingServices(fetchedServices);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  React.useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveFormService = async (
    answers: Record<string, any>,
    form_id: number,
    service_id: number,
    price: number
  ) => {
    try {
      const formData = new FormData();

      // Adicionando os valores primários
      formData.append('form_id', form_id.toString());
      formData.append('service_id', service_id.toString());
      formData.append('price', price.toString());

      // Criar um objeto para armazenar os valores que NÃO são arquivos
      const textAnswers: Record<string, string> = {};

      // Iterando sobre answers corretamente
      Object.entries(answers).forEach(([key, value]) => {
        if (value instanceof File) {
          // Se for arquivo, adiciona ao FormData diretamente com ID correto
          formData.append(`files[${key}]`, value, value.name);
        } else if (typeof value === 'string' || typeof value === 'number') {
          // Se for string ou número, adiciona ao objeto de respostas textuais
          textAnswers[key] = value.toString();
        } else {
          console.warn(`⚠️ Tipo desconhecido ignorado para key: ${key}`, value);
        }
      });

      // Converte as respostas textuais para JSON e adiciona ao FormData
      formData.append('text_answers', JSON.stringify(textAnswers));

      const response: any = await apiService.postApi(`/form-answers`, formData);
      fetchServices();
      toast.success('Formulário salvo com sucesso!');
      router.push(`/dashboard/services/${response.id}`);
    } catch (error) {
      console.error('❌ Erro ao salvar serviço:', error);
      toast.error('Erro ao salvar serviço. Tente novamente mais tarde.');
    }
  };

  const toggleFormVisibility = (id: number) => {
    setOpenForms((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <>
      <Stack spacing={3}>
        <Typography variant="h4">Cadastramento de Serviços</Typography>
        {existingServices.length === 0 && (
          <Card sx={{ mb: 2, justifyContent: 'space-between' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Nenhuma servico cadastrado
              </Typography>
              <Alert severity="info">
                Peça para seu patrocinador, cadastrar os serviços. que voce gostaria de contratar
              </Alert>
            </CardContent>
          </Card>
        )}
        {existingServices.map((service) => (
          <Card key={`existing-service-${service.id}`} sx={{ mb: 2, justifyContent: 'space-between' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center" sx={{ justifyContent: 'space-between', display: 'flex' }}>
                <Grid item xs={8}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {service.name} - R$ {service.price}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => toggleFormVisibility(service.id)}
                  >
                    {openForms[service.id] ? 'Cancelar' : 'Cadastrar'}
                  </Button>
                </Grid>
              </Grid>
              {openForms[service.id] && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Formulário de cadastro
                  </Typography>
                  <GeneratedForm
                    formFields={service.formFields}
                    handleFormSubmit={(fields) =>
                      handleSaveFormService(fields, service.serviceForm_id, service.service_id, service.price)
                    }
                    formSubmitButtonName="Salvar"
                    handleResetParentState={() => toggleFormVisibility(service.id)}
                  />
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}
