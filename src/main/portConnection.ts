import { PortInfo } from '@serialport/bindings-cpp';
import { SerialPort } from 'serialport';
import IpcMainEvent = Electron.IpcMainEvent;
import { AutoDetectTypes } from '@serialport/bindings-cpp';
import { DelimiterParser } from '@serialport/parser-delimiter';

export async function tryConnect(ports: PortInfo[]) {
  let message = '';
  let timerId: string | number | NodeJS.Timeout | undefined = undefined;
  let result: SerialPort<AutoDetectTypes> | null = null;

  for (const port of ports) {
    const serial = new SerialPort({
      path: port.path,
      baudRate: 9600,
    });
    const currentParser = serial.pipe(new DelimiterParser({ delimiter: '\n' }));
    result = await new Promise<SerialPort<AutoDetectTypes> | null>(
      (resolve) => {
        currentParser.once('data', (data) => {
          console.log('data.toString()', data.toString());
          if (data.toString().includes('CONNECTED')) {
            clearTimeout(timerId);
            console.log('data: CONNECTED', data.toString());
            message = 'CONNECTED';
            // serial.write('9') // 9 - sending to Arduino and saying that we connected
            resolve(serial);
          } else {
            console.log('resolve null', serial.path);
            serial.isOpen && serial.close();
            resolve(null);
          }
        });

        timerId = setTimeout(() => {
          console.log('timeout serial path', serial.path);
          serial.isOpen && serial.close();
          resolve(null);
        }, 3000);
      }
    );

    if (result) {
      break;
    }
  }

  return result;
}

export async function getPort(event: IpcMainEvent) {
  const ports = await SerialPort.list();
  console.log('ports', ports.length);
  let connectedPort: SerialPort<AutoDetectTypes> | null = null;
  console.log('CONNECTION ARDUINO');
  try {
    connectedPort = await tryConnect(ports);
    if (connectedPort) {
      console.log(`port ${connectedPort.path} is conneccted`);
      event.sender.send('serial-channel', 'serial:valve_controller_connected');
    } else {
      event.sender.send('serial-channel', 'serial:valve_controller_not-found');
    }
  } catch (e) {
    console.log('ERROR:', e);
  }
  const parser = connectedPort?.pipe(new DelimiterParser({ delimiter: '\n' }));
  return { connectedPort, parser };
  // return connectedPort;
}

export const promisedSerialCo2OnData = (
  serialPort: SerialPort<AutoDetectTypes>
) => {
  let connectedData = '';
  return Promise.race([
    new Promise((resolve, reject) => {
      let timerId: string | number | NodeJS.Timeout | undefined;

      const listener = (chunk: any) => {
        connectedData += chunk.toString();
        clearTimeout(timerId);
        timerId = setTimeout(() => {
          resolve(connectedData);
          connectedData = '';
          serialPort.removeListener('data', listener);
        }, 500);
      };

      serialPort.addListener('data', listener);
    }),
    new Promise((resolve) => {
      setTimeout(() => {
        resolve('EMPTY');
      }, 2500);
    }),
  ]);
};

const sendToPortDataWithDelay = (serial: SerialPort<AutoDetectTypes>) => {
  setTimeout(() => {
    try {
      const writeResult = serial.write('@RR00\r\n');
    } catch (e) {
      console.log(`error: unebale to write to pots ${serial.path}`, e);
    }
  }, 200);
};

export async function tryConnectToCo2Port(ports: PortInfo[]) {
  let foundSerial: SerialPort<AutoDetectTypes> | undefined = undefined;
  for (const port of ports) {
    const serial = new SerialPort({
      path: port.path,
      baudRate: 9600,
    });
    console.log('Co2 serial path', serial.path);
    sendToPortDataWithDelay(serial);

    try {
      const result = (await promisedSerialCo2OnData(serial)) as string;
      console.log('co2 port result', result);

      // if (result === 'EMPTY') {
      //   if (serial.isOpen) {
      //     serial.close();
      //   }
      // }

      if (result.includes('@RA00 TEST-OK')) {
        console.log('WRITE SERIAL');
        foundSerial = serial;
        break;
      }
    } catch (e) {
      console.log('error connect co2 port', e);
    }
  }
  console.log(111);
  return foundSerial;
}

export async function getCo2Port(event: IpcMainEvent) {
  const ports = await SerialPort.list();
  console.log('CONNECTION SENSOR');
  const connectedPort = await tryConnectToCo2Port(ports);
  if (connectedPort) {
    event.sender.send('serial-channel', 'serial:co2_sensor_connected');
  } else {
    event.sender.send('serial-channel', 'serial:co2_sensor_not-found');
  }
  return connectedPort ?? null;
}
