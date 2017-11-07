import Raven from 'raven';
import { AttributeValue } from 'dynamodb-data-types';
// import request from 'request';
import Web3 from 'web3';

import Db from './src/db';
import RakeStat from './src/index';
import Logger from './src/logger';

exports.handler = async function handler(event, context, callback) {
  Raven.config(process.env.SENTRY_URL).install();
  const logger = new Logger(Raven, context.functionName, 'rake-stat');

  try {
    const web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider(process.env.PROVIDER_URL));

    const stat = new RakeStat(
      Raven,
      new Db(),
      web3,
      logger,
    );

    if (Array.isArray(event.Records)) {
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
      const path = event.context['resource-path'];

      if (path.indexOf('test') > -1) {
        const accounts = await stat.getAccounts();
        const events = await stat.getEvents();

        return callback(null, { accounts, events });
      }
    }
  } catch (err) {
    logger.exception(err).then(callback);
  }

  console.log('Context received:\n', JSON.stringify(context)); // eslint-disable-line no-console
  return callback(null, 'no action taken.');
};
