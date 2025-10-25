import React, { useEffect, useState } from 'react';
import { ApiService } from '@/services/ApiServices';
import { Box, Button, CircularProgress, IconButton, Modal, Stack, Typography } from '@mui/material';
import { Check, DownloadSimple, X } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

interface SeeComprovanteProps {
  src: { buffer: { type: 'Buffer'; data: number[] }; contentType: string; base64?: string }; // Ajustado para permitir base64 opcional
  id: string;
  group_payment_id?: number;
  type: string;
}

const SeeComprovante: React.FC<SeeComprovanteProps> = ({ src, id, type, group_payment_id }) => {
  const apiService = new ApiService();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  // Convertendo Buffer para Base64 caso seja necessário
  useEffect(() => {
    if (!src?.base64 && src?.buffer) {
      const uint8Array = new Uint8Array(src?.buffer?.data);
      const base64String = Buffer.from(uint8Array).toString('base64');
      const filePrefix =
        src?.contentType === 'application/pdf' ? 'data:application/pdf;base64,' : 'data:image/png;base64,';
      setFileBase64(`${filePrefix}${base64String}`);
    } else {
      setFileBase64(src?.base64 || null);
    }
  }, [src]);

  // Abre o modal
  const openModal = () => setIsModalOpen(true);

  // Fecha o modal
  const closeModal = () => setIsModalOpen(false);

  // Aprovar comprovante
  const handleAprovarComprovante = async () => {
    setIsLoading(true);
    try {
      await apiService.postApi<any>(
        `/cobranca/aprovar/${id}?type=${type}${group_payment_id ? `&group_payment_id=${group_payment_id}` : ''}`
      );
      toast.success('Comprovante aprovado com sucesso!');
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao aprovar comprovante:', error);
      toast.error('Erro ao aprovar comprovante.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Botão para abrir o modal */}
      <Button variant="contained" color="primary" onClick={openModal} startIcon={<DownloadSimple size={20} />}>
        Ver Comprovante
      </Button>

      {/* Modal */}
      <Modal open={isModalOpen} onClose={closeModal} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
            outline: 'none',
          }}
        >
          {/* Título do modal */}
          <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Comprovante
          </Typography>

          {/* Exibe o comprovante */}
          {fileBase64 && (
            <>
              {src?.contentType === 'application/pdf' ? (
                <Box
                  component="iframe"
                  src={fileBase64}
                  sx={{
                    width: '100%',
                    height: '400px',
                    border: 'none',
                    borderRadius: 1,
                    mb: 2,
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={fileBase64}
                  alt="Comprovante"
                  sx={{
                    width: '100%',
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '600px',
                    objectFit: 'contain',
                    borderRadius: 1,
                    mb: 2,
                  }}
                />
              )}
            </>
          )}

          {/* Botões de ação */}
          <Stack direction="row" spacing={2} justifyContent="center">
            {/* Botão para baixar o comprovante */}
            {fileBase64 && (
              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadSimple size={20} />}
                component="a"
                href={fileBase64}
                download={`comprovante-${id}${src.contentType === 'application/pdf' ? '.pdf' : '.png'}`}
              >
                Baixar
              </Button>
            )}

            {/* Botão para aprovar o comprovante */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<Check size={20} />}
              onClick={handleAprovarComprovante}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Aprovar'}
            </Button>

            {/* Botão para fechar o modal */}
            <IconButton color="secondary" onClick={closeModal} sx={{ ml: 'auto' }}>
              <X size={20} />
            </IconButton>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};

export default SeeComprovante;
