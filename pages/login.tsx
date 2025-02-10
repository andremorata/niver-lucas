import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('loginExpiry', (Date.now() + 10 * 24 * 60 * 60 * 1000).toString());
      router.push('/');
    } else {
      setError(data.message || 'Falha no login');
    }
  };

  return (
    <Container maxWidth="sm" className="p-4">
      <Typography variant="h4" className="text-center mb-4">
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <TextField
          label="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />
        <TextField
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        {error && <Typography color="error" className='text-center'>{error}</Typography>}
        <Button variant="contained" type="submit">
          Entrar
        </Button>
      </Box>
    </Container>
  );
}
