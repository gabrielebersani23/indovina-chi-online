const base = import.meta.env.BASE_URL;

export const characters = [
  { id: 'peppe', name: 'peppe', image: `${base}characters/peppe.webp`, position: 'center 36%' },
  { id: 'cap-pulcino', name: 'cap.pulcino', image: `${base}characters/cap-pulcino.webp`, position: 'center 34%' },
  { id: 'peppe-arrabbiato', name: 'peppeArrabbiato', image: `${base}characters/peppe-arrabbiato.webp`, position: 'center 32%' },
  { id: 'terrun', name: 'terrun', image: `${base}characters/terrun.webp`, position: 'center 32%' },
  { id: 'bandito', name: 'bandito', image: `${base}characters/bandito.webp`, position: 'center 34%' },
  { id: 'vickyminash', name: 'vickyminash', image: `${base}characters/vickyminash.webp`, position: 'center 28%' },
  { id: 'stempia', name: 'stempia', image: `${base}characters/stempia.webp`, position: 'center 30%' },
  { id: 'pelatone', name: 'pelatone', image: `${base}characters/pelatone.webp`, position: 'center 38%' },
  { id: 'bers', name: 'bers', image: `${base}characters/bers.webp`, position: 'center 33%' },
  { id: 'hashish', name: 'hashish', image: `${base}characters/hashish.webp`, position: 'center 34%' },
  { id: 'ciano', name: 'ciano', image: `${base}characters/ciano.webp`, position: 'center 35%' },
  { id: 'capuccetto-rosso', name: 'capuccetto Rosso', image: `${base}characters/capuccetto-rosso.webp`, position: 'center 32%' }
];

export function getCharacter(id) {
  return characters.find((character) => character.id === id);
}