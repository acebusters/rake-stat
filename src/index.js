import { leavePositions, joinPositions, betUpdatePositions, getDistributions } from './utils';

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
      const [
        msgType,
        // msgArg,
      ] = message.Subject.split('::');

      if (msgType === 'AccountCreated') {
        tasks.push(this.db.addAccount(msgBody));
      }

      if (msgType === 'AccountUpdated') {
        tasks.push(this.db.updateAccount(msgBody));
      }
    } catch (e) {
      return [Promise.resolve(`json parse error: ${JSON.stringify(e)}`)];
    }


    return tasks;
  }

  async proccessDbChange(oldHand, newHand) {
    const { tableAddr, handId } = newHand;

    const leaves = leavePositions(oldHand, newHand);
    const joins = joinPositions(oldHand, newHand);
    const betUpdates = betUpdatePositions(oldHand, newHand);
    const distributions = getDistributions(oldHand, newHand);

    return Promise.all([
      ...leaves.map(pos => this.db.addLeave(tableAddr, handId, oldHand.lineup[pos].address)),
      ...joins.map(pos => this.addJoin(tableAddr, handId, newHand.lineup[pos].address)),
      ...betUpdates.map(pos => this.addBet(
        tableAddr, handId,
        newHand.lineup[pos].address, newHand.lineup[pos].last,
      )),
      ...distributions.map(dist => this.db.addDist(
        tableAddr, handId,
        dist.address, dist.value, dist.rake,
      )),
    ]);
  }

  getAccounts() {
    return this.db.accounts;
  }

  getEvents() {
    return this.db.events;
  }

}
