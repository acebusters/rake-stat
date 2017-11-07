// import _ from 'lodash';
import { Receipt, PokerHelper } from 'poker-helper';
import BigNumber from 'bignumber.js';
import { leavePositions, joinPositions, betUpdatePositions, isEmpty } from './utils';

let events = [];
const accounts = {};

export const EventTypes = {
  JOIN: 1,
  LEAVE: 2,
  BET: 3,
  DIST: 4,
};

export default class RakeStat {

  constructor(sentry, db, web3, logger) {
    this.sentry = sentry;
    this.db = db;
    this.web3 = web3;
    this.logger = logger;
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
        tasks.push(this.handleAccountUpdate(msgBody));
      }

      if (msgType === 'ContractEvent' && msgBody.event === 'Join') {
        tasks.push(this.handleJoin(msgBody));
      }
    } catch (e) {
      return [Promise.resolve(`json parse error: ${JSON.stringify(e)}`)];
    }


    return tasks;
  }

  async proccessDbChange(oldHand, newHand) {
    const { tableAddr } = oldHand;

    const leaves = leavePositions(oldHand, newHand);
    events = events.concat(leaves.map(pos => ({
      tableAddr,
      handId: newHand.handId,
      signerAddr: oldHand.lineup[pos].address,
      type: EventTypes.LEAVE,
      date: Date.now(),
    })));

    const joins = joinPositions(oldHand, newHand);
    events = events.concat(joins.map(pos => ({
      tableAddr,
      handId: newHand.handId,
      signerAddr: newHand.lineup[pos].address,
      type: EventTypes.JOIN,
      date: Date.now(),
    })));

    const betUpdates = betUpdatePositions(oldHand, newHand);
    events = events.concat(betUpdates.map(pos => ({
      tableAddr,
      handId: newHand.handId,
      signerAddr: newHand.lineup[pos].address,
      type: EventTypes.BET,
      date: Date.now(),
      receipt: newHand.lineup[pos].last,
    })));

    if (oldHand.distribution !== newHand.distribution) {
      const { outs } = Receipt.parse(newHand.distribution);
      const ph = new PokerHelper();
      const zeroRakeDist = ph.calcDistribution(
        newHand.lineup,
        newHand.state,
        newHand.cards,
        0,
        '0x00',
      );
      events = newHand.lineup.reduce((memo, seat, i) => {
        if (outs[i].gt(0)) {
          return [
            ...memo,
            {
              tableAddr,
              handId: newHand.handId,
              signerAddr: seat.address,
              type: EventTypes.DIST,
              value: outs[i].toString(),
              rake: new BigNumber(zeroRakeDist[seat.address]).sub(outs[0]).toString(),
            },
          ];
        }

        return memo;
      }, events);
    }

    return [];
  }

  async handleNewAccount({ accountId, signerAddr, proxyAddr, referral }) {
    // Need to get referral
    accounts[accountId] = { referral, signerAddr, proxyAddr };
  }

  async handleAccountUpdate({ accountId, signerAddr }) {
    // Need to get referral
    accounts[accountId].signerAddr = signerAddr;
  }

  getAccounts() {
    return accounts;
  }

  getEvents() {
    return events;
  }

}
