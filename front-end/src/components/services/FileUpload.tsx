import React, { useState } from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { Trash, Upload } from '@phosphor-icons/react/dist/ssr';

interface FileUploadProps {
  label: string;
  required?: boolean;
  value?: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, required, value, onChange, disabled }) => {
  const [file, setFile] = useState<File | null>(value || null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    onChange(selectedFile); // Notifica o componente pai sobre o arquivo selecionado
  };

  const handleFileRemove = () => {
    setFile(null);
    onChange(null); // Notifica o componente pai sobre a remoção do arquivo
  };

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
          backgroundColor: file ? '#f5f5f5' : 'transparent',
          transition: 'background-color 0.3s ease',
        }}
      >
        {!file && (
          <>
            <Typography variant="body1" color="textSecondary" sx={{ wordBreak: 'break-word' }}>
              {label}
              {required ? ' *' : ''}
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<Upload />}
              sx={{ textTransform: 'none' }}
              disabled={disabled}
            >
              Anexar Documento
              <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
            </Button>
          </>
        )}
        {file && (
          <>
            <Typography variant="body1" color="textSecondary" sx={{ wordBreak: 'break-word' }}>
              {file.name}
            </Typography>
            <IconButton color="error" onClick={handleFileRemove} disabled={disabled}>
              <Trash />
            </IconButton>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default FileUpload;
