import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  child,
  get,
  onValue,
  ref,
  remove,
  set,
  update
} from 'firebase/database';
import { database, isFirebaseConfigured } from './firebase.js';
import { characters, getCharacter } from './characters.js';
import './style.css';

const emptyRoom = {
  createdAt: Date.now(),
  status: 'waiting',
  currentTurn: 'p1',
  winner: null,
  players: {
    p1: null,
    p2: null
  },
  messages: []
};

function makeRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function makePlayerId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function useLocalEliminated(roomCode, playerKey) {
  const key = roomCode && playerKey ? `indovina-eliminated-${roomCode}-${playerKey}` : null;
  const [eliminated, setEliminated] = useState([]);

  useEffect(() => {
    if (!key) return;
    const saved = localStorage.getItem(key);
    setEliminated(saved ? JSON.parse(saved) : []);
  }, [key]);

  useEffect(() => {
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(eliminated));
  }, [key, eliminated]);

  return [eliminated, setEliminated];
}

function App() {
  const [roomCode, setRoomCode] = useState(localStorage.getItem('indovina-room') || '');
  const [playerId, setPlayerId] = useState(localStorage.getItem('indovina-player-id') || makePlayerId());
  const [playerKey, setPlayerKey] = useState(localStorage.getItem('indovina-player-key') || '');
  const [room, setRoom] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [name, setName] = useState(localStorage.getItem('indovina-name') || 'Giocatore');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    localStorage.setItem('indovina-player-id', playerId);
  }, [playerId]);

  useEffect(() => {
    if (!isFirebaseConfigured || !roomCode) return;
    const roomRef = ref(database, `rooms/${roomCode}`);
    const stop = onValue(roomRef, (snapshot) => {
      setRoom(snapshot.exists() ? snapshot.val() : null);
    });
    return () => stop();
  }, [roomCode]);

  async function createRoom() {
    if (!isFirebaseConfigured) return;
    setBusy(true);
    setError('');
    try {
      let code = makeRoomCode();
      let roomSnapshot = await get(ref(database, `rooms/${code}`));
      while (roomSnapshot.exists()) {
        code = makeRoomCode();
        roomSnapshot = await get(ref(database, `rooms/${code}`));
      }

      const nextRoom = {
        ...emptyRoom,
        code,
        players: {
          p1: {
            id: playerId,
            name: name || 'Giocatore 1',
            ready: false,
            secretId: null,
            joinedAt: Date.now()
          },
          p2: null
        }
      };
      await set(ref(database, `rooms/${code}`), nextRoom);
      saveSession(code, 'p1');
    } catch (err) {
      setError('Non riesco a creare la stanza. Controlla Firebase e riprova.');
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    if (!isFirebaseConfigured) return;
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setBusy(true);
    setError('');
    try {
      const snapshot = await get(ref(database, `rooms/${code}`));
      if (!snapshot.exists()) {
        setError('Stanza non trovata. Controlla il codice.');
        return;
      }
      const data = snapshot.val();
      const existingKey = data.players?.p1?.id === playerId ? 'p1' : data.players?.p2?.id === playerId ? 'p2' : '';
      if (existingKey) {
        saveSession(code, existingKey);
        return;
      }
      if (data.players?.p1 && data.players?.p2) {
        setError('Questa stanza ha già 2 giocatori.');
        return;
      }
      const key = data.players?.p1 ? 'p2' : 'p1';
      await update(ref(database, `rooms/${code}`), {
        [`players/${key}`]: {
          id: playerId,
          name: name || `Giocatore ${key === 'p1' ? '1' : '2'}`,
          ready: false,
          secretId: null,
          joinedAt: Date.now()
        },
        status: 'choosing'
      });
      saveSession(code, key);
    } catch (err) {
      setError('Non riesco a entrare nella stanza. Controlla Firebase e riprova.');
    } finally {
      setBusy(false);
    }
  }

  function saveSession(code, key) {
    setRoomCode(code);
    setPlayerKey(key);
    localStorage.setItem('indovina-room', code);
    localStorage.setItem('indovina-player-key', key);
    localStorage.setItem('indovina-name', name || 'Giocatore');
  }

  function leaveRoom() {
    localStorage.removeItem('indovina-room');
    localStorage.removeItem('indovina-player-key');
    setRoomCode('');
    setPlayerKey('');
    setRoom(null);
  }

  if (!isFirebaseConfigured) {
    return <SetupGuide />;
  }

  if (!roomCode || !playerKey) {
    return (
      <main className="screen home">
        <section className="hero card">
          <p className="eyebrow">Gioco privato per 2</p>
          <h1>Indovina Chi?</h1>
          <p>Versione personalizzata con le tue foto. Crea una stanza, manda il codice e scegli il tuo personaggio segreto.</p>
        </section>

        <section className="card form-card">
          <label>Il tuo nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Giocatore" />
          <button className="primary" onClick={createRoom} disabled={busy}>Crea stanza</button>
        </section>

        <section className="card form-card">
          <label>Codice stanza</label>
          <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="ESEMPIO: A7K2P" />
          <button onClick={joinRoom} disabled={busy}>Entra</button>
          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="screen center">
        <section className="card">
          <h1>Caricamento stanza...</h1>
          <button onClick={leaveRoom}>Torna indietro</button>
        </section>
      </main>
    );
  }

  return <Room room={room} roomCode={roomCode} playerKey={playerKey} playerId={playerId} onLeave={leaveRoom} />;
}

