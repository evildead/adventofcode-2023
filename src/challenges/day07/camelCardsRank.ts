/* eslint-disable security/detect-object-injection */
import _ from 'lodash';
import { getHighestAndLowestMapEntries } from '../../utilities';

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

export type CamelCardsRankResult = {
  hands: Array<CardHandRank>;
  totalWinnings: number;
};

interface CamelCardMatchStrategy {
  getCardsOrder(): Map<string, number>;
  getCardHandType(cards: string): CardHandType;
}

export class CamelCardClassicalMatch implements CamelCardMatchStrategy {
  private _cardsOrder: Map<string, number>;

  constructor() {
    this._cardsOrder = new Map<string, number>([
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
  }

  public getCardsOrder(): Map<string, number> {
    return this._cardsOrder;
  }

  public getCardHandType(cards: string): CardHandType {
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
}

export class CamelCardJokerMatch implements CamelCardMatchStrategy {
  private _cardsOrder: Map<string, number>;

  constructor() {
    this._cardsOrder = new Map<string, number>([
      ['A', 14],
      ['K', 13],
      ['Q', 12],
      ['T', 10],
      ['9', 9],
      ['8', 8],
      ['7', 7],
      ['6', 6],
      ['5', 5],
      ['4', 4],
      ['3', 3],
      ['2', 2],
      ['J', 1]
    ]);
  }

  public getCardsOrder(): Map<string, number> {
    return this._cardsOrder;
  }

  public getCardHandType(cards: string): CardHandType {
    const cardsMap: Map<string, number> = new Map<string, number>();
    let jokersFound = 0;
    for (const card of cards) {
      if (card === 'J') {
        ++jokersFound;
        continue;
      }
      const cardFrequency = cardsMap.get(card);
      if (cardFrequency !== undefined) {
        cardsMap.set(card, cardFrequency + 1);
      } else {
        cardsMap.set(card, 1);
      }
    }
    if (jokersFound > 0) {
      const highestAndLowestEntries = getHighestAndLowestMapEntries(cardsMap);
      if (!highestAndLowestEntries) {
        cardsMap.set('J', jokersFound);
      } else {
        cardsMap.set(highestAndLowestEntries.highest[0], highestAndLowestEntries.highest[1] + jokersFound);
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
}

export class CamelCardsRank {
  private _camelCardMatchStrategy: CamelCardMatchStrategy;

  private _hands: Array<CardHand>;

  constructor(camelCardsFileLines: Array<string>, camelCardMatchStrategy: CamelCardMatchStrategy) {
    this._camelCardMatchStrategy = camelCardMatchStrategy;
    this.setupInput(camelCardsFileLines);
  }

  public setStrategy(camelCardMatchStrategy: CamelCardMatchStrategy) {
    this._camelCardMatchStrategy = camelCardMatchStrategy;
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
      const handType = this._camelCardMatchStrategy.getCardHandType(cards);
      this._hands.push({
        cards,
        bidAmount,
        handType
      });
    }
  }

  public computeCardHandRank(): CamelCardsRankResult {
    const cardHands = _.cloneDeep(this._hands);
    cardHands.sort((a: CardHand, b: CardHand) => {
      if (a.handType === b.handType) {
        for (let cardIndex = 0; cardIndex < a.cards.length; cardIndex++) {
          const cardA = a.cards[cardIndex];
          const cardB = b.cards[cardIndex];
          if (cardA === cardB) {
            continue;
          }
          const cardAValue = this._camelCardMatchStrategy.getCardsOrder().get(cardA);
          const cardBValue = this._camelCardMatchStrategy.getCardsOrder().get(cardB);
          if (cardAValue === undefined || cardBValue === undefined) {
            throw new Error('Wrong card');
          }
          return cardAValue - cardBValue;
        }
        return 0;
      }
      return a.handType - b.handType;
    });
    const camelCardsRankResultPart1: CamelCardsRankResult = {
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
