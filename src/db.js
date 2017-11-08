export const EventTypes = {
  JOIN: 1,
  LEAVE: 2,
  BET: 3,
  DIST: 4,
};

const events = [];
const accounts = {};

export default class Db {
  get accounts() {
    return accounts;
  }

  get events() {
    return events;
  }

  async addAccount({ accountId, signerAddr, proxyAddr, referral }) {
    accounts[accountId] = { referral, signerAddr, proxyAddr };
  }

  async updateAccount({ accountId, signerAddr }) {
    accounts[accountId].signerAddr = signerAddr;
  }

  async addBet(tableAddr, handId, signerAddr, receipt) {
    events.push({
      tableAddr,
      handId,
      signerAddr,
      receipt,
      type: EventTypes.BET,
      date: Date.now(),
    });
  }

  async addDist(tableAddr, handId, signerAddr, value, rake) {
    events.push({
      tableAddr,
      handId,
      signerAddr,
      value,
      rake,
      date: Date.now(),
      type: EventTypes.DIST,
    });
  }

  async addJoin(tableAddr, handId, signerAddr) {
    events.push({
      tableAddr,
      handId,
      signerAddr,
      type: EventTypes.JOIN,
      date: Date.now(),
    });
  }

  async addLeave(tableAddr, handId, signerAddr) {
    events.push({
      tableAddr,
      handId,
      signerAddr,
      type: EventTypes.LEAVE,
      date: Date.now(),
    });
  }
}
