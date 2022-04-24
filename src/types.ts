import BN from "bn.js";
import { curve } from "elliptic";
import { zero } from "./params";

export type Exponent = BN;
export type GroupElement = curve.short.ShortPoint;

export class R1Proof {
  A: GroupElement = zero;
  C: GroupElement = zero;
  D: GroupElement = zero;
  f: Exponent[] = [];
  ZA: Exponent = new BN(0);
  ZC: Exponent = new BN(0);
}

export class SigmaProof {
  n: number = 0;
  m: number = 0;
  B: GroupElement = zero;
  r1Proof: R1Proof = new R1Proof();
  Gk: GroupElement[] = [];
  z: Exponent = new BN(0);
}
