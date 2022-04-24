import { Exponent, GroupElement } from "./types";
import crypto from "crypto";
import BN from "bn.js";
import params, { curve } from "./params";

export function toBN10(str: string) {
  return new BN(str, 10);
}

export function commit(
  g: GroupElement,
  m: Exponent,
  h: GroupElement,
  r: Exponent
): GroupElement {
  return g.mul(m).add(h.mul(r)) as GroupElement;
}

export function multiExponents(
  h: GroupElement[],
  exp: Exponent[]
): GroupElement {
  let tmp: GroupElement = params.zero as GroupElement;
  h.forEach((item, index) => {
    tmp = tmp.add(item.mul(exp[index])) as GroupElement;
  });
  return tmp;
}

export function commitBits(
  g: GroupElement,
  h: GroupElement[],
  exp: Exponent[],
  r: Exponent
): GroupElement {
  const tmp = multiExponents(h, exp);
  return g.mul(r).add(tmp) as GroupElement;
}

export function randomExponent(): Exponent {
  return new BN(crypto.randomBytes(32), "hex");
}

export function randomGroupElement(): GroupElement {
  while (true) {
    try {
      const x = new BN(crypto.randomBytes(32), "hex");
      return curve.pointFromX(x);
    } catch (error) {
      continue;
    }
  }
}

export function generateChallenge(group_elements: GroupElement[]): Exponent {
  const sha256 = crypto.createHash("sha256");
  group_elements.forEach((item, index) => {
    sha256.update(item.encode("hex", false));
  });
  const result_out = new BN(sha256.digest("hex"), "hex").toRed(params.p);
  return result_out;
}

export function convertToSigma(
  num: number,
  n: number,
  m: number
): Array<Exponent> {
  const out = new Array<Exponent>();
  var j = 0;
  for (j = 0; j < m; j++) {
    const rem = num % n;
    num = Math.floor(num / n);
    for (let i = 0; i < n; i++) {
      out.push(i == rem ? new BN(1) : new BN(0));
    }
  }
  return out;
}

export function convertToNal(num: number, n: number, m: number): Array<number> {
  const out = new Array<number>();
  var j = 0;
  while (num != 0) {
    const rem = num % n;
    num = Math.floor(num / n);
    out.push(rem);
    j++;
  }
  if (out.length > m) return out.slice(0, m);
  if (out.length < m)
    out.splice(out.length, 0, ...new Array<number>(m - out.length).fill(0));
  return out;
}

export function newFactor(x: Exponent, a: Exponent, coefficients: Exponent[]) {
  const degree = coefficients.length;
  coefficients.push(x.mul(coefficients[degree - 1]));
  for (let d = degree - 1; d >= 1; d--) {
    coefficients[d] = a.mul(coefficients[d]).add(x.mul(coefficients[d - 1]));
  }
  coefficients[0] = coefficients[0].mul(a);
}
