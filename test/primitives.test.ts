import { BN } from "bn.js";
import { curve } from "../src/params";
import {
  commit,
  commitBits,
  convertToNal,
  convertToSigma,
  multiExponents,
  randomExponent,
  randomGroupElement,
  toBN10,
} from "../src/primitives";
import { Exponent, GroupElement } from "../src/types";
import crypto from "crypto";

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


test("multiExponents", () => {
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

  const multi = multiExponents([g, h], [x, r]);
  const expected: GroupElement = curve.point("88beb71b12893f92ace15836af060835e059333f18483915c533ca09aa455bcc", "a482c8f3768f85b95d4e147663574598649fbdf5cedcbc38b034e5ad12bd06ca")
  expect(expected.eq(multi)).toBeTruthy();
})

test("commitBits", () => {

  const g = curve.g;
  const f = curve.point(
    "c4abbb41fb87d293ae90fd755c1e62506b7c80d2fe84efa36970383e17ca274a",
    "d730074791dbacb3bc866d4600b62d1da3bd1aacc2da289f20424036f10c1c06"
  );
  const h = curve.point(
    "d67dedde7f8861e5a99c0e30e06594997e85da6604ceffd429c69bf9d1d5b4d7",
    "77f0f57c3757fc327265bf588cf1ddef2ca35b1445e9374e44ca710301bd9b61"
  );

  const exps: Exponent[] = [new BN(10), new BN(20)];
  const r: Exponent = new BN(20);

  const committed = commitBits(g, [f, h], exps, r);
  const expected: GroupElement = curve.point("ce3ee0219f20d53c1b45d8d3e8fb638af4b180c4a8b4467097ccb489a2d0d603", "d54618af30dfe5a24f516a6b57809926c618fb0cb6fe6431176b732e4c1e1c0c")
  expect(expected.eq(committed)).toBeTruthy();
})

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

test("hash", () => {
  const hash1 = crypto.createHash("sha256");
  const hash2 = crypto.createHash("sha256");
  const msgs = ["11", "22", "33"];
  const msg = msgs.join("");
  msgs.forEach((item) => {
    hash1.update(item);
  });
  hash2.update(msg);
  expect(hash1.digest("hex")).toEqual(hash2.digest("hex"));
});
