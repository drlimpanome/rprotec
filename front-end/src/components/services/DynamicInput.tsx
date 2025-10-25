import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { DownloadSimple, Trash, Upload } from '@phosphor-icons/react/dist/ssr';

import MaskInputText from '../core/MaskInputComponent';

export interface InputField {
  id: number;
  label: string;
  type: string;
  fieldName?: string;
  required?: boolean;
  answer?: string;
  invalid_reason?: string;
}

interface DynamicInputProps {
  field: InputField;
  value?: any;
  onChange?: (value: any) => void;
  renderOnly?: boolean;
  sx?: any;
}

const DynamicInput: React.FC<DynamicInputProps> = ({ field, value, onChange, renderOnly, sx }) => {
  const [file, setFile] = useState<File | null>(value instanceof File ? value : null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    // 🔥 Se o value for um arquivo vindo do back (base64), criamos um preview
    if (value && value.fileData && value.fileName) {
      const mimeType = value.fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png'; // Padrão para PNG
      const base64Url = `data:${mimeType};base64,${value.fileData}`;
      setFilePreview(base64Url);
    } else {
      setFilePreview(null);
    }
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    if (onChange) {
      onChange({ id: field.id, file: selectedFile });
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setFilePreview(null);
    if (onChange) {
      onChange({ id: field.id, file: null });
    }
  };

  const handleDownload = () => {
    if (!value?.fileData || !value?.fileName) return;
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${value.fileData}`;
    link.download = value.fileName;
    link.click();
  };

  const renderInput = () => {
    switch (field.type) {
      case 'cpfcnpj':
      case 'tel':
        return (
          <MaskInputText
            label={field.label}
            maskType={field.type === 'cpfcnpj' ? 'cpf_cnpj' : 'telefone'}
            value={value || ''}
            disabled={renderOnly}
            onChange={(maskedValue: string) => onChange && onChange({ id: field.id, value: maskedValue })}
            fullWidth
            margin="dense"
          />
        );
      case 'text':
        return (
          <TextField
            label={field.label}
            variant="outlined"
            fullWidth
            value={value || ''}
            disabled={renderOnly}
            onChange={(e) => onChange && onChange({ id: field.id, value: e.target.value })}
            required={field.required}
            InputLabelProps={{ shrink: !!value || renderOnly }}
          />
        );
      case 'file':
        return (
          <Box>
            <Paper
              variant="outlined"
              sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                borderRadius: 2,
                backgroundColor: file || filePreview ? '#f5f5f5' : 'transparent',
                transition: 'background-color 0.3s ease',
              }}
            >
              {!file && !filePreview && (
                <>
                  <Typography variant="body1" color="textSecondary" sx={{ wordBreak: 'break-word' }}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<Upload />}
                    sx={{ textTransform: 'none' }}
                    disabled={renderOnly}
                  >
                    Anexar Documento
                    <input type="file" hidden onChange={handleFileChange} accept=".pdf, image/*" />
                  </Button>
                </>
              )}
              {(file || filePreview) && (
                <>
                  <Box>
                    <Typography variant="body1" color="textSecondary" sx={{ wordBreak: 'break-word' }}>
                      {file?.name || value?.fileName}
                    </Typography>

                    {/* Se for PDF, exibir no iframe */}
                    {filePreview && value?.fileName?.endsWith('.pdf') && (
                      <iframe src={filePreview} width="100%" height="200px" title="Preview PDF"></iframe>
                    )}

                    {/* Se for imagem, exibir diretamente */}
                    {filePreview && value?.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) && (
                      <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                    )}
                  </Box>

                  {/* Opções: Download ou Remover */}
                  <Stack direction="row" spacing={1}>
                    {filePreview && (
                      <IconButton color="primary" onClick={handleDownload}>
                        <DownloadSimple />
                      </IconButton>
                    )}
                    <IconButton color="error" onClick={handleFileRemove}>
                      <Trash />
                    </IconButton>
                  </Stack>
                </>
              )}
            </Paper>
          </Box>
        );
      case 'date':
        return (
          <TextField
            label={field.label}
            variant="outlined"
            fullWidth
            disabled={renderOnly}
            value={value || ''}
            onChange={(e) => onChange && onChange({ id: field.id, value: e.target.value })}
            required={field.required}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        );
      default:
        return <Typography variant="body1">Tipo não suportado</Typography>;
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 2, width: '100%' }}>
      <Stack spacing={1}>{renderInput()}</Stack>
    </Box>
  );
};

export default DynamicInput;