function SetupGuide() {
  return (
    <main className="screen home">
      <section className="hero card">
        <p className="eyebrow">Configurazione richiesta</p>
        <h1>Indovina Chi? è pronto</h1>
        <p>Per giocare online devi solo inserire i dati Firebase nel file <code>.env.local</code>.</p>
      </section>
      <section className="card">
        <h2>Passi rapidi</h2>
        <ol className="steps">
          <li>Copia <code>.env.example</code> e rinominalo <code>.env.local</code>.</li>
          <li>Crea un progetto Firebase e attiva Realtime Database.</li>
          <li>Incolla i dati della Web App dentro <code>.env.local</code>.</li>
          <li>Riavvia <code>npm run dev</code>.</li>
        </ol>
      </section>
    </main>
  );
}

function Room({ room, roomCode, playerKey, playerId, onLeave }) {
  const me = room.players?.[playerKey];
  const opponentKey = playerKey === 'p1' ? 'p2' : 'p1';
  const opponent = room.players?.[opponentKey];
  const bothPlayers = Boolean(room.players?.p1 && room.players?.p2);
  const bothReady = Boolean(room.players?.p1?.ready && room.players?.p2?.ready);
  const winner = room.winner;

  async function resetRoom() {
    await update(ref(database, `rooms/${roomCode}`), {
      status: 'choosing',
      currentTurn: 'p1',
      winner: null,
      messages: [],
      'players/p1/ready': false,
      'players/p1/secretId': null,
      'players/p2/ready': false,
      'players/p2/secretId': null
    });
  }

  async function deleteRoom() {
    await remove(ref(database, `rooms/${roomCode}`));
    onLeave();
  }

  return (
    <main className="screen game">
      <header className="topbar">
        <div>
          <span className="label">Codice stanza</span>
          <strong className="room-code">{roomCode}</strong>
        </div>
        <button className="ghost" onClick={onLeave}>Esci</button>
      </header>

      {!bothPlayers && (
        <section className="card notice">
          <h2>Aspetto il secondo giocatore</h2>
          <p>Invia questo codice: <strong>{roomCode}</strong></p>
        </section>
      )}

      {bothPlayers && !bothReady && (
        <SecretChooser roomCode={roomCode} playerKey={playerKey} me={me} opponent={opponent} />
      )}

      {bothPlayers && bothReady && (
        <GameTable room={room} roomCode={roomCode} playerKey={playerKey} opponentKey={opponentKey} />
      )}

      {winner && (
        <section className="card result">
          <h2>{winner === playerKey ? 'Hai vinto!' : 'Hai perso!'}</h2>
          <p>{winner === playerKey ? 'Hai indovinato il personaggio.' : 'L’altro giocatore ha vinto la partita.'}</p>
          <div className="row">
            <button className="primary" onClick={resetRoom}>Rivincita</button>
            <button onClick={deleteRoom}>Chiudi stanza</button>
          </div>
        </section>
      )}
    </main>
  );
}

