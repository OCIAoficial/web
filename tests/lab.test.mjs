import test from 'node:test';
import assert from 'node:assert/strict';
import { classify } from '../src/lab.js';

test('la mayoría de los vecinos decide, aunque el punto más cercano sea de otro grupo', () => {
  const data = [
    { x: 1, y: 0, group: 'A' },
    { x: 2, y: 0, group: 'B' },
    { x: 0, y: 3, group: 'B' },
    { x: 20, y: 20, group: 'A' },
  ];
  const result = classify({ x: 0, y: 0 }, data);
  assert.equal(result.group, 'B');
  assert.equal(result.votes, 2);
  assert.deepEqual(result.neighbors.map((neighbor) => neighbor.index), [0, 1, 2]);
});

test('una traslación y escala uniforme no cambian la clasificación', () => {
  const point = { x: 5, y: 3 };
  const data = [{ x: 1, y: 3, group: 'A' }, { x: 6, y: 4, group: 'B' }, { x: 5, y: 5, group: 'B' }];
  const transform = ({ x, y, ...rest }) => ({ ...rest, x: x * 7 + 19, y: y * 7 - 23 });
  const before = classify(point, data);
  const after = classify(transform(point), data.map(transform));
  assert.equal(before.group, after.group);
  assert.equal(before.votes, after.votes);
  assert.deepEqual(before.neighbors.map((item) => item.index), after.neighbors.map((item) => item.index));
});

test('un empate se resuelve con el vecino más cercano y mantiene un resultado estable', () => {
  const data = [{ x: 2, y: 0, group: 'A' }, { x: 1, y: 0, group: 'B' }];
  assert.equal(classify({ x: 0, y: 0 }, data, 2).group, 'B');
  assert.equal(classify({ x: 0, y: 0 }, [{ x: 1, y: 0, group: 'A' }, { x: -1, y: 0, group: 'B' }], 1).group, 'A');
});

test('se rechazan puntos no finitos y cantidades de vecinos imposibles', () => {
  assert.throws(() => classify({ x: NaN, y: 1 }), TypeError);
  assert.throws(() => classify({ x: 1, y: Infinity }), TypeError);
  for (const k of [0, -1, 2.5, 20]) {
    assert.throws(() => classify({ x: 1, y: 1 }, undefined, k), RangeError);
  }
});
