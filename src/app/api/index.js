import _get from 'lodash/get';
import { ensureArray } from 'ensure-type';
import superagent from 'superagent';
import superagentUse from 'superagent-use';
import axios from '@app/api/axios';
import controller from '@app/lib/controller';
import config from '@app/store/config';

const bearer = (request) => {
  const token = config.get('session.token');
  if (token) {
    request.set('Authorization', 'Bearer ' + token);
  }
};

// Modify request headers and query parameters to prevent caching
const noCache = (request) => {
  const now = Date.now();
  request.set('Cache-Control', 'no-cache');
  request.set('X-Requested-With', 'XMLHttpRequest');

  if (request.method === 'GET' || request.method === 'HEAD') {
    // Force requested pages not to be cached by the browser by appending "_={timestamp}" to the GET parameters, this will work correctly with HEAD and GET requests. The parameter is not needed for other types of requests, except in IE8 when a POST is made to a URL that has already been requested by a GET.
    request._query = ensureArray(request._query);
    request._query.push(`_=${now}`);
  }
};

const authrequest = superagentUse(superagent);
authrequest.use(bearer);
authrequest.use(noCache);

//
// Authentication
//
const signin = (options) => new Promise((resolve, reject) => {
  const { token, name, password } = { ...options };

  authrequest
    .post('/api/signin')
    .send({ token, name, password })
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

/**
 * State
 */
const getState = async (config) => {
  const url = 'api/state';
  const response = await axios.get(url, config);
  return response.data;
};

const setState = async (data, config) => {
  const url = 'api/state';
  const response = await axios.post(url, data, config);
  return response.data;
};

const unsetState = async (config) => {
  const url = 'api/state';
  const response = await axios.delete(url, config);
  return response.data;
};

/**
 * System
 */
const getSystemInformation = async (config) => {
  const url = 'api/system/info';
  const response = await axios.get(url, config);
  return response.data;
};

//
// G-code
//
const loadGCode = (meta, context) => new Promise((resolve, reject) => {
  const ident = _get(controller, 'connection.ident');

  authrequest
    .post('/api/gcode')
    .send({ ident, meta, context })
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

const fetchGCode = () => new Promise((resolve, reject) => {
  const ident = _get(controller, 'connection.ident');

  authrequest
    .get('/api/gcode')
    .query({ ident })
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

const downloadGCode = () => {
  const ident = _get(controller, 'connection.ident');

  const $form = document.createElement('form');
  $form.setAttribute('id', 'export');
  $form.setAttribute('method', 'POST');
  $form.setAttribute('enctype', 'multipart/form-data');
  $form.setAttribute('action', 'api/gcode/download');

  const $ident = document.createElement('input');
  $ident.setAttribute('name', 'ident');
  $ident.setAttribute('value', ident);

  const $token = document.createElement('input');
  $token.setAttribute('name', 'token');
  $token.setAttribute('value', config.get('session.token'));

  $form.appendChild($ident);
  $form.appendChild($token);

  document.body.append($form);
  $form.submit();
  document.body.removeChild($form);
};

//
// Controllers
//
const controllers = {};

controllers.get = () => new Promise((resolve, reject) => {
  authrequest
    .get('/api/controllers')
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

//
// Watch Directory
//
const watch = {};

watch.getFiles = (options) => new Promise((resolve, reject) => {
  const { path } = { ...options };

  authrequest
    .post('/api/watch/files')
    .send({ path })
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

watch.readFile = (options) => new Promise((resolve, reject) => {
  const { file } = { ...options };

  authrequest
    .post('/api/watch/file')
    .send({ file })
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

//
// Users
//
const users = {};

users.fetch = (options) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/users')
    .query(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

users.create = (options) => new Promise((resolve, reject) => {
  authrequest
    .post('/api/users')
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

users.read = (id) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/users/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

users.delete = (id) => new Promise((resolve, reject) => {
  authrequest
    .delete('/api/users/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

users.update = (id, options) => new Promise((resolve, reject) => {
  authrequest
    .put('/api/users/' + id)
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

//
// Events
//
const events = {};

events.fetch = (options) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/events')
    .query(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

events.create = (options) => new Promise((resolve, reject) => {
  authrequest
    .post('/api/events')
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

events.read = (id) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/events/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

events.delete = (id) => new Promise((resolve, reject) => {
  authrequest
    .delete('/api/events/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

events.update = (id, options) => new Promise((resolve, reject) => {
  authrequest
    .put('/api/events/' + id)
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

//
// MDI
//
const mdi = {};

mdi.fetch = (options) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/mdi')
    .query(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

mdi.create = (options) => new Promise((resolve, reject) => {
  authrequest
    .post('/api/mdi')
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

mdi.read = (id) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/mdi/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

mdi.update = (id, options) => new Promise((resolve, reject) => {
  authrequest
    .put('/api/mdi/' + id)
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

mdi.bulkUpdate = (options) => new Promise((resolve, reject) => {
  authrequest
    .put('/api/mdi/')
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

mdi.delete = (id) => new Promise((resolve, reject) => {
  authrequest
    .delete('/api/mdi/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

//
// Commands
//
const commands = {};

commands.fetch = (options) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/commands')
    .query(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

commands.create = (options) => new Promise((resolve, reject) => {
  authrequest
    .post('/api/commands')
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

commands.read = (id) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/commands/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

commands.update = (id, options) => new Promise((resolve, reject) => {
  authrequest
    .put('/api/commands/' + id)
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

commands.delete = (id) => new Promise((resolve, reject) => {
  authrequest
    .delete('/api/commands/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

commands.run = (id) => new Promise((resolve, reject) => {
  authrequest
    .post('/api/commands/' + id + '/run')
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

//
// Machines
//
const machines = {};

machines.fetch = (options) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/machines')
    .query(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

machines.create = (options) => new Promise((resolve, reject) => {
  authrequest
    .post('/api/machines')
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

machines.read = (id) => new Promise((resolve, reject) => {
  authrequest
    .get('/api/machines/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

machines.update = (id, options) => new Promise((resolve, reject) => {
  authrequest
    .put('/api/machines/' + id)
    .send(options)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

machines.delete = (id) => new Promise((resolve, reject) => {
  authrequest
    .delete('/api/machines/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

machines.run = (id) => new Promise((resolve, reject) => {
  authrequest
    .post('/api/machines/run/' + id)
    .end((err, res) => {
      if (err) {
        reject(res);
      } else {
        resolve(res);
      }
    });
});

export default {
  // State
  getState,
  setState,
  unsetState,

  // System
  getSystemInformation,

  // G-code
  loadGCode,
  fetchGCode,
  downloadGCode,

  // Authentication
  signin,

  // Controllers
  controllers,

  // Watch Directory
  watch,

  // Settings
  commands,
  events,
  machines,
  mdi,
  users,
};
