import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, TextField, Button, Typography, Box, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, AppBar, Toolbar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/router';

type Expense = {
  id: number;
  description: string;
  value: number;
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('loggedIn');
      const expiry = localStorage.getItem('loginExpiry');
      if (!loggedIn || !expiry || Number(expiry) < Date.now()) {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('loginExpiry');
        router.replace('/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loginExpiry');
    router.replace('/login');
  };

  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number>(0);

  // Novos estados para edição
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editValue, setEditValue] = useState<number>(0);

  // Estado para confirmar exclusão
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Buscar despesas
  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('/api/expenses');
      return res.json();
    }
  });

  // Adicionar despesa
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense: Omit<Expense, 'id'>) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses']})
  });

  // Atualizar despesa
  const updateExpenseMutation = useMutation({
    mutationFn: async (expense: Expense) => {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses']});
      setEditingExpenseId(null);
    }
  });

  // Deletar despesa
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses']})
  });

  // Função para adicionar despesa
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Impedir salvar se descrição vazia ou valor zero
    if (!description.trim() || value === 0) return;
    addExpenseMutation.mutate({ description, value });
    setDescription('');
    setValue(0);
  };

  // Função para iniciar a edição
  const handleEdit = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditDescription(expense.description);
    setEditValue(expense.value);
  };

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setEditingExpenseId(null);
  };

  // Função para salvar a edição
  const handleSaveEdit = (id: number) => {
    // Impedir atualizar se descrição vazia ou valor zero
    if (!editDescription.trim() || editValue === 0) return;
    updateExpenseMutation.mutate({ id, description: editDescription, value: editValue });
  };

  // Funções para confirmação de exclusão via modal
  const openConfirmDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId !== null) {
      deleteExpenseMutation.mutate(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  // Função para exclusão com confirmação
  const handleDelete = (id: number) => {
    openConfirmDelete(id);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Aniversário Lucas 2025
          </Typography>
          <Button variant="text" color='inherit' onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" className="p-4 mt-4">
        <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <TextField
            label="Valor"
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            fullWidth
          />
          <Button variant="contained" type="submit" className='w-full mt-4'>
            Adicionar
          </Button>
        </Box>
        <Box className="mt-6">
          <Typography variant="h5">Despesas</Typography>
          {isLoading ? (
            <Typography>Carregando...</Typography>
          ) : (
            <>
              <List>
                {expenses?.map((expense) => (
                  <ListItem key={expense.id} disableGutters>
                    {editingExpenseId === expense.id ? (
                      <>
                        <TextField
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Descrição"
                        />
                        <TextField
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          placeholder="Valor"
                        />
                        <Box display="flex" gap={1} mt={1}>
                          <Button onClick={() => handleSaveEdit(expense.id)}>
                            <SaveIcon />
                          </Button>
                          <Button onClick={handleCancelEdit}>
                            <CancelIcon />
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <>
                        <ListItemText
                          primary={expense.description}
                          secondary={`R$ ${expense.value.toFixed(2)}`}
                        />
                        <Box display="flex" gap={1}>
                          <Button onClick={() => handleEdit(expense)}>
                            <EditIcon />
                          </Button>
                          <Button onClick={() => handleDelete(expense.id)}>
                            <DeleteIcon />
                          </Button>
                        </Box>
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          px={2}
          py={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="background.paper"
          borderTop="1px solid #ccc"
        >
          <Typography variant="subtitle1">Total:</Typography>
          <Typography variant="subtitle1">
            R$ {expenses?.reduce((acc, expense) => acc + expense.value, 0).toFixed(2)}
          </Typography>
        </Box>

        {/* Modal de confirmação de exclusão */}
        <Dialog open={confirmDeleteId !== null} onClose={handleCancelDelete}>
          <DialogTitle>Confirmação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja remover este item?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete}>
              Não
            </Button>
            <Button onClick={handleConfirmDelete} autoFocus>
              Sim
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
