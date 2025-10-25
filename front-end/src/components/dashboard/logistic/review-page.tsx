import React, { useEffect, useState } from 'react';
import dayjs from '@/utils/dayjs-config';
import { downloadTemplate, handleFileUpload } from '@/utils/excelUtils';
import { Box, Button, Divider, IconButton, Step, StepLabel, Stepper, Tab, Tabs, Typography } from '@mui/material';
import { Download, Upload } from '@phosphor-icons/react';
import { cnpj, cpf } from 'cpf-cnpj-validator';

import { ReviewData, ReviewPageProps } from '@/types/list';
import { useUser } from '@/hooks/use-user';
import CostSummary from '@/components/core/costSummary';
import ListNameField from '@/components/core/listnamefield';
import NameListComponent from '@/components/core/nameListComponent';
import ProtocolInfo from '@/components/core/ProtocolInfo';

const defaultListName = `Lista de nomes / cpfs - ${dayjs(new Date()).format('MMM D, YYYY')}`;

const ReviewPage: React.FC<ReviewPageProps> = ({ data, onConfirm, onCancel, isEditing = false, currentUser }) => {
  const { user } = useUser();
  const costPerItem = (data?.price || 1) / (data?.names_quantity || 1);
  const initialData: ReviewData = {
    list_name: data?.list_name || defaultListName,
    username: currentUser?.username || '',
    phone: currentUser?.UserInfo?.phone || '',
    email: currentUser?.email || '',
    listData: data?.listData || [{ nome: '', cpf: '' }],
    protocol: data?.protocol || '',
    status: data?.status || 'aguardando pagamento',
    creationDate: data?.creationDate || new Date(),
    pix_key: data?.pix_key || undefined,
    price: data?.price || 0,
    comprovanteUrl: data?.comprovanteUrl || null,
  };

  const [formData, setFormData] = useState<ReviewData>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [selectedTab, setSelectedTab] = useState(0);

  // Build steps dynamically based on statusHistory and add static statuses
  const steps = [
    ...(formData.statusHistory
      ? formData.statusHistory.map((x) => ({
          ...x,
          checked: true,
        }))
      : []),
    {
      status: 'finalizada',
      updated_at: formData.statusHistory?.find((x) => x.status === 'finalizada')?.updated_at || null,
      checked: formData.statusHistory?.some((x) => x.status === 'finalizada'),
    },
  ];

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: value === '' }));
  };

  const handleProcessChange = (index: number, field: keyof (typeof formData.listData)[0], value: string) => {
    const updatedProcesses = [...formData.listData];
    updatedProcesses[index][field] = value;
    setFormData((prev) => ({ ...prev, listData: updatedProcesses }));
    setErrors((prev) => ({ ...prev, [`process-${index}-${field}`]: value === '' }));
  };

  const addProcess = () => {
    setFormData((prev) => ({
      ...prev,
      listData: [...prev.listData, { nome: '', cpf: '' }],
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(formData);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Validações dos campos gerais
    if (!formData.list_name) newErrors.list_name = true;
    if (!formData.username) newErrors.username = true;
    if (!formData.phone) newErrors.phone = true;
    if (!formData.email) newErrors.email = true;

    // Validações dos documentos na lista
    formData.listData.forEach((process, index) => {
      if (!process.nome) {
        newErrors[`process-${index}-nome`] = true;
      }

      if (!process.cpf) {
        newErrors[`process-${index}-cpf`] = 'required'; // Documento não preenchido
      } else if (!cpf.isValid(process.cpf) && !cnpj.isValid(process.cpf)) {
        newErrors[`process-${index}-cpf`] = 'invalid'; // Documento inválido
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const removeProcess = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      listData: prev.listData.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      {isEditing && (
        <>
          <Stepper alternativeLabel sx={{ mb: 2 }}>
            {steps.map((step: any, index) => (
              <Step key={index} completed={step.checked}>
                <StepLabel 
                  sx={{ 
                    '& .MuiStepLabel-label': { 
                      fontSize: '0.8125rem',
                      mt: 0.5
                    } 
                  }}
                >
                  {step.updated_at
                    ? `${step.status.charAt(0).toUpperCase() + step.status.slice(1)} - ${dayjs(step.updated_at).format(
                        'MMM D, YYYY'
                      )}`
                    : `${step.status.charAt(0).toUpperCase() + step.status.slice(1)}`}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Divider sx={{ my: 2 }} />
        </>
      )}
      <Box component="form" sx={{ mx: 'auto' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isEditing
              ? formData.status !== 'aguardando pagamento'
                ? 'Visualizar Lista'
                : 'Editar Lista'
              : 'Criar Nova Lista'}
          </Typography>
        </Box>

        {isEditing ? (
          <>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange} 
              aria-label="edit mode tabs"
              sx={{ minHeight: '42px', '& .MuiTab-root': { minHeight: '42px', py: 1 } }}
            >
              <Tab label="Informações Gerais" />
              <Tab label="Lista de Nomes" />
            </Tabs>

            {selectedTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <ProtocolInfo
                  protocol={formData.protocol}
                  creationDate={formData.creationDate}
                  status={formData.status}
                />
                <CostSummary
                  itemCount={formData.listData.length}
                  costPerItem={costPerItem}
                  idLista={formData.id}
                  status={formData.status}
                  pix_key={formData.pix_key}
                />
              </Box>
            )}

            {selectedTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <ListNameField
                  listName={formData.list_name}
                  onChange={(value) => handleChange('list_name', value)}
                  error={!!errors.list_name}
                  status={formData.status}
                  user={user}
                />
                <NameListComponent
                  removeProcess={removeProcess}
                  listData={formData.listData}
                  onChange={handleProcessChange}
                  addProcess={addProcess}
                  status={formData.status}
                  errors={errors}
                  user={user}
                />
                {(formData.status === 'aguardando pagamento' || user?.role === 1) && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSubmit}
                      sx={{ px: 2.5, py: 0.75 }}
                    >
                      {isEditing ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </>
        ) : (
          <>
            {!isEditing && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Importação de Lista
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                  Você pode fazer upload de um arquivo Excel (.xlsx) com a lista de nomes e CPFs. Note que a importação
                  irá substituir qualquer dado atual na lista.
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconButton component="label" color="primary" size="small">
                    <Upload size={20} />
                    <input
                      type="file"
                      hidden
                      accept=".xlsx"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], setFormData)}
                    />
                    <Typography sx={{ ml: 1 }} variant="body2">Upload de Lista</Typography>
                  </IconButton>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    onClick={downloadTemplate} 
                    startIcon={<Download size={16} />}
                    sx={{ px: 2, py: 0.75 }}
                  >
                    Baixar Modelo de Importação
                  </Button>
                </Box>
                <Divider sx={{ my: 1.5 }} />
              </Box>
            )}

            <ListNameField
              listName={formData.list_name}
              onChange={(value) => handleChange('list_name', value)}
              error={!!errors.list_name}
              status={formData.status}
            />

            <NameListComponent
              removeProcess={removeProcess}
              listData={formData.listData}
              onChange={handleProcessChange}
              addProcess={addProcess}
              errors={errors}
              status={formData.status}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit}
                sx={{ px: 2.5, py: 0.75 }}
              >
                {isEditing ? 'Salvar Alterações' : 'Confirmar Cadastro'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default ReviewPage;
