import { DanMatrix } from './danMatrix';

describe('Matrix', () => {
  it('check the constructor with correct parameters', async () => {
    const myMatrix01 = new DanMatrix<number>();
    expect(myMatrix01.rowsNum()).toBe(0);
    expect(myMatrix01.colsNum()).toBe(0);

    const myMatrix02 = new DanMatrix<number>({
      rows: 2,
      columns: 3,
      val: 7
    });
    expect(myMatrix02.rowsNum()).toBe(2);
    expect(myMatrix02.colsNum()).toBe(3);

    const myMatrix03 = new DanMatrix<number>([
      [763, 23, 87, 123],
      [244, 68563, 1, 557]
    ]);
    expect(myMatrix03.rowsNum()).toBe(2);
    expect(myMatrix03.colsNum()).toBe(4);
  });

  it('check the constructor with wrong parameters - should throw exceptions', async () => {
    expect(() => {
      const myMatrix = new DanMatrix<number>({
        columns: 4,
        rows: -2,
        val: 15
      });
    }).toThrow();

    expect(() => {
      const myMatrix = new DanMatrix<number>({
        columns: -4,
        rows: 45,
        val: -5
      });
    }).toThrow();

    expect(() => {
      const myMatrix = new DanMatrix<number>({
        columns: 65.9,
        rows: 87,
        val: 0
      });
    }).toThrow();

    expect(() => {
      const myMatrix = new DanMatrix<number>([
        [45, 232, 87567, 3434],
        [2424, 685643, 1555, 5857],
        [45, 232, 87567, 3434, 3624],
        [242, 6853, 155, 587]
      ]);
    }).toThrow();

    expect(() => {
      const myMatrix = new DanMatrix<number>([[244, 68563, 1, 557], 4, 7, 'ddfg'] as any);
    }).toThrow();
  });

  it('should throw exceptions if wrong parameters are passed to setupMatrix', async () => {
    expect(() => {
      const myMatrix = new DanMatrix<number>();
      myMatrix.setupMatrix({
        columns: -1,
        rows: 9,
        val: 0
      });
    }).toThrow();

    expect(() => {
      const myMatrix = new DanMatrix<number>();
      myMatrix.setupMatrix({
        columns: 0,
        rows: 9,
        val: 0
      });
    }).toThrow();

    expect(() => {
      const myMatrix = new DanMatrix<number>();
      myMatrix.setupMatrix({
        columns: 12,
        rows: 9.5,
        val: 3476
      });
    }).toThrow();

    expect(() => {
      const myMatrix = new DanMatrix<number>();
      myMatrix.setupMatrix([
        [763, 23, 87],
        [244, 68563, 1, 557]
      ]);
    }).toThrow();

    expect(() => {
      const myMatrix = new DanMatrix<number>();
      myMatrix.setupMatrix(['a', [244, 68563, 1, 557]] as any);
    }).toThrow();
  });

  it('check the getters and setters', async () => {
    const myMatrix01 = new DanMatrix<string>({
      rows: 2,
      columns: 3,
      val: '@'
    });
    expect(myMatrix01.rowsNum()).toBe(2);
    expect(myMatrix01.colsNum()).toBe(3);
    expect(myMatrix01.get(1, 2)).toBe('@');
    expect(myMatrix01.getCoord('0-1')).toBe('@');
    expect(myMatrix01.get(2, 2)).toBeUndefined();

    const myMatrix02 = new DanMatrix<number>([
      [763, 23, 87, 123],
      [244, 68563, 1, 557]
    ]);
    expect(myMatrix02.rowsNum()).toBe(2);
    expect(myMatrix02.colsNum()).toBe(4);
    expect(myMatrix02.get(1, 2)).toBe(1);
    expect(myMatrix02.getCoord('0-1')).toBe(23);
    expect(myMatrix02.get(5, 9)).toBeUndefined();

    const myMatrix03 = new DanMatrix<string>([
      ['a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaa'],
      ['b', 'bb', 'bbb', 'bbbb', 'bbbbb', 'bbbbbb'],
      ['c', 'cc', 'ccc', 'cccc', 'ccccc', 'cccccc']
    ]);
    expect(myMatrix03.rowsNum()).toBe(3);
    expect(myMatrix03.colsNum()).toBe(6);
    expect(myMatrix03.get(1, 2)).toBe('bbb');
    expect(myMatrix03.getCoord('0-1')).toBe('aa');
    expect(myMatrix03.get(5, 9)).toBeUndefined();
    expect(myMatrix03.set(4, 4, 'eeeee')).toBeUndefined();
    expect(myMatrix03.getCoord('2-5')).toBe('cccccc');
    expect(myMatrix03.setCoord('2-5', 'CCCCCC')).toBe('CCCCCC');
    expect(myMatrix03.get(2, 5)).toBe('CCCCCC');
  });

  it('check addRow', async () => {
    const myMatrix01 = new DanMatrix<string>({
      rows: 2,
      columns: 3,
      val: '@'
    });
    expect(myMatrix01.rowsNum()).toBe(2);
    expect(myMatrix01.colsNum()).toBe(3);
    myMatrix01.addRow(['1', '2', '3']);
    expect(myMatrix01.rowsNum()).toBe(3);
    expect(myMatrix01.colsNum()).toBe(3);
    expect(myMatrix01.get(1, 2)).toBe('@');
    expect(myMatrix01.getCoord('0-1')).toBe('@');
    expect(myMatrix01.get(2, 2)).toBe('3');

    const myMatrix02 = new DanMatrix<number>([
      [763, 23, 87, 123],
      [244, 68563, 1, 557]
    ]);
    expect(myMatrix02.rowsNum()).toBe(2);
    expect(myMatrix02.colsNum()).toBe(4);
    myMatrix02.addRow([1, 2, 3, 4]);
    expect(myMatrix02.rowsNum()).toBe(3);
    expect(myMatrix02.colsNum()).toBe(4);
    expect(myMatrix02.get(1, 2)).toBe(1);
    expect(myMatrix02.getCoord('0-1')).toBe(23);
    expect(myMatrix02.get(2, 3)).toBe(4);
    console.log(myMatrix02.getMatrixString(8));

    const myMatrix03 = new DanMatrix<string>([
      ['a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaa'],
      ['b', 'bb', 'bbb', 'bbbb', 'bbbbb', 'bbbbbb'],
      ['c', 'cc', 'ccc', 'cccc', 'ccccc', 'cccccc']
    ]);
    expect(myMatrix03.rowsNum()).toBe(3);
    expect(myMatrix03.colsNum()).toBe(6);
    expect(myMatrix03.set(3, 4, 'DDDDD')).toBeUndefined();
    myMatrix03.addRow(['d', 'dd', 'ddd', 'dddd', 'ddddd', 'dddddd']);
    expect(myMatrix03.rowsNum()).toBe(4);
    expect(myMatrix03.colsNum()).toBe(6);
    expect(myMatrix03.get(1, 2)).toBe('bbb');
    expect(myMatrix03.getCoord('0-1')).toBe('aa');
    expect(myMatrix03.get(5, 9)).toBeUndefined();
    expect(myMatrix03.set(4, 4, 'eeeee')).toBeUndefined();
    expect(myMatrix03.getCoord('2-5')).toBe('cccccc');
    expect(myMatrix03.setCoord('2-5', 'CCCCCC')).toBe('CCCCCC');
    expect(myMatrix03.get(2, 5)).toBe('CCCCCC');
    expect(myMatrix03.set(3, 4, 'DDDDD')).toBe('DDDDD');
    console.log(myMatrix03.getMatrixString());

    expect(() => {
      const myMatrix = new DanMatrix<number>();
      myMatrix.setupMatrix([
        [763, 23, 87],
        [244, 68563, 1]
      ]);
      myMatrix.addRow([344, 65, 87, 98, 12]);
    }).toThrow();
  });

  it('check addColumn', async () => {
    const myMatrix01 = new DanMatrix<string>({
      rows: 2,
      columns: 3,
      val: '@'
    });
    expect(myMatrix01.rowsNum()).toBe(2);
    expect(myMatrix01.colsNum()).toBe(3);
    myMatrix01.addColumn(['1', '2']);
    expect(myMatrix01.rowsNum()).toBe(2);
    expect(myMatrix01.colsNum()).toBe(4);
    console.log(myMatrix01.getMatrixString(4));
    expect(myMatrix01.get(1, 3)).toBe('2');
    expect(myMatrix01.getCoord('0-3')).toBe('1');
    expect(myMatrix01.get(2, 2)).toBeUndefined();

    const myMatrix02 = new DanMatrix<number>([
      [763, 23, 87, 123],
      [244, 68563, 1, 557]
    ]);
    expect(myMatrix02.rowsNum()).toBe(2);
    expect(myMatrix02.colsNum()).toBe(4);
    myMatrix02.addColumn([1111, 2222]);
    expect(myMatrix02.rowsNum()).toBe(2);
    expect(myMatrix02.colsNum()).toBe(5);
    console.log(myMatrix02.getMatrixString(8));
    expect(myMatrix02.get(1, 4)).toBe(2222);
    expect(myMatrix02.getCoord('0-4')).toBe(1111);
    expect(myMatrix02.get(2, 3)).toBeUndefined();

    const myMatrix03 = new DanMatrix<string>([
      ['a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaa'],
      ['b', 'bb', 'bbb', 'bbbb', 'bbbbb', 'bbbbbb'],
      ['c', 'cc', 'ccc', 'cccc', 'ccccc', 'cccccc']
    ]);
    expect(myMatrix03.rowsNum()).toBe(3);
    expect(myMatrix03.colsNum()).toBe(6);
    myMatrix03.addColumn(['aaaaaaa', 'bbbbbbb', 'ccccccc']);
    expect(myMatrix03.rowsNum()).toBe(3);
    expect(myMatrix03.colsNum()).toBe(7);
    expect(myMatrix03.get(1, 6)).toBe('bbbbbbb');
    expect(myMatrix03.getCoord('2-6')).toBe('ccccccc');
    console.log(myMatrix03.getMatrixString());

    expect(() => {
      const myMatrix = new DanMatrix<number>();
      myMatrix.setupMatrix([
        [763, 23, 87],
        [244, 68563, 1]
      ]);
      myMatrix.addColumn([344]);
    }).toThrow();
  });

  it('check lookForValue', async () => {
    const myMatrix01 = new DanMatrix<string>({
      rows: 2,
      columns: 3,
      val: '@'
    });
    const coordsArray0101 = myMatrix01.lookForValue('@');
    expect(coordsArray0101.length).toBe(6);
    const coordsArray0102 = myMatrix01.lookForValue('#');
    expect(coordsArray0102.length).toBe(0);

    const myMatrix02 = new DanMatrix<number>([
      [763, 23, 87, 123],
      [244, 68563, 1, 557]
    ]);
    const coordsArray0201 = myMatrix02.lookForValue(557);
    expect(coordsArray0201.length).toBe(1);
    const coordsArray0202 = myMatrix02.lookForValue(1557);
    expect(coordsArray0202.length).toBe(0);

    const myMatrix03 = new DanMatrix<string>([
      ['a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaa'],
      ['b', 'bb', 'bbb', 'bbbb', 'bbbbb', 'bbbbbb'],
      ['c', 'cc', 'ccc', 'cccc', 'ccccc', 'cccccc']
    ]);
    const coordsArray0301 = myMatrix03.lookForValue('eee');
    expect(coordsArray0301.length).toBe(0);
    const coordsArray0302 = myMatrix03.lookForValue('cccc');
    expect(coordsArray0302.length).toBe(1);
  });
});
