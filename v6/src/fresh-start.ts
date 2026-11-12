import {SAVE_KEY} from './care';

/** Called only after the player confirms. Never clear storage for other games. */
export function eraseV6Save(storage:Pick<Storage,'removeItem'|'getItem'>){
 storage.removeItem(SAVE_KEY);
 if(storage.getItem(SAVE_KEY)!==null)throw new Error('The v6 save could not be erased.');
}
