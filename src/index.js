import _ from 'lodash';
import BigNumber from 'bignumber.js';

const EMPTY_ADDR = '0x0000000000000000000000000000000000000000';
const ETH_DECIMALS = new BigNumber(10).pow(18);

const events = [];
const accounts = {};

export default class RakeStat {

  constructor(sentry, db, web3) {
    this.sentry = sentry;
    this.db = db;
    this.web3 = web3;
  }

  processMessage(message) {
    const tasks = [];

    if (!message.Subject || message.Subject.split('::').length < 2) {
      return [Promise.resolve(`unknown message type: ${message.Subject}`)];
    }

    try {
      const msgBody = (
        (message.Message && message.Message.length > 0)
          ? JSON.parse(message.Message)
          : ''
      );
      const [msgType, msgArg] = message.Subject.split('::');

      if (msgType === 'AccountCreated') {
        tasks.push(this.handleNewAccount(msgBody));
      }

      if (msgType === 'AccountUpdated') {
        tasks.push(this.handleNewAccount(msgBody));
      }
    } catch (e) {
      return [Promise.resolve(`json parse error: ${JSON.stringify(e)}`)];
    }


    return tasks;
  }

  proccessDbChange(record) {
    const newHand = AttributeValue.unwrap(record.NewImage);
    const keys = AttributeValue.unwrap(record.Keys);

    // detect distributions, bets, joins and leaves
    // how to store distributions? Maybe store the whole lineup in
  }

  async handleNewAccount({ accountId, signerAddr, proxyAddr, referral }) {
    // Need to get referral
    accounts[accountId] = { referral, signerAddr, proxyAddr };
  }

  async handleAccountUpdate({ accountId, signerAddr }) {
    // Need to get referral
    accounts[accountId].signerAddr = signerAddr;
  }

}
