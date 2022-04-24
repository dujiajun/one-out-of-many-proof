import { BN } from "bn.js";
import { curve } from "../src/params";
import {
  commit,
  convertToNal,
  convertToSigma,
  randomExponent,
  randomGroupElement,
  toBN10,
} from "../src/primitives";
import { Exponent, GroupElement } from "../src/types";

test("pedersen commitment", () => {
  const g: GroupElement = curve.point(
    toBN10(
      "9216064434961179932092223867844635691966339998754536116709681652691785432045"
    ),
    toBN10(
      "33986433546870000256104618635743654523665060392313886665479090285075695067131"
    )
  );
  const h: GroupElement = curve.point(
    toBN10(
      "50204771751011461524623624559944050110546921468100198079190811223951215371253"
    ),
    toBN10(
      "71960464583475414858258501028406090652116947054627619400863446545880957517934"
    )
  );

  const x: Exponent = new BN(10);
  const r: Exponent = new BN(20);
  const expected: GroupElement = curve.point(
    toBN10(
      "61851512099084226466548221129323427278009818728918965264765669380819444390860"
    ),
    toBN10(
      "74410384199099167977559468576631224214387698148107087854255519197692763637450"
    )
  );
  const c = commit(g, x, h, r);

  expect(c.eq(expected)).toBeTruthy();
});

test("homomorphic", () => {
  const h: GroupElement = randomGroupElement();
  const g: GroupElement = randomGroupElement();

  const x1: Exponent = randomExponent();
  const r1: Exponent = randomExponent();

  const x2: Exponent = randomExponent();
  const r2: Exponent = randomExponent();

  const t1: GroupElement = commit(g, x1, h, r1);
  const t2: GroupElement = commit(g, x2, h, r2);
  const t3: GroupElement = commit(g, x1.add(x2), h, r1.add(r2));

  expect(t3.eq(t1.add(t2))).toBeTruthy();
});

test("convertToSigma", () => {
  const l = 0,
    n = 4,
    m = 2;
  const sigma = convertToSigma(l, n, m);
  expect(sigma.map((item) => item.toNumber())).toStrictEqual([
    1, 0, 0, 0, 1, 0, 0, 0,
  ]);
});

test("convertToNal", () => {
  const n = 4,
    m = 2;
  for (let i = 0; i < n ** m; i++) {
    const I = convertToNal(i, n, m);
    expect(I[0] + I[1] * n).toBe(i);
  }
});
