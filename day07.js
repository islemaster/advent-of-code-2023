const fs = require("node:fs/promises");

// y = x(1 - x)
// -x^2 + xk - m > 0 for how many values of x?

// Number of ways you can beat the record in each race

module.exports = async function (inputFile, partNumber) {
  class Hand {
    constructor(handStr) {
      const parts = handStr.split(' ');
      this.bid = parseInt(parts[1], 10);
      this.cards = parts[0].split('');
  
      // Group cards by label
      const countsByLabel = this.cards.reduce((m, n) => {
        m[n] = (m[n] ?? 0) + 1;
        return m;
      }, {});

      let jokerCount = 0;
      if (partNumber == 2) {
        // Remove jokers
        jokerCount = countsByLabel['J'] ?? 0;
        countsByLabel['J'] = 0;
      }

      // sort groups by count descending
      const cardCounts = Object.values(countsByLabel).sort().reverse();
      cardCounts[0] = cardCounts[0] + jokerCount;
  
      // Use group sizes to figure out hand type
      switch (cardCounts[0]) {
        case 5:
          this.type = HandType.FiveOfAKind;
          break;
        case 4:
          this.type = HandType.FourOfAKind;
          break;
        case 3:
          this.type = cardCounts[1] == 2 ? HandType.FullHouse : HandType.ThreeOfAKind;
          break;
        case 2:
          this.type = cardCounts[1] == 2 ? HandType.TwoPair : HandType.OnePair;
          break;
        default:
          this.type = HandType.HighCard;
      }
    }
  }
  
  const HandType = {
    HighCard: 0,
    OnePair: 1,
    TwoPair: 2,
    ThreeOfAKind: 3,
    FullHouse: 4,
    FourOfAKind: 5,
    FiveOfAKind: 6
  };
  
  const CardValues = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    T: 10,
    J: partNumber == 2 ? 1 : 11,
    Q: 12,
    K: 13,
    A: 14
  };
  
  function compareHands(a, b) {
    // console.log(`Comparing ${a.cards.join('')} to ${b.cards.join('')}`);
    if (a.type == b.type) {
      for (let i = 0; i < a.cards.length; i++) {
        const cardA = a.cards[i];
        const cardB = b.cards[i];
        if (a.cards[i] == b.cards[i]) continue;
        return CardValues[cardA] - CardValues[cardB];
      }
    } else {
      return a.type - b.type;
    }
  }

  const file = await fs.open(inputFile);
  const hands = [];
  for await (const line of file.readLines()) {
    hands.push(new Hand(line));
  }

  // Sort hands by strength
  hands.sort(compareHands);

  // Add up bids, multiplied by rank
  let winnings = 0;
  for (let rank = 1; rank <= hands.length; rank++) {
    const hand = hands[rank-1];
    winnings = winnings + hand.bid * rank;
    // console.log(`${hand.cards.join('')}   ${hand.type}   ${hand.bid}\t${winnings}`);
  }
  console.log(`Winnings: ${winnings}`);
};

