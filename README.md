# Indovina Chi? Online

Gioco web mobile per 2 giocatori, con stanze private e personaggi personalizzati.

## Cosa c'è già

- 12 personaggi con le foto fornite
- Creazione stanza con codice
- Entrata nella stanza dal secondo telefono
- Scelta manuale del personaggio segreto
- Tabellone cliccabile per eliminare carte
- Chat/domande semplici
- Cambio turno
- Tentativo finale
- Vittoria/sconfitta

## Come avviarlo in Visual Studio Code

1. Installa Node.js se non lo hai già.
2. Apri questa cartella con Visual Studio Code.
3. Apri il terminale di VS Code.
4. Esegui:

```bash
npm install
npm run dev
```

5. Apri il link che compare nel terminale.

## Configurare Firebase per giocare online

1. Vai su Firebase Console.
2. Crea un progetto.
3. Aggiungi una Web App.
4. Attiva Realtime Database.
5. Copia `.env.example` e rinominalo `.env.local`.
6. Inserisci i dati Firebase dentro `.env.local`.
7. Riavvia `npm run dev`.

## Regole Realtime Database per test tra amici

Per il prototipo puoi usare temporaneamente:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Queste regole sono comode per provare, ma non sono sicure per un gioco pubblico.

## Pubblicazione su GitHub Pages

Dopo averlo provato, si può pubblicare con GitHub Pages. Prima conviene mettere le variabili Firebase nei Secrets/Variables di GitHub Actions oppure compilare in locale.

## Nota privacy

Il gioco nasconde il personaggio segreto nell'interfaccia dell'avversario. Per un prototipo tra amici va bene. Per renderlo davvero anti-cheat servirebbe un backend con regole più avanzate o Cloud Functions.