function SecretChooser({ roomCode, playerKey, me, opponent }) {
  const [selected, setSelected] = useState(me?.secretId || '');

  async function confirmSecret() {
    if (!selected) return;
    await update(ref(database, `rooms/${roomCode}/players/${playerKey}`), {
      secretId: selected,
      ready: true
    });
  }

  return (
    <section className="card">
      <p className="eyebrow">Fase 1</p>
      <h2>Scegli il tuo personaggio segreto</h2>
      <p className="muted">L’altro giocatore non lo vede nella schermata di gioco.</p>
      <CharacterGrid selected={selected} onSelect={setSelected} mode="choose" />
      <button className="primary sticky" onClick={confirmSecret} disabled={!selected}>Conferma personaggio</button>
      <p className="status-line">Avversario: {opponent?.ready ? 'pronto' : 'sta scegliendo...'}</p>
    </section>
  );
}

function GameTable({ room, roomCode, playerKey, opponentKey }) {
  const [eliminated, setEliminated] = useLocalEliminated(roomCode, playerKey);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');

  const me = room.players[playerKey];
  const opponent = room.players[opponentKey];
  const mySecret = getCharacter(me.secretId);
  const isMyTurn = room.currentTurn === playerKey;

  function toggleEliminated(id) {
    setEliminated((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }

  async function sendMessage() {
    const text = message.trim();
    if (!text) return;
    const messages = Array.isArray(room.messages) ? room.messages : [];
    await update(ref(database, `rooms/${roomCode}`), {
      messages: [...messages.slice(-30), { by: playerKey, name: me.name, text, at: Date.now() }]
    });
    setMessage('');
  }

  async function passTurn() {
    await update(ref(database, `rooms/${roomCode}`), {
      currentTurn: opponentKey
    });
  }

  async function finalGuess() {
    if (!guess || room.winner) return;
    const correct = guess === opponent.secretId;
    await update(ref(database, `rooms/${roomCode}`), {
      winner: correct ? playerKey : opponentKey,
      status: 'finished'
    });
  }

  return (
    <>
      <section className="secret card">
        <div>
          <p className="eyebrow">Il tuo personaggio</p>
          <h2>{mySecret?.name}</h2>
        </div>
        {mySecret && <img src={mySecret.image} alt={mySecret.name} style={{ objectPosition: mySecret.position }} />}
      </section>

      <section className="card turn-card">
        <h2>{isMyTurn ? 'È il tuo turno' : `Turno di ${opponent.name}`}</h2>
        <p className="muted">Fai una domanda, elimina le carte dalla tua griglia e passa il turno.</p>
        <div className="chat-input">
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Scrivi una domanda..." />
          <button onClick={sendMessage}>Invia</button>
        </div>
        <div className="messages">
          {(Array.isArray(room.messages) ? room.messages : []).slice(-6).map((msg, index) => (
            <p key={`${msg.at}-${index}`} className={msg.by === playerKey ? 'mine' : 'theirs'}>
              <strong>{msg.name}:</strong> {msg.text}
            </p>
          ))}
        </div>
        <button className="primary" onClick={passTurn} disabled={!isMyTurn || room.winner}>Passa turno</button>
      </section>

      <section className="card">
        <p className="eyebrow">La tua griglia</p>
        <h2>Elimina i sospetti</h2>
        <CharacterGrid eliminated={eliminated} onSelect={toggleEliminated} mode="play" />
      </section>

      <section className="card guess-card">
        <h2>Tentativo finale</h2>
        <p className="muted">Se sbagli, vince l’avversario.</p>
        <select value={guess} onChange={(e) => setGuess(e.target.value)}>
          <option value="">Scegli un personaggio</option>
          {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
        </select>
        <button className="danger" onClick={finalGuess} disabled={!guess || room.winner}>Indovina</button>
      </section>
    </>
  );
}

function CharacterGrid({ selected, eliminated = [], onSelect, mode }) {
  return (
    <div className="grid">
      {characters.map((character) => {
        const isSelected = selected === character.id;
        const isOut = eliminated.includes(character.id);
        return (
          <button
            className={`character ${isSelected ? 'selected' : ''} ${isOut ? 'eliminated' : ''}`}
            key={character.id}
            onClick={() => onSelect(character.id)}
            type="button"
          >
            <img src={character.image} alt={character.name} style={{ objectPosition: character.position }} />
            <span>{character.name}</span>
            {mode === 'play' && isOut && <b>ELIMINATO</b>}
          </button>
        );
      })}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
