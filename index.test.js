import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { it, describe, afterEach } from 'mocha';

import Stat from './src/index';

chai.use(sinonChai);

const sentry = {
  captureMessage() {
  },
  captureException() {
  },
};

const dynamo = {
  getItem() {},
  putItem() {},
  query() {},
  updateItem() {},
  deleteItem() {},
};

const sdb = {
  getAttributes() {},
  putAttributes() {},
  deleteAttributes() {},
  select() {},
};

const http = {
  request() {},
};

const web3 = {
  eth: {
    getBlockNumber() {},
  },
};

describe('Stat', () => {
  it('should handle AccountCreated event', async () => {
    const stat = new Stat(sentry, null, web3);
    await stat.processMessage({
      Subject: 'AccountCreated::0x000',
      Message: JSON.stringify({
        proxyAddr: '0x00001',
        signerAddr: '0x000',
        accountId: '000-000-00',
        referral: '000-000-00',
        email: 'isuntc@gmail.com',
      }),
    });
  });

  it('should handle AccountUpdated event', async () => {
    const stat = new Stat(sentry, null, web3);
    await stat.processMessage({
      Subject: 'AccountUpdated::0x000',
      Message: JSON.stringify({
        signerAddr: '0x000',
        accountId: '000-000-00',
      }),
    });
  });

  it('should handle AccountUpdated event');

  it('should handle table join');

  it('should handle table leave');

  it('should handle bet');

  it('should handle distribution');

  afterEach(() => {
    if (sdb.select.restore) sdb.select.restore();
    if (dynamo.query.restore) dynamo.query.restore();
    if (http.request.restore) http.request.restore();
  });
});
