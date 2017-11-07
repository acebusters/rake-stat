import Raven from 'raven';
import request from 'request';
import Web3 from 'web3';

import Db from './src/db';
import RakeStat from './src/index';

exports.handler = async function handler(event, context, callback) {
  try {
    Raven.config(process.env.SENTRY_URL).install();

    const web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider(process.env.PROVIDER_URL));

    const stat = new RakeStat(
      Raven,
      new Db(),
      web3,
    );

    if (Array.isArray(event.Records)) {
      const data = await Promise.all(
        event.Records.reduce((requests, record) => {
          if (record.Sns) {
            return requests.concat(stat.processMessage(record.Sns));
          } else if (record.dynamodb && (record.eventName === 'MODIFY' || record.eventName === 'INSERT')) {
            return request.concat(stat.proccessDbChange(record.dynamodb));
          }

          return requests;
        }, []),
      );
      return callback(null, data);
    }
  } catch (err) {
    Raven.captureException(err, { server_name: 'gas-stat' }, (sendErr) => {
      if (sendErr) {
        console.log(JSON.stringify(sendErr)); // eslint-disable-line no-console
        callback(sendErr);
        return;
      }
      callback(null, err);
    });
  }

  console.log('Context received:\n', JSON.stringify(context)); // eslint-disable-line no-console
  return callback(null, 'no action taken.');
};
