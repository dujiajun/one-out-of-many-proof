import EC from "elliptic/";
import BN from "bn.js";
import { GroupElement } from "./types";

export const ec = new EC.ec("secp256k1");
export const curve = ec.curve;
export const p = BN.red(curve.p);
export const q = BN.red(curve.n);
export const zero: GroupElement = curve.g.mul(new BN(0)) as GroupElement;
export default { ec, curve, p, q, zero };
