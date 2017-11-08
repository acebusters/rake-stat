import Raven from 'raven';
import { AttributeValue } from 'dynamodb-data-types';
// import request from 'request';
import Web3 from 'web3';
import mysql from 'mysql';

import Db from './src/db';
import RakeStat from './src/index';
import Logger from './src/logger';

function connect(connection) {
  return new Promise((resolve, reject) => {
    // logger.log('connecting');
    connection.connect((err) => {
      if (err) {
        // logger.log(err);
        reject(err);
      } else {
        // logger.log('connected');
        resolve();
      }
    });
  });
}

exports.handler = async function handler(event, context, callback) {
  Raven.config(process.env.SENTRY_URL).install();
  const logger = new Logger(Raven, context.functionName, 'rake-stat');

  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider(process.env.PROVIDER_URL));

    const stat = new RakeStat(
      Raven,
      new Db(connection, process.env.MYSQL_EVENTS_TABLE, process.env.MYSQL_ACCOUNTS_TABLE),
      web3,
      logger,
    );

    if (Array.isArray(event.Records)) {
      await connect(connection, logger);
      const data = await Promise.all(
        event.Records.reduce((requests, record) => {
          if (record.Sns) {
            return requests.concat(stat.processMessage(record.Sns));
          } else if (record.dynamodb && (record.eventName === 'MODIFY')) {
            const oldHand = AttributeValue.unwrap(record.dynamodb.OldImage);
            const newHand = AttributeValue.unwrap(record.dynamodb.NewImage);
            return requests.concat(stat.proccessDbChange(oldHand, newHand));
          }

          return requests;
        }, []),
      );
      return callback(null, data);
    } else if (event.context && event.context['resource-path']) {
      await connect(connection, logger);
      const path = event.context['resource-path'];

      if (path.indexOf('test') > -1) {
        const accounts = await stat.getAccounts();
        const events = await stat.getEvents();

        return callback(null, { accounts, events });
      }
    }
  } catch (err) {
    logger.exception(err).then(callback);
  } finally {
    // connection.end();
  }


  console.log('Context received:\n', JSON.stringify(context)); // eslint-disable-line no-console
  return callback(null, 'no action taken.');
};
