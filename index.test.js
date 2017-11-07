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

  it('should handle distribution', () => {
    const oldHand = {"tableAddr":"0xc3588bc372e0679a6ade167549a45b8703736a9a","deck":[3,7,36,2,11,0,38,40,39,44,29,43,28,9,33,34,20,30,6,25,8,15,17,24,47,41,32,37,4,12,1,26,27,18,46,5,21,35,19,14,45,51,22,50,42,49,16,13,31,48,23,10],"changed":1510068851,"state":"preflop","preMaxBet":"2000000000000","sb":1000000000000,"handId":155,"lineup":[{"last":"B1VL.Akt4K9YNxVSfzJlxf9dGI4ceK3UOWZgyStvMJbyrFxM=.LM5T/BkO4MVy9CBO/q86onWBX0I5YLViXn0FK12pA7c=.G3NqmgAAAJsHAAAAAAPoAAAAAAAAAAAAAAAAAAAAAAA=","address":"0x32adb84cc8054048448a8696292c0c89030c554b"},{"last":"As9x.D79LhpGLf6sNoWOsDpSVeYbsfg9+K4jO+iR7xUp+wtw=.J5+XcgjhZ38xq8CnEHS6TSVvk4XA8vQrSNimWu2hCkw=.G3NqmgAAAJsCAAAAAAfQAAAAAAAAAAAAAAAAAAAAAAA=","address":"0x2db0a4ab8b4cdddbab77941dc47190cde11acf71"}],"dealer":0}; //eslint-disable-line
    const newHand = {"tableAddr":"0xc3588bc372e0679a6ade167549a45b8703736a9a","deck":[3,7,36,2,11,0,38,40,39,44,29,43,28,9,33,34,20,30,6,25,8,15,17,24,47,41,32,37,4,12,1,26,27,18,46,5,21,35,19,14,45,51,22,50,42,49,16,13,31,48,23,10],"changed":1510068851,"dealer":0,"state":"preflop","preMaxBet":"2000000000000","sb":1000000000000,"distribution":"FYYP.IVteTa2+2e1cIS34RlFae+nUSlEpSvUH5KT4sCwvYRg=.e3nf1jivRqIAJa93QbUjjM2JjZVi7ujMhc7w1Yk70Kg=.G3NqmgAAAJsVAAEBAAAAAAuaAAAAAAAAAAAAAAAAAAA=.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","lineup":[{"last":"B1VL.Akt4K9YNxVSfzJlxf9dGI4ceK3UOWZgyStvMJbyrFxM=.LM5T/BkO4MVy9CBO/q86onWBX0I5YLViXn0FK12pA7c=.G3NqmgAAAJsHAAAAAAPoAAAAAAAAAAAAAAAAAAAAAAA=","address":"0x32adb84cc8054048448a8696292c0c89030c554b"},{"last":"As9x.D79LhpGLf6sNoWOsDpSVeYbsfg9+K4jO+iR7xUp+wtw=.J5+XcgjhZ38xq8CnEHS6TSVvk4XA8vQrSNimWu2hCkw=.G3NqmgAAAJsCAAAAAAfQAAAAAAAAAAAAAAAAAAAAAAA=","address":"0x2db0a4ab8b4cdddbab77941dc47190cde11acf71"}],"handId":155}; //eslint-disable-line
    const stat = new Stat(sentry, null, web3);
    stat.proccessDbChange(oldHand, newHand);
  });

  afterEach(() => {
    if (sdb.select.restore) sdb.select.restore();
    if (dynamo.query.restore) dynamo.query.restore();
    if (http.request.restore) http.request.restore();
  });
});
