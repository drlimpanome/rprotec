import React, { useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

interface DragAndDropProps {
  onFileUpload: (file: File) => void;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({ onFileUpload }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: '.xlsx, .xls' });

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([{ nome: '', cpf: '' }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Molde');
    XLSX.writeFile(wb, 'molde_nomes_cpfs.xlsx');
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed #1976d2',
          borderRadius: 1,
          cursor: 'pointer',
          mb: 2,
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Solte o arquivo aqui...</Typography>
        ) : (
          <Typography>Arraste e solte o arquivo aqui ou clique para selecionar</Typography>
        )}
      </Box>
      <Button variant="contained" onClick={downloadTemplate}>
        Baixar Molde
      </Button>
    </Box>
  );
};

export default DragAndDrop;
