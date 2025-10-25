import React, { useState } from 'react';
import { ApiService } from '@/services/ApiServices';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';

import UploadDialog from './UploadDialog'; // Importe o componente de diálogo

interface ProtocolData {
  id: number;
  protocol: string;
}

interface UploadButtonProps {
  role: number;
  status: string;
  type: string;
  data: ProtocolData[]; // Array de objetos com id e protocol
}

const UploadButton: React.FC<UploadButtonProps> = ({ role, status, type, data }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const apiService = new ApiService();

  // Função para abrir o diálogo
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Função para fechar o diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Função para enviar a lista de afiliado
  const handleUpload = async () => {
    try {
      await apiService.postApi(`/${type}/confirm`, { data: data.map((item) => item.id) });
      toast.success('Lista de afiliado enviada com sucesso!');
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao enviar a lista de afiliado. Tente novamente mais tarde.');
    }
  };

  // Renderiza o botão apenas se role === 2 e status === "Pagamento aprovado"
  if (role === 2 && status === 'Pagamento Aprovado') {
    return (
      <>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Subir lista de afiliado
        </Button>

        {/* Diálogo */}
        <UploadDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onUpload={handleUpload}
          type={type}
          data={data} // Passa os dados para o diálogo
        />
      </>
    );
  }

  // Retorna null se as condições não forem atendidas
  return null;
};

export default UploadButton;
