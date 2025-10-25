import * as React from 'react';
import { ApiService } from '@/services/ApiServices';
import { DialogContent, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import { NumericFormat } from 'react-number-format';

import { User } from '@/types/user';
import { useUser } from '@/hooks/use-user';

import MaskInputText from '../core/MaskInputComponent';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: User | null;
  mode: 'edit' | 'create' | 'saldo';
}

export const defaultFormData = {
  username: '',
  email: '',
  phone: '',
  phone_fixed: '',
  cep: '',
  address: '',
  role: 2,
  document: '',
  password: '',
  services: {},
  responsible: '',
};

export const UserFormComponent: React.FC<UserFormProps> = ({ open, onClose, onSubmit, initialData = null, mode }) => {
  const apiService = new ApiService();
  const { user } = useUser();
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    phone: '',
    phone_fixed: '',
    cep: '',
    address: '',
    role: 2,
    document: '',
    responsible: '',
    password: '',
    services: {} as Record<string, { checked: boolean; cost: number }>,
  });

  const [availableServices, setAvailableServices] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Fetch available services from the backend
  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const services: any = await apiService.getApi('/services');

        setAvailableServices(services.map((service: { name: string }) => service.name));
        
        // Initialize services with default cost for create mode
        if (mode === 'create') {
          const defaultServices: Record<string, { checked: boolean; cost: number }> = {};
          services.forEach((service: { name: string }) => {
            defaultServices[service.name] = { checked: false, cost: 300 };
          });
          setFormData((prevData) => ({
            ...prevData,
            services: defaultServices,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    fetchServices();
  }, [mode]);

  React.useEffect(() => {
    if (open) {
      if (mode === 'create') {
        // Initialize with empty services (will be populated with defaults)
        const emptyServices: Record<string, { checked: boolean; cost: number }> = {};
        availableServices.forEach((service) => {
          emptyServices[service] = { checked: false, cost: 300 };
        });
        
        setFormData({
          username: '',
          email: '',
          phone: '',
          phone_fixed: '',
          cep: '',
          address: '',
          role: 2,
          document: '',
          responsible: '',
          password: '',
          services: emptyServices,
        });
      } else if (initialData) {
        const userServices = initialData.services.reduce((acc: any, service) => {
          acc[service.service.name] = { checked: true, cost: service.cost };
          return acc;
        }, {});

        setFormData({
          username: initialData.username || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          phone_fixed: initialData.phone_fixed || '',
          cep: initialData.cep || '',
          address: initialData.address || '',
          role: initialData.role || 2,
          password: '',
          document: initialData.document || '',
          services: userServices,
          responsible: initialData.responsible || '',
        });
      }
    }
  }, [open, mode, initialData, availableServices]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prevData) => ({
      ...prevData,
      services: {
        ...prevData.services,
        [service]: {
          ...prevData.services[service],
          checked: !prevData.services[service]?.checked,
        },
      },
    }));
  };

  const handleServiceCostChange = (service: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      services: {
        ...prevData.services,
        [service]: {
          ...prevData.services[service],
          cost: parseFloat(value),
        },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) newErrors.username = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';

    const cleanedDocument = formData.document.replace(/\D/g, '');

    if (!cleanedDocument) {
      newErrors.document = 'Documento é obrigatório';
    } else if (
      (cleanedDocument.length === 11 && !cpf.isValid(cleanedDocument)) ||
      (cleanedDocument.length > 11 && !cnpj.isValid(cleanedDocument)) ||
      cleanedDocument.length < 11
    ) {
      newErrors.document = 'Documento inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {mode === 'edit'
          ? user?.role === 1
            ? 'Editar Cliente'
            : 'Editar Afiliado'
          : user?.role === 1
            ? 'Criar Cliente'
            : 'Criar Afiliado'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <TextField
              margin="dense"
              label="Nome Completo"
              name="username"
              fullWidth
              value={formData.username}
              onChange={handleInputChange}
              error={!!errors.username}
              helperText={errors.username}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              margin="dense"
              label="E-mail"
              name="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              margin="dense"
              id="responsible"
              label="Responsavel"
              type="responsible"
              fullWidth
              name="responsible"
              value={formData.responsible}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MaskInputText
              label="Documento (CPF/CNPJ)"
              maskType="cpf_cnpj"
              value={formData.document}
              onChange={(value: any) =>
                setFormData((prevData) => ({
                  ...prevData,
                  document: value,
                }))
              }
              fullWidth
              margin="dense"
              error={!!errors.document}
              helperText={errors.document}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MaskInputText
              label="Telefone Celular"
              maskType="telefone"
              value={formData.phone}
              onChange={(value: any) =>
                setFormData((prevData) => ({
                  ...prevData,
                  phone: value,
                }))
              }
              fullWidth
              margin="dense"
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MaskInputText
              label="Telefone Fixo"
              maskType="telefone"
              value={formData.phone_fixed}
              onChange={(value: any) =>
                setFormData((prevData) => ({
                  ...prevData,
                  phone_fixed: value,
                }))
              }
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              margin="dense"
              id="cep"
              label="CEP"
              type="text"
              fullWidth
              name="cep"
              value={formData.cep}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              id="address"
              label="Endereço"
              type="text"
              fullWidth
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              id="password"
              label="Senha"
              type="password"
              fullWidth
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </Grid>
          {availableServices.map((service) => (
            <Grid item xs={12} md={12} key={service}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{
                  marginTop: 2,
                  padding: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: '#f9f9f9',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.services[service]?.checked || false}
                      onChange={() => handleServiceToggle(service)}
                    />
                  }
                  label={service}
                />
                <NumericFormat
                  value={formData.services[service]?.cost || ''}
                  onValueChange={(values) => handleServiceCostChange(service, values.value)}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  label={`Preço para ${service}`}
                  decimalScale={2}
                  sx={{ width: '50%', alignSelf: 'flex-end' }}
                  fixedDecimalScale={true}
                  customInput={TextField}
                  margin="dense"
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Salvar Mudanças'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
