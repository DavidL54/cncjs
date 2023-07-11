import { EventEmitter } from 'events';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import delay from './delay';
import log from './logger';
import x from './json-stringify';

// Validation
const DATABITS = Object.freeze([5, 6, 7, 8]);
const STOPBITS = Object.freeze([1, 2]);
const PARITY = Object.freeze(['none', 'even', 'mark', 'odd', 'space']);
const FLOWCONTROLS = Object.freeze(['rtscts', 'xon', 'xoff', 'xany']);

const defaultOptions = Object.freeze({
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  rtscts: false,
  xon: false,
  xoff: false,
  xany: false
});

const toIdent = (options) => {
  const { path, baudRate } = { ...options };
  const str = `serial|${path}|${baudRate}`;
  return Buffer.from(str).toString('hex');
};

class SerialConnection extends EventEmitter {
  type = 'serial';

  port = null;

  parser = null;

  pin = null; // { dtr: boolean, rts: boolean }

  writeFilter = (data) => data;

  eventListener = {
    data: (data) => {
      this.emit('data', data);
    },
    open: () => {
      this.emit('open');
    },
    close: (err) => {
      this.emit('close', err);
    },
    error: (err) => {
      this.emit('error', err);
    }
  };

  constructor(props) {
    super();

    const { pin, writeFilter, ...rest } = { ...props };

    if (pin) {
      this.pin = pin;
    }

    if (writeFilter) {
      if (typeof writeFilter !== 'function') {
        throw new TypeError(`"writeFilter" must be a function: ${writeFilter}`);
      }

      this.writeFilter = writeFilter;
    }

    const options = Object.assign({}, defaultOptions, rest);

    if (options.port) {
      throw new TypeError('"port" is an unknown option, did you mean "path"?');
    }

    if (!options.path) {
      throw new TypeError(`"path" is not defined: ${options.path}`);
    }

    if (options.baudrate) {
      throw new TypeError('"baudrate" is an unknown option, did you mean "baudRate"?');
    }

    if (typeof options.baudRate !== 'number') {
      throw new TypeError(`"baudRate" must be a number: ${options.baudRate}`);
    }

    if (DATABITS.indexOf(options.dataBits) < 0) {
      throw new TypeError(`"databits" is invalid: ${options.dataBits}`);
    }

    if (STOPBITS.indexOf(options.stopBits) < 0) {
      throw new TypeError(`"stopbits" is invalid: ${options.stopbits}`);
    }

    if (PARITY.indexOf(options.parity) < 0) {
      throw new TypeError(`"parity" is invalid: ${options.parity}`);
    }

    FLOWCONTROLS.forEach((control) => {
      if (typeof options[control] !== 'boolean') {
        throw new TypeError(`"${control}" is not boolean: ${options[control]}`);
      }
    });

    Object.defineProperties(this, {
      options: {
        enumerable: true,
        value: options,
        writable: false
      }
    });
  }

  get ident() {
    return toIdent(this.options);
  }

  get isOpen() {
    return this.port && this.port.isOpen;
  }

  get isClose() {
    return !this.isOpen;
  }

  // @param {function} callback The error-first callback.
  open(callback) {
    if (this.port) {
      const err = new Error(`Cannot open serial port "${this.options.path}"`);
      callback(err);
      return;
    }

    this.port = new SerialPort({
      ...this.options,
      autoOpen: false
    });
    this.port.on('open', this.eventListener.open);
    this.port.on('close', this.eventListener.close);
    this.port.on('error', this.eventListener.error);

    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
    this.parser.on('data', this.eventListener.data);

    this.port.open(async (...args) => {
      // This is an error-first callback
      const isError = !!args[0];

      if (!isError && this.pin) {
        let controlFlag = null;

        try {
          // Set DTR and RTS control flags if they exist
          if (typeof this.pin?.dtr === 'boolean') {
            controlFlag = {
              ...controlFlag,
              dtr: this.pin?.dtr,
            };
          }
          if (typeof this.pin?.rts === 'boolean') {
            controlFlag = {
              ...controlFlag,
              rts: this.pin?.rts,
            };
          }

          if (controlFlag) {
            await delay(100);
            await this.port.set(controlFlag);
            await delay(100);
          }
        } catch (err) {
          log.error(`An unexpected error occurred when setting the control flags: options=${x(this.options)}`);
          log.error(err.message);
        }
      }

      callback(...args);
    });
  }

  // @param {function} callback The error-first callback.
  close(callback) {
    if (!this.port) {
      const err = new Error(`Cannot close serial port "${this.options.path}"`);
      callback && callback(err);
      return;
    }

    this.port.removeListener('open', this.eventListener.open);
    this.port.removeListener('close', this.eventListener.close);
    this.port.removeListener('error', this.eventListener.error);
    this.parser.removeListener('data', this.eventListener.data);

    this.port.close(callback);

    this.port = null;
    this.parser = null;
  }

  write(data, context) {
    if (!this.port) {
      return;
    }

    data = this.writeFilter(data, context);

    this.port.write(data);
  }
}

export { toIdent };
export default SerialConnection;
