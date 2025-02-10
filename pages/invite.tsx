import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  TextField,
  Typography,
  Container,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactConfetti from 'react-confetti';

interface Guest {
  fullName: string;
  age: string;
}

export default function InvitePage() {
  const router = useRouter();
  const maxGuests = router.query.sg !== undefined ? 4 : 1;

  // Define new state for fade effect
  const [confettiOpacity, setConfettiOpacity] = useState(1);

  // Existing confetti state and dimensions
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      setTimeout(() => {
        setTimeout(() => setShowConfetti(false), 1000);
        setConfettiOpacity(0);
      }, 5000);
    }
  }, []);

  const [videoStarted, setVideoStarted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [mainGuest, setMainGuest] = useState<Guest>({ fullName: '', age: '' });
  const [otherGuests, setOtherGuests] = useState<Guest[]>([]);
  const [otherGuestRefs, setOtherGuestRefs] = useState<React.RefObject<HTMLInputElement | null>[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);

  // New state for confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // NEW state for age field refs:
  const [otherGuestAgeRefs, setOtherGuestAgeRefs] = useState<React.RefObject<HTMLInputElement | null>[]>([]);

  const handleMainGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMainGuest(prev => ({
      ...prev,
      [name]: name === "fullName" ? value.toUpperCase() : value
    }));
  };

  const handleOtherGuestChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = [...otherGuests];
    updated[index] = { 
      ...updated[index], 
      [name]: name === "fullName" ? value.toUpperCase() : value 
    };
    setOtherGuests(updated);
  };

  const addGuest = () => {
    if (otherGuests.length < maxGuests) {
      const nameRef = React.createRef<HTMLInputElement>();
      const ageRef = React.createRef<HTMLInputElement>();
      setOtherGuests(prev => [...prev, { fullName: '', age: '' }]);
      setOtherGuestRefs(prev => [...prev, nameRef]);
      setOtherGuestAgeRefs(prev => [...prev, ageRef]);
      setTimeout(() => nameRef.current?.focus(), 0);
    }
  };

  const handleRemoveGuest = (index: number) => {
    setOtherGuests(prev => prev.filter((_, i) => i !== index));
    setOtherGuestRefs(prev => prev.filter((_, i) => i !== index));
    setOtherGuestAgeRefs(prev => prev.filter((_, i) => i !== index));
  };

  // Updated handleSubmit to open modal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // New validation: focus the first age field that's empty when a guest has a name.
    const invalidIndex = otherGuests.findIndex(guest => guest.fullName && !guest.age);
    if (invalidIndex !== -1) {
      alert('Para cada convidado informado, insira também a idade.');
      otherGuestAgeRefs[invalidIndex]?.current?.focus();
      return;
    }
    setConfirmModalOpen(true);
  };

  // Final confirm action inside the modal
  const handleConfirm = async () => {
    setConfirmModalOpen(false);
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainGuest, otherGuests }),
      });
      if (!response.ok) throw new Error('Error submitting invite');
      const result = await response.json();
      console.log('Invite submission result:', result);
      setConfirmed(true);

      // Re-trigger confetti
      setShowConfetti(true);
      setConfettiOpacity(1);
      setTimeout(() => {
        setTimeout(() => setShowConfetti(false), 1000);
        setConfettiOpacity(0);
      }, 5000);
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao confirmar presença. Tente novamente.');
    }
  };

  const startVideo = () => {
    setVideoStarted(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 36; // seek to 36s to show the image
      videoRef.current.pause();
    }
    setVideoEnded(true);
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
    setVideoEnded(false);
  };

  // If confirmed, show a full-screen thank you message and confetti
  if (confirmed) {
    return (
      <Container className="flex items-center justify-center h-screen relative">
        {showConfetti && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              transition: 'opacity 2s',
              opacity: confettiOpacity,
              zIndex: 9999,
            }}
          >
            <ReactConfetti width={dimensions.width} height={dimensions.height} />
          </div>
        )}
        <Typography
          variant="h2"
          className="text-center text-orange-500 font-bold"
          style={{ fontFamily: '"Chewy", cursive' }}
        >
          Obrigado por confirmar!<br /><br />
          Vejo você lá! <br /><br />
          🎉🎉🎉
        </Typography>
      </Container>
    );
  }

  return (
    <Container className="p-8 text-center">
      {showConfetti && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            transition: 'opacity 2s',
            opacity: confettiOpacity,
            zIndex: 9999,
          }}
        >
          <ReactConfetti width={dimensions.width} height={dimensions.height} />
        </div>
      )}
      <Typography
        variant="h4"
        gutterBottom
        className="font-bold text-orange-500"
        style={{ fontFamily: '"Chewy", cursive' }}
      >
        Aniversário do Lucas!
      </Typography>

      {/* Video with overlay */}
      <div className="relative my-4 inline-block">
        <video
          ref={videoRef}
          width="600"
          onEnded={handleVideoEnded}
          muted={!videoStarted}
          className="rounded-2xl shadow"
        >
          <source src="/convite_lucas.mp4" type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
        {!videoStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 transition-opacity duration-1000">
            <Button variant="contained" color="warning" size="large" onClick={startVideo}>
              Ver o convite
            </Button>
          </div>
        )}
        {videoEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 transition-opacity duration-1000">
            <Button variant="contained" color="warning" size="large" onClick={restartVideo}>
              Ver o convite novamente
            </Button>
          </div>
        )}
      </div>

      {/* Link to show the presence confirmation form */}
      {!showForm && (
        <Button
          variant="contained"
          color="warning"
          size="large"
          fullWidth
          onClick={() => {
            setShowForm(true);
            setTimeout(() => {
              mainInputRef.current?.scrollIntoView({ behavior: 'smooth' });
              mainInputRef.current?.focus();
            }, 100);
          }}
        >
          CONFIRME SUA PRESENÇA AGORA
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Typography variant="h5">Convidado Principal (Obrigatório)</Typography>
            <TextField
              inputRef={mainInputRef}
              fullWidth
              label="Nome Completo"
              name="fullName"
              value={mainGuest.fullName}
              onChange={handleMainGuestChange}
              variant="outlined"
              required
            />
            <TextField
              fullWidth
              label="Idade"
              name="age"
              type="tel"
              value={mainGuest.age}
              onChange={handleMainGuestChange}
              variant="outlined"
              required
            />
          </div>
          <div className="space-y-4">
            <Typography variant="h5">Quem mais vai com você?</Typography>
            {otherGuests.map((guest, index) => (
              <div key={index} className="space-y-3 pb-4">
                <Typography variant="body2">Convidado {index + 1}</Typography>
                <TextField
                  inputRef={otherGuestRefs[index]} // assign corresponding ref here
                  fullWidth
                  label="Nome Completo"
                  name="fullName"
                  value={guest.fullName}
                  size='small'
                  onChange={(e) => handleOtherGuestChange(index, e)}
                  variant="outlined"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton size='small' color='warning' onClick={() => handleRemoveGuest(index)}>
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                  }}
                />
                <TextField
                  inputRef={otherGuestAgeRefs[index]}
                  fullWidth
                  label="Idade"
                  name="age"
                  type="tel"
                  size='small'
                  value={guest.age}
                  onChange={(e) => handleOtherGuestChange(index, e)}
                  variant="outlined"
                />
              </div>
            ))}
            <Button
              variant="contained"
              onClick={addGuest}
              color='warning'
              size='small'
              disabled={otherGuests.length >= maxGuests}
            >
              Adicionar Convidado
            </Button>
          </div>
          <Divider />
          <Button
            variant="contained"
            type="submit"
            className="mt-4"
            color='error'
            size='large'
          >
            Finalizar
          </Button>
        </form>
      )}

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
        <DialogTitle>Confirmar Presença</DialogTitle>
        <DialogContent dividers>
          <Typography className="mt-4">
            Por favor, verifique se as informações estão corretas antes de confirmar sua presença.
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Idade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{mainGuest.fullName}</TableCell>
                <TableCell>{mainGuest.age}</TableCell>
              </TableRow>
              {otherGuests.map((guest, index) => (
                <TableRow key={index}>
                  <TableCell>{guest.fullName}</TableCell>
                  <TableCell>{guest.age}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} variant="contained" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
