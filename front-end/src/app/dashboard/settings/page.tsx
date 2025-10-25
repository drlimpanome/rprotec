'use client';

import * as React from 'react';
import { ApiService } from '@/services/ApiServices';
import dayjs from '@/utils/dayjs-config';
import { Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';

import { useUser } from '@/hooks/use-user';

const apiService = new ApiService();

interface ListGroup {
  id: number;
  name: string;
  expires_at: string | null;
  saved: boolean;
}

interface InputRow {
  id: string;
  name: string;
  expires_at: string;
  editable: boolean;
  saved?: boolean;
}

export default function Page(): React.JSX.Element {
  const [listGroups, setListGroups] = React.useState<ListGroup[]>([]);
  const [inputs, setInputs] = React.useState<InputRow[]>([]);
  const { user } = useUser();

  const fetchListGroups = async () => {
    try {
      const response = await apiService.getApi<ListGroup[]>('/list-groups');
      setListGroups(response);

      const initialInputs = response.map((group) => ({
        id: `${group.id}`,
        name: group.name,
        expires_at: group.expires_at ? dayjs(group.expires_at).format('YYYY-MM-DDTHH:mm') : '',
        editable: true,
        saved: true,
      }));
      setInputs(initialInputs);
    } catch (error) {
      console.error('Failed to fetch list groups:', error);
    }
  };

  React.useEffect(() => {
    fetchListGroups();
  }, []);

  const addInputRow = () => {
    const newRow: InputRow = {
      id: `${Math.random()}`,
      name: '',
      expires_at: '',
      editable: true,
      saved: false,
    };
    setInputs((prevInputs) => [...prevInputs, newRow]);
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setInputs((prevInputs) =>
      prevInputs.map((input) => (input.id === id ? { ...input, [field]: value, saved: false } : input))
    );
  };

  const handleSave = async (id: string) => {
    const inputToSave = inputs.find((input) => input.id === id);
    if (!inputToSave) return;

    const { name, expires_at } = inputToSave;
    try {
      await apiService.postApi('/list-groups', { name, expires_at, id });
      setInputs((prevInputs) => prevInputs.map((input) => (input.id === id ? { ...input, saved: true } : input)));
      toast.success('Lista salva com sucesso!');
      fetchListGroups();
    } catch (error) {
      console.error('Erro ao salvar a lista:', error);
    }
  };

  const now = dayjs();
  const upcomingLists = inputs.filter((input) => !input.expires_at || dayjs(input.expires_at).isAfter(now));
  const expiredLists = inputs.filter((input) => input.expires_at && dayjs(input.expires_at).isBefore(now));

  return (
    <Stack spacing={3}>
      {user?.role === 1 ? (
        <>
          <Typography variant="h4">Configurações - Definir Próximos Agrupamentos de Listas</Typography>

          <Box>
            <Typography variant="h6" gutterBottom>
              Listas Futuras
            </Typography>
            {upcomingLists.length > 0 ? (
              upcomingLists.map((input) => (
                <Card key={`upcoming-${input.id}`} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Nome da Lista"
                          value={input.name}
                          onChange={(e) => handleInputChange(input.id, 'name', e.target.value)}
                          disabled={!input.editable}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Próxima Data de Execução"
                          type="datetime-local"
                          InputLabelProps={{ shrink: true }}
                          value={input.expires_at}
                          onChange={(e) => handleInputChange(input.id, 'expires_at', e.target.value)}
                          disabled={!input.editable}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSave(input.id)}
                          disabled={input.saved}
                        >
                          Salvar
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="textSecondary">Nenhuma lista futura encontrada.</Typography>
            )}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Listas Expiradas
            </Typography>
            {expiredLists.length > 0 ? (
              expiredLists.map((input) => (
                <Card key={`expired-${input.id}`} sx={{ mb: 2, bgcolor: 'grey.200' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Nome da Lista"
                          value={input.name}
                          onChange={(e) => handleInputChange(input.id, 'name', e.target.value)}
                          disabled={!input.editable}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Data de Expiração"
                          type="datetime-local"
                          InputLabelProps={{ shrink: true }}
                          value={input.expires_at}
                          onChange={(e) => handleInputChange(input.id, 'expires_at', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSave(input.id)}
                          disabled={input.saved}
                        >
                          Salvar
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="textSecondary">Nenhuma lista expirada encontrada.</Typography>
            )}
          </Box>

          <Button variant="outlined" onClick={addInputRow}>
            Adicionar Novo Agrupamento de Listas
          </Button>
        </>
      ) : (
        <Typography variant="h4">Voce não tem permissão para acessar essa pagina</Typography>
      )}
    </Stack>
  );
}
