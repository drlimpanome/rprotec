import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { Copy } from '@phosphor-icons/react';

interface AffiliateFeeCardProps {
  apikey: string | undefined;
  onSave: (token: string, uses_pix: boolean, pixKey?: string) => Promise<void>; // Alterado para retornar uma Promise
  uses_pix: boolean;
  pix_key: string | undefined;
}

export const AssasIntegrationCard: React.FC<AffiliateFeeCardProps> = ({ apikey, onSave, uses_pix, pix_key }) => {
  const [token, setToken] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [isPixActive, setIsPixActive] = useState(uses_pix);
  const [isTokenActive, setIsTokenActive] = useState(!uses_pix);
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o loading

  const handleCopyClick = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado para a área de transferência!');
  };

  useEffect(() => {
    if (apikey) {
      setToken(apikey);
    }

    if (pix_key) {
      setPixKey(pix_key);
    }
  }, [apikey, pix_key]);

  const handleSave = async () => {
    setIsLoading(true); // Ativa o estado de loading
    try {
      await onSave(token, isPixActive, pixKey); // Aguarda a função onSave ser concluída
    } catch (error) {
    } finally {
      setIsLoading(false); // Desativa o estado de loading, independentemente do resultado
    }
  };

  const handlePixToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPixActive(event.target.checked);
    // Se o PIX for ativado, desative o token
    if (event.target.checked) {
      setIsTokenActive(false);
    }
  };

  const handleTokenToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTokenActive(event.target.checked);
    // Se o token for ativado, desative o PIX
    if (event.target.checked) {
      setIsPixActive(false);
    }
  };

  return (
    <>
      {/* Card do Token Asaas */}
      <Card
        sx={{
          margin: 2,
          opacity: isTokenActive ? 1 : 0.5,
          border: isTokenActive ? '1px solid #3f51b5' : '1px solid #ccc',
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Token de API asaas"
              value={token}
              fullWidth
              onChange={(e: any) => setToken(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleCopyClick(token)} edge="end">
                      <Copy />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={<Switch checked={isTokenActive} onChange={handleTokenToggle} color="primary" />}
              label="Ativar Token"
              labelPlacement="start"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Card da Chave PIX */}
      <Card
        sx={{ margin: 2, opacity: isPixActive ? 1 : 0.5, border: isPixActive ? '1px solid #3f51b5' : '1px solid #ccc' }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Chave PIX"
              value={pixKey}
              fullWidth
              onChange={(e: any) => setPixKey(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleCopyClick(pixKey)} edge="end">
                      <Copy />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={<Switch checked={isPixActive} onChange={handlePixToggle} color="primary" />}
              label="Ativar PIX"
              labelPlacement="start"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Botão de Salvar com Loading */}
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={isLoading} // Desabilita o botão durante o loading
        sx={{ margin: 2 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Salvar'}
      </Button>
    </>
  );
};
