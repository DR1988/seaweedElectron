import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { InitialValues } from '../Types/StorageTypes';
import { WindowType } from '../Types/Types';

export type Channels = 'save-calibration' | 'load-initial' | 'loaded-initial';

export type SerialChannel = 'serial-channel';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage: function (channel, args) {
      ipcRenderer.send(channel, args);
    },
    on: function (channel, func) {
      const subscription = (
        _event: IpcRendererEvent,
        args: Parameters<typeof func>
      ) => {
        // @ts-ignore
        func(args);
      };
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel, func) {
      // @ts-ignore
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  serialPort: {
    sendMessage<T>(channel: SerialChannel, args: T[]) {
      ipcRenderer.send(channel, args);
    },
    on<T>(channel: SerialChannel, func: (...args: T[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: T[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
  },
} as {
  ipcRenderer: WindowType['electron']['ipcRenderer'];
  serialPort: any;
});
