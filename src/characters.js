export const characters = [
  { id: 'peppe', name: 'peppe', image: '/characters/peppe.webp', position: 'center 36%' },
  { id: 'cap-pulcino', name: 'cap.pulcino', image: '/characters/cap-pulcino.webp', position: 'center 34%' },
  { id: 'peppe-arrabbiato', name: 'peppeArrabbiato', image: '/characters/peppe-arrabbiato.webp', position: 'center 32%' },
  { id: 'terrun', name: 'terrun', image: '/characters/terrun.webp', position: 'center 32%' },
  { id: 'bandito', name: 'bandito', image: '/characters/bandito.webp', position: 'center 34%' },
  { id: 'vickyminash', name: 'vickyminash', image: '/characters/vickyminash.webp', position: 'center 28%' },
  { id: 'stempia', name: 'stempia', image: '/characters/stempia.webp', position: 'center 30%' },
  { id: 'pelatone', name: 'pelatone', image: '/characters/pelatone.webp', position: 'center 38%' },
  { id: 'bers', name: 'bers', image: '/characters/bers.webp', position: 'center 33%' },
  { id: 'hashish', name: 'hashish', image: '/characters/hashish.webp', position: 'center 34%' },
  { id: 'ciano', name: 'ciano', image: '/characters/ciano.webp', position: 'center 35%' },
  { id: 'capuccetto-rosso', name: 'capuccetto Rosso', image: '/characters/capuccetto-rosso.webp', position: 'center 32%' }
];

export function getCharacter(id) {
  return characters.find((character) => character.id === id);
}
