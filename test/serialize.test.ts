import { BN } from "bn.js";
import { curve } from "../src/params";

import { toBN10 } from "../src/primitives";
import {
  deserialize,
  representate,
  serialize,
  toBytes,
} from "../src/serialize";
import { Exponent, GroupElement } from "../src/types";

test("toBytes", () => {
  const x: Exponent = toBN10("10");
  expect(toBytes(x)).toEqual(
    "0x000000000000000000000000000000000000000000000000000000000000000a"
  );

  const y: Exponent = new BN("10", "hex");
  expect(toBytes(y)).toEqual(
    "0x0000000000000000000000000000000000000000000000000000000000000010"
  );
});

test("serialize", () => {
  const point: GroupElement = curve.g;
  const serialization: string[] = serialize(point);
  const new_point: GroupElement = deserialize(serialization);
  expect(point.eq(new_point)).toBeTruthy();
});

test("representate", () => {
  const point: GroupElement = curve.g;
  const representation: string = representate(point);
  expect(representation).toEqual(
    "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
  );
});
