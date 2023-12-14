/* eslint-disable security/detect-object-injection */
import _ from 'lodash';

export enum CardHandType {
  FIVE_OF_A_KIND = 7,
  FOUR_OF_A_KIND = 6,
  FULL_HOUSE = 5,
  THREE_OF_A_KIND = 4,
  TWO_PAIR = 3,
  ONE_PAIR = 2,
  HIGH_CARD = 1
}

export interface CardHand {
  cards: string;
  bidAmount: number;
  handType: CardHandType;
}

export interface CardHandRank extends CardHand {
  rank: number;
}

export type CamelCardsRankResultPart1 = {
  hands: Array<CardHandRank>;
  totalWinnings: number;
};

export class CamelCardsRank {
  private static cardsOrder: Map<string, number> = new Map<string, number>([
    ['A', 14],
    ['K', 13],
    ['Q', 12],
    ['J', 11],
    ['T', 10],
    ['9', 9],
    ['8', 8],
    ['7', 7],
    ['6', 6],
    ['5', 5],
    ['4', 4],
    ['3', 3],
    ['2', 2]
  ]);

  private _hands: Array<CardHand>;

  constructor(camelCardsFileLines: Array<string>) {
    this.setupInput(camelCardsFileLines);
  }

  private setupInput(camelCardsFileLines: Array<string>) {
    this._hands = [];
    for (const camelCardsFileLine of camelCardsFileLines) {
      const trimmedLine = camelCardsFileLine.trim();
      if (trimmedLine.length < 1) {
        continue;
      }
      const cardsAndBidAmount = trimmedLine.split(/\s+/);
      if (cardsAndBidAmount.length < 2) {
        throw new Error('Wrong line format');
      }
      const cards = cardsAndBidAmount[0].trim();
      const bidAmount = Number(cardsAndBidAmount[1].trim());
      const handType = CamelCardsRank.getCardHandType(cards);
      this._hands.push({
        cards,
        bidAmount,
        handType
      });
    }
  }

  private static getCardHandType(cards: string): CardHandType {
    const cardsMap: Map<string, number> = new Map<string, number>();
    for (const card of cards) {
      const cardFrequency = cardsMap.get(card);
      if (cardFrequency !== undefined) {
        cardsMap.set(card, cardFrequency + 1);
      } else {
        cardsMap.set(card, 1);
      }
    }

    const frequencyValues = Array.from(cardsMap.values());
    switch (cardsMap.size) {
      case 1:
        return CardHandType.FIVE_OF_A_KIND;
      case 5:
        return CardHandType.HIGH_CARD;
      case 4:
        return CardHandType.ONE_PAIR;
      case 2: {
        if (frequencyValues.includes(4)) {
          return CardHandType.FOUR_OF_A_KIND;
        }
        return CardHandType.FULL_HOUSE;
      }
      case 3:
        if (frequencyValues.includes(3)) {
          return CardHandType.THREE_OF_A_KIND;
        }
        return CardHandType.TWO_PAIR;

      default:
        throw new Error('Wrong size of card hand');
    }
  }

  public computeCardHandRank(): CamelCardsRankResultPart1 {
    const cardHands = _.cloneDeep(this._hands);
    cardHands.sort((a: CardHand, b: CardHand) => {
      if (a.handType === b.handType) {
        for (let cardIndex = 0; cardIndex < a.cards.length; cardIndex++) {
          const cardA = a.cards[cardIndex];
          const cardB = b.cards[cardIndex];
          if (cardA === cardB) {
            continue;
          }
          const cardAValue = CamelCardsRank.cardsOrder.get(cardA);
          const cardBValue = CamelCardsRank.cardsOrder.get(cardB);
          if (cardAValue === undefined || cardBValue === undefined) {
            throw new Error('Wrong card');
          }
          return cardAValue - cardBValue;
        }
        return 0;
      }
      return a.handType - b.handType;
    });
    const camelCardsRankResultPart1: CamelCardsRankResultPart1 = {
      hands: [],
      totalWinnings: 0
    };
    for (let cardHandIndex = 0; cardHandIndex < cardHands.length; cardHandIndex++) {
      const cardHand = cardHands[cardHandIndex];
      const currCardHandRank: CardHandRank = {
        cards: cardHand.cards,
        bidAmount: cardHand.bidAmount,
        handType: cardHand.handType,
        rank: cardHandIndex + 1
      };
      camelCardsRankResultPart1.hands.push(currCardHandRank);
      camelCardsRankResultPart1.totalWinnings += currCardHandRank.bidAmount * currCardHandRank.rank;
    }
    return camelCardsRankResultPart1;
  }
}
