import { Receipt, PokerHelper } from 'poker-helper';
import BigNumber from 'bignumber.js';

const indecies = arr => arr.map((_, i) => i);

export const EMPTY_ADDR = '0x0000000000000000000000000000000000000000';

export const isEmpty = seat => seat.address === EMPTY_ADDR;

export const leavePositions = (oldHand, newHand) => (
  indecies(newHand.lineup)
    .filter(i => isEmpty(newHand.lineup[i]) && !isEmpty(oldHand.lineup[i]))
);

export const joinPositions = (oldHand, newHand) => (
  indecies(newHand.lineup)
    .filter(i => !isEmpty(newHand.lineup[i]) && isEmpty(oldHand.lineup[i]))
);

export const betUpdatePositions = (oldHand, newHand) => (
  indecies(newHand.lineup)
    .filter(i => oldHand.lineup[i].last !== newHand.lineup[i].last)
);

export const getDistributions = (oldHand, newHand) => {
  if (oldHand.distribution !== newHand.distribution) {
    const { outs } = Receipt.parse(newHand.distribution);
    const ph = new PokerHelper();
    const zeroRakeDist = ph.calcDistribution(newHand.lineup, newHand.state, newHand.cards, 0);
    return (
      indecies(newHand.lineup)
        .filter(i => outs[i].gt(0))
        .map(i => ({
          address: newHand.lineup[i].address,
          value: outs[i].toString(),
          rake: new BigNumber(zeroRakeDist[newHand.lineup[i].address]).sub(outs[0]).toString(),
        }))
    );
  }

  return [];
};
