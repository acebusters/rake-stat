const indecies = arr => arr.map((_, i) => i);

export const EMPTY_ADDR = '0x0000000000000000000000000000000000000000';

const isEmpty = seat => seat.address === EMPTY_ADDR;

export const leavePositions = (oldHand, newHand) => (
  indecies(newHand.lineup)
    .filter(i => isEmpty(newHand.lineup[i]) && !isEmpty(oldHand.lineup[i]))
);

export const joinPositions = (oldHand, newHand) => (
  indecies(newHand.lineup)
    .filter(i => !isEmpty(newHand.lineup[i]) && isEmpty(oldHand.lineup[i]))
);
