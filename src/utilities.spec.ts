import { getHighestAndLowestMapEntries } from './utilities';

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
});
