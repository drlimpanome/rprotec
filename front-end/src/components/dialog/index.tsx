import * as React from 'react';
import { Box, Button, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';

interface DialogComponentProps {
  type: 'upload' | 'confirmation' | 'deletion';
  title: string;
  onConfirm: (file?: File | null, divida?: string | null, name?: string | null, props?: any) => void;
  onCancel: () => void;
  props?: any;
}

const DialogComponent: React.FC<DialogComponentProps> = ({ type, title, onConfirm, onCancel, props }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [divida, setDivida] = React.useState<string>('');
  const [name, setname] = React.useState<string>('');

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      // We only accept one file
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    multiple: false, // Disable multiple files
  });

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {type === 'upload' && (
          <>
            <Box {...getRootProps()} sx={{ border: '2px dashed #ccc', p: 3, textAlign: 'center', cursor: 'pointer' }}>
              <input {...getInputProps()} />
              <Typography>
                {file ? `Arquivo selecionado: ${file.name}` : 'Arraste o arquivo aqui ou clique para selecioná-lo'}
              </Typography>
            </Box>
            <Box sx={{ border: '2px #ccc', p: 3, textAlign: 'center', cursor: 'pointer' }}>
              <Typography>Valor da divida</Typography>
              <TextField
                type="number"
                placeholder="Valor da divida"
                value={divida}
                onChange={(event) => setDivida(event.target.value)}
              />
              <Typography>Nome do Cliente</Typography>
              <TextField
                type="text"
                placeholder="Nome cliente"
                value={name}
                onChange={(event) => setname(event.target.value)}
              />
            </Box>
          </>
        )}
        {type === 'confirmation' && <Typography>Tem certeza que deseja prosseguir?</Typography>}
        {type === 'deletion' && <Typography>Tem certeza que deseja excluir esse item?</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          onClick={() => {
            if (type === 'upload') {
              onConfirm(file, divida, name, props);
            } else {
              onConfirm();
            }
          }}
          variant="contained"
          disabled={type === 'upload' ? !file || !divida || !name : false} // Disable button if no file is uploaded
        >
          {type === 'upload' ? 'Anexar' : 'Confirmar'}
        </Button>
      </DialogActions>
    </>
  );
};

export default DialogComponent;
