import React, { useEffect, useState } from 'react';
import { ApiService } from '@/services/ApiServices';
import { Box, Button, CircularProgress, IconButton, Modal, Stack, Typography } from '@mui/material';
import { Check, DownloadSimple, X } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

interface SeeComprovanteProps {
  id: string;
}

const ApproveWithouPay: React.FC<SeeComprovanteProps> = ({ id }) => {
  const apiService = new ApiService();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  // Abre o modal
  const openModal = () => setIsModalOpen(true);

  // Fecha o modal
  const closeModal = () => setIsModalOpen(false);

  // Aprovar comprovante
  const handleAprovarComprovante = async () => {
    setIsLoading(true);
    try {
      await apiService.postApi<any>(`/cobranca/aprovar/${id}?type=list`);
      toast.success('Lista aprovada com sucesso!');
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao aprovar comprovante:', error);
      toast.error('Erro ao aprovar Lista.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Botão para abrir o modal */}
      <Button variant="contained" color="primary" onClick={openModal} startIcon={<DownloadSimple size={20} />}>
        Aprovar
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
            Tem certeza que deseja aprovar essa lista !
          </Typography>

          {/* Botões de ação */}
          <Stack direction="row" spacing={2} justifyContent="center">
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

export default ApproveWithouPay;
