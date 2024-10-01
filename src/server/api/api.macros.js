import { ensureArray, ensureFiniteNumber } from 'ensure-type';
import * as json2csv from 'json2csv';
import _find from 'lodash/find';
import _isPlainObject from 'lodash/isPlainObject';
import _values from 'lodash/values';
import { v4 as uuidv4 } from 'uuid';
import settings from '../config/settings';
import x from '../lib/json-stringify';
import logger from '../lib/logger';
import serviceContainer from '../service-container';
import { getPagingRange } from './shared/paging';
import {
  ERR_BAD_REQUEST,
  ERR_NOT_FOUND,
  ERR_INTERNAL_SERVER_ERROR
} from '../constants';

const userStore = serviceContainer.resolve('userStore');

const log = logger('api:macros');

const CONFIG_KEY = 'macros';

const getSanitizedRecords = () => {
  const records = ensureArray(userStore.get(CONFIG_KEY));

  let shouldUpdate = false;
  for (let i = 0; i < records.length; ++i) {
    if (!_isPlainObject(records[i])) {
      records[i] = {};
    }

    const record = records[i];

    if (!record.id) {
      record.id = uuidv4();
      shouldUpdate = true;
    }
  }

  if (shouldUpdate) {
    log.debug(`update sanitized records: ${JSON.stringify(records)}`);

    // Pass `{ silent changes }` will suppress the change event
    userStore.set(CONFIG_KEY, records, { silent: true });
  }

  return records;
};

export const fetch = (req, res) => {
  const records = getSanitizedRecords();
  const paging = !!req.query.paging;

  if (paging) {
    const { page = 1, pageLength = 10 } = req.query;
    const totalRecords = records.length;
    const [begin, end] = getPagingRange({ page, pageLength, totalRecords });
    const pagedRecords = records.slice(begin, end);

    res.send({
      pagination: {
        page: ensureFiniteNumber(page),
        pageLength: ensureFiniteNumber(pageLength),
        totalRecords: ensureFiniteNumber(totalRecords)
      },
      records: pagedRecords.map(record => {
        const { id, mtime, name, content } = { ...record };
        return { id, mtime, name, content };
      })
    });
  } else {
    res.send({
      records: records.map(record => {
        const { id, mtime, name, content } = { ...record };
        return { id, mtime, name, content };
      })
    });
  }
};

export const __export = (req, res) => {
  const records = getSanitizedRecords();
  const paging = !!req.query.paging;
  const { filename = 'macros.csv' } = { ...req.body };
  const fieldMap = {
    id: 'ID',
    mtime: 'Date Modified',
    name: 'Name',
    content: 'Content',
  };
  const fields = _values(fieldMap);

  res.set('Expires', 0);
  res.set('Content-Type', 'text/csv');
  res.set('Content-Transfer-Encoding', 'binary');
  res.set('Pragma', 'no-cache');
  res.set('Content-Disposition', `attachment; filename=${JSON.stringify(filename)}`);

  if (paging) {
    const { page = 1, pageLength = 10 } = req.query;
    const totalRecords = records.length;
    const [begin, end] = getPagingRange({ page, pageLength, totalRecords });
    const data = records
      .slice(begin, end)
      .map(x => ({
        [fieldMap.id]: x.id,
        [fieldMap.mtime]: new Date(x.mtime).toISOString(),
        [fieldMap.name]: x.name,
        [fieldMap.content]: x.content,
      }));
    const csv = json2csv.parse(data, { fields });
    res.send(csv).end();
  } else {
    const data = records
      .map(x => ({
        [fieldMap.id]: x.id,
        [fieldMap.mtime]: new Date(x.mtime).toISOString(),
        [fieldMap.name]: x.name,
        [fieldMap.content]: x.content,
      }));
    const csv = json2csv.parse(data, { fields });
    res.send(csv).end();
  }
};

export const create = (req, res) => {
  const { name, content } = { ...req.body };

  if (!name) {
    res.status(ERR_BAD_REQUEST).send({
      msg: 'The "name" parameter must not be empty'
    });
    return;
  }

  if (!content) {
    res.status(ERR_BAD_REQUEST).send({
      msg: 'The "content" parameter must not be empty'
    });
    return;
  }

  try {
    const records = getSanitizedRecords();
    const record = {
      id: uuidv4(),
      mtime: new Date().getTime(),
      name: name,
      content: content
    };

    records.push(record);
    userStore.set(CONFIG_KEY, records);

    res.send({ err: null });
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: `Failed to update ${x(settings.rcfile)}`,
    });
  }
};

export const read = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = _find(records, { id: id });

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found'
    });
    return;
  }

  const { mtime, name, content } = { ...record };
  res.send({ id, mtime, name, content });
};

export const update = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = _find(records, { id: id });

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found'
    });
    return;
  }

  const {
    name = record.name,
    content = record.content
  } = { ...req.body };

  /*
    if (!name) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'The "name" parameter must not be empty'
        });
        return;
    }

    if (!content) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'The "content" parameter must not be empty'
        });
        return;
    }
    */

  try {
    record.mtime = new Date().getTime();
    record.name = String(name || '');
    record.content = String(content || '');

    userStore.set(CONFIG_KEY, records);

    res.send({ err: null });
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: `Failed to update ${x(settings.rcfile)}`,
    });
  }
};

export const __delete = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = _find(records, { id: id });

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found'
    });
    return;
  }

  try {
    const filteredRecords = records.filter(record => {
      return record.id !== id;
    });
    userStore.set(CONFIG_KEY, filteredRecords);

    res.send({ err: null });
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: `Failed to update ${x(settings.rcfile)}`,
    });
  }
};
