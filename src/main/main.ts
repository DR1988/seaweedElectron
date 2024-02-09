/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { getCo2Port, getPort } from './portConnection';
import { EChannels } from '../Types/Types';
import { DelimiterParser } from '@serialport/parser-delimiter';
import { SerialPort } from 'serialport';
import { AutoDetectTypes } from '@serialport/bindings-cpp';

const Co2ResultArray: { time: number; value: string }[] = [];

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

// const decodeC02Commands = (command: string) => {
//   const co2Lavel = command.split(',')[1];
//   console.log('co2Lavel:', co2Lavel);
//   return co2Lavel;
// };

const decodeC02Commands = (command: string): string | undefined => {
  const co2Lavel = command.split(' ')[1];
  return co2Lavel;
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  let serialPort: SerialPort<AutoDetectTypes> | null = null;
  let serialPortCo2: Awaited<ReturnType<typeof getPort>> = null;
  let arduinoParser: DelimiterParser | undefined;
  let isSerialListenerSet = false;
  let isSerialCo2ListenerSet = false;
  ipcMain.on('serial-channel', async (event, args) => {
    if (args.includes('serial:connect')) {
      const { connectedPort, parser: _arduinoParser } = await getPort(event);
      serialPort = connectedPort;
      arduinoParser = _arduinoParser;
      serialPortCo2 = await getCo2Port(event);
    }
    console.log('serialPort', !!serialPort);
    console.log('serialPortCo2', !!serialPortCo2);

    if (serialPortCo2 && !isSerialCo2ListenerSet) {
      isSerialCo2ListenerSet = true;
      let connectedData = '';
      let result = '';
      let timerId: string | number | NodeJS.Timeout | undefined;

      serialPortCo2.on('data', (chunk) => {
        // console.log('CO2 chunk', chunk.toString());
        connectedData += chunk.toString();
        // result = '';

        // if (connectedData.includes('@RADT')) {
        //   console.log('connectedData', connectedData);
        //   connectedData = '';
        //   const decodedResult = decodeC02Commands(chunk.toString());
        //   if (
        //     decodedResult &&
        //     decodedResult.length > 3 &&
        //     Number(decodedResult) > 0
        //   ) {
        //     event.sender.send('serial-channel', `CO2_RESULT:${decodedResult}`);
        //   }
        // }
        clearTimeout(timerId);
        timerId = setTimeout(() => {
          result = connectedData;
          connectedData = '';
          console.log('result CO2', result);
          const decodedResult = decodeC02Commands(result);
          console.log('decodedResult', decodedResult);
          if (
            decodedResult &&
            decodedResult.length > 3 &&
            Number(decodedResult) > 0
          ) {
            event.sender.send('serial-channel', `CO2_RESULT:${decodedResult}`);
            Co2ResultArray.push({
              time: new Date().toISOString(),
              value: decodedResult,
            });
            fs.writeFile(
              './co2Result.json',
              JSON.stringify(Co2ResultArray, null, 2),
              'utf-8',
              (err) => {
                if (err) {
                  console.log('ERROR:', err);
                  return;
                }
              }
            );
          }
        }, 300);
      });
    }

    if (serialPort && !isSerialListenerSet && arduinoParser) {
      isSerialListenerSet = true;
      console.log('SUBSCRIBED SERIAL');
      arduinoParser.on('data', (data) => {
        if (data.toString().includes('STEPPER_STOP')) {
          event.sender.send('serial-channel', data.toString());
        }

        console.log('datadata', data.toString());
      });
    }

    if (args.includes('serial:disconnect') && serialPort) {
      serialPort.close((error) => {
        if (error === null) {
          event.sender.send('serial-channel', 'serial:disconnected');
        } else {
          console.error('DISCONNECT ERROR ARDUINO');
        }
      });
    }

    if (args.includes('serial:disconnect') && serialPortCo2) {
      serialPortCo2.close((error) => {
        if (error === null) {
          event.sender.send('serial-channel', 'serial:disconnected');
        } else {
          console.error('DISCONNECT ERROR Co2');
        }
      });
    }

    if (args.includes('serial:transfer') && serialPort) {
      const message = args[1];
      serialPort.write(message);
    }

    if (args.includes('serialCo2:transfer') && serialPortCo2) {
      const message = args[1] + '\r\n';
      console.log('message', message);
      serialPortCo2.write(message);
    }
  });

  ipcMain.on('save-calibration', (event, args) => {
    // console.log('argsargsargsargs', event, args);
  });

  ipcMain.on(EChannels.loadInitial, (event, args) => {
    fs.readFile('./initialData.json', 'utf8', (err: any, data: any) => {
      if (err) {
        console.error(err);
        return;
      }

      const parsedData = JSON.parse(data);
      mainWindow?.webContents.send(EChannels.loadedInitial, parsedData);
    });
  });

  ipcMain.on(EChannels.loadCalibration, (event, args) => {
    fs.readFile('./calibrationValues.json', 'utf8', (err: any, data: any) => {
      if (err) {
        console.error(err);
        return;
      }

      const parsedData = JSON.parse(data);
      mainWindow?.webContents.send(EChannels.loadedCalibration, parsedData);
    });
  });

  ipcMain.on(EChannels.saveCalibration, (event, args) => {
    fs.writeFile(
      './calibrationValues.json',
      JSON.stringify(args, null, 2),
      'utf-8',
      (err) => {
        if (err) {
          console.log('ERROR:', err);
          return;
        }
        mainWindow?.webContents.send(EChannels.calibrationDataSaved);
      }
    );
  });

  ipcMain.on(EChannels.saveInitials, (event, args) => {
    if (args) {
      console.log('stringify', JSON.stringify(args, null, 2));
      fs.writeFile(
        './initialData.json',
        JSON.stringify(args, null, 2),
        'utf-8',
        (err) => {
          if (err) {
            console.log('ERROR:', err);
            return;
          }
          mainWindow?.webContents.send(EChannels.initialsDataSaved);
        }
      );
    } else {
      console.log('ARGS is UNDEFINED');
    }
  });

  ipcMain.on(EChannels.saveProtocol, async (event, args) => {
    if (args) {
      const result = await dialog.showSaveDialog({
        title: 'Сохранить',
        filters: [
          {
            extensions: ['json'],
            name: '',
          },
        ],
      });

      if (!result.canceled) {
        if (result.filePath) {
          fs.writeFile(
            result.filePath,
            JSON.stringify(args, null, 2),
            'utf-8',
            (err) => {
              if (err) {
                console.log('ERROR:', err);
                return;
              }
            }
          );
        }
      }
    } else {
      console.log('ARGS is UNDEFINED');
    }
  });

  ipcMain.on(EChannels.loadProtocol, async (event, args) => {
    const result = await dialog.showOpenDialog({
      title: 'Открыть',
      filters: [
        {
          extensions: ['json'],
          name: '',
        },
      ],
      properties: ['openFile'],
    });

    if (!result.canceled) {
      if (result.filePaths.length > 0) {
        fs.readFile(result.filePaths[0], (err, data) => {
          if (err) {
            console.log('ERROR:', err);
            return;
          }
          if (data) {
            const resultJSONData = data.toString();

            const resultData = JSON.parse(resultJSONData);

            event.sender.send(EChannels.loadedProtocolData, resultData);
          }
        });
      }
    }
  });

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  let factor = screen.getPrimaryDisplay().scaleFactor;

  mainWindow = new BrowserWindow({
    show: false,
    width: 1624,
    height: 928,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      backgroundThrottling: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.webContents.setZoomFactor(1.0 / factor);
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
