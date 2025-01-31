import Store from 'electron-store';

import { defaults } from 'shared/defaults/settings';
import { Hotkeys } from 'shared/types/hotkeys';

export type settingsType = {
  settings: {
    backgroundColor: string;
    darkTheme: boolean;
    adBlocker: boolean;
    hotkeys: Hotkeys;
  };
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const settingsStore = new Store<settingsType>({
  defaults: defaults
});

export default settingsStore;
