export const EventTypes = {
  JOIN: 1,
  LEAVE: 2,
  BET: 3,
  DIST: 4,
};

export default class Db {
  constructor(connection, eventsTable, accountsTable) {
    this.connection = connection;
    this.eventsTable = eventsTable;
    this.accountsTable = accountsTable;
  }

  async addAccount({ accountId, signerAddr, proxyAddr, referral }) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        `INSERT INTO \`${this.accountsTable}\` VALUES('${accountId}', '${signerAddr}', '${proxyAddr}', '${referral}')`,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  }

  async updateAccount({ accountId, signerAddr }) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        `UPDATE \`${this.accountsTable}\` SET signerAddr='${signerAddr}' WHERE id='${accountId}'`,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  }

  async addBet(tableAddr, handId, signerAddr, receipt) {
    return this.addEvent(
      EventTypes.BET,
      tableAddr, handId, signerAddr, null, receipt,
    );
  }

  async addDist(...args) { // tableAddr, handId, signerAddr, value, rake
    return this.addEvent(
      EventTypes.DIST,
      ...args,
    );
  }

  async addJoin(...args) { // tableAddr, handId, signerAddr
    return this.addEvent(
      EventTypes.JOIN,
      ...args,
    );
  }

  async addLeave(...args) { // tableAddr, handId, signerAddr
    return this.addEvent(
      EventTypes.LEAVE,
      ...args,
    );
  }

  addEvent(type, tableAddr, handId, signerAddr, amount = 0, meta = '') {
    const now = Math.round(Date.now() / 1000);
    return new Promise((resolve, reject) => {
      this.connection.query(
        `INSERT INTO
          \`${this.eventsTable}\`
        VALUES(
          '${tableAddr}',
          ${handId},
          '${signerAddr}',
          ${type},
          ${now},
          ${amount},
          '${meta}'
        ) ON DUPLICATE KEY UPDATE date=${now}, amount=${amount}, meta='${meta}'
        `,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  }
}
