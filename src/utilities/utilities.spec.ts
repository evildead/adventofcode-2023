import { getHighestAndLowestMapEntries, isEven, isOdd, trimAny, getTextFileAsListOfLines } from './utilities';

describe('utilities', () => {
  describe('getHighestAndLowestMapEntries', () => {
    it('should return undefined for non Map values', async () => {
      expect(getHighestAndLowestMapEntries(null as any)).toBeUndefined();
      expect(getHighestAndLowestMapEntries(undefined as any)).toBeUndefined();
      expect(getHighestAndLowestMapEntries(54 as any)).toBeUndefined();
      expect(getHighestAndLowestMapEntries('str' as any)).toBeUndefined();
      expect(getHighestAndLowestMapEntries([] as any)).toBeUndefined();
      expect(getHighestAndLowestMapEntries({} as any)).toBeUndefined();
    });

    it('should return undefined for empty Map object', async () => {
      expect(getHighestAndLowestMapEntries(new Map<string, number>())).toBeUndefined();
    });

    it('should return correct values for non empty Map objects', async () => {
      const map01 = new Map<string, number>([
        ['A', 2],
        ['Q', 1],
        ['7', 0]
      ]);
      const res01 = getHighestAndLowestMapEntries(map01);
      expect(res01).toBeDefined();
      expect(res01?.highest[0]).toBe('A');
      expect(res01?.highest[1]).toBe(2);
      expect(res01?.lowest[0]).toBe('7');
      expect(res01?.lowest[1]).toBe(0);
    });
  });

  describe('isEven - isOdd', () => {
    it('both of them should return false for non integer values', async () => {
      expect(isEven(null as any)).toBe(false);
      expect(isOdd(null as any)).toBe(false);
      expect(isEven(undefined as any)).toBe(false);
      expect(isOdd(undefined as any)).toBe(false);
      expect(isEven(54.2 as any)).toBe(false);
      expect(isOdd(54.2 as any)).toBe(false);
      expect(isEven('str' as any)).toBe(false);
      expect(isOdd('str' as any)).toBe(false);
      expect(isEven([] as any)).toBe(false);
      expect(isOdd([] as any)).toBe(false);
      expect(isEven({} as any)).toBe(false);
      expect(isOdd({} as any)).toBe(false);
    });

    it('isEven should return true and isOdd should return false', async () => {
      expect(isEven(0)).toBe(true);
      expect(isOdd(0)).toBe(false);

      expect(isEven(2)).toBe(true);
      expect(isOdd(2)).toBe(false);

      expect(isEven(456)).toBe(true);
      expect(isOdd(456)).toBe(false);

      expect(isEven(284576294)).toBe(true);
      expect(isOdd(284576294)).toBe(false);
    });

    it('isEven should return false and isOdd should return true', async () => {
      expect(isEven(1)).toBe(false);
      expect(isOdd(1)).toBe(true);

      expect(isEven(3)).toBe(false);
      expect(isOdd(3)).toBe(true);

      expect(isEven(457)).toBe(false);
      expect(isOdd(457)).toBe(true);

      expect(isEven(284576295)).toBe(false);
      expect(isOdd(284576295)).toBe(true);
    });
  });

  describe('trimAny', () => {
    it('should return empty string if any parameter has a non-string value', async () => {
      expect(trimAny(null as any, 'eee')).toBe('');
      expect(trimAny('fkdshgf...', undefined as any)).toBe('');
      expect(trimAny(54.42365 as any, {} as any)).toBe('');
      expect(trimAny(new Set() as any, 'str')).toBe('');
      expect(trimAny('fgg..;;', [] as any)).toBe('');
      expect(trimAny({} as any, 'fgg..;;')).toBe('');
    });

    it('should correctly trim the string based on the separators', async () => {
      expect(trimAny('-&Ciao ciao>;;', '-&>;')).toBe('Ciao ciao');
      expect(trimAny('((((((Too many brackets))))))()', '()')).toBe('Too many brackets');
      expect(trimAny('          Where am I?         ...', ' .')).toBe('Where am I?');
      expect(trimAny('  Is it even useful? ', '')).toBe('  Is it even useful? ');
    });
  });

  describe('getTextFileAsListOfLines', () => {
    it('should return a correct array of lines', async () => {
      const fileLines = getTextFileAsListOfLines('src/utilities/testData/moreLinesText01.txt');
      expect(fileLines).toEqual(['Hello!', 'I', 'am', 'a', 'multiline', 'text', 'file', ':)']);
    });

    it('should throw exceptions if the file does not exist', async () => {
      expect(() => {
        getTextFileAsListOfLines('');
      }).toThrow();
      expect(() => {
        getTextFileAsListOfLines('./NonExistingFile.txt');
      }).toThrow();
      expect(() => {
        getTextFileAsListOfLines({} as any);
      }).toThrow();
      expect(() => {
        getTextFileAsListOfLines([] as any);
      }).toThrow();
      expect(() => {
        getTextFileAsListOfLines(5 as any);
      }).toThrow();
    });
  });
});
