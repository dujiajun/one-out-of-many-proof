import { commit, randomExponent, randomGroupElement } from "../src/primitives";
import { Exponent, GroupElement, R1Proof, SigmaProof } from "../src/types";
import { R1Prover, SigmaProver } from "../src/prover";
import BN from "bn.js";
import { R1Verifier, SigmaVerifier } from "../src/verifier";

function testR1(
  g: GroupElement,
  h: GroupElement[],
  b: Exponent[],
  n: number,
  m: number
): boolean {
  const r: Exponent = randomExponent();
  const prover: R1Prover = new R1Prover(g, h, b, r, n, m);
  const proof: R1Proof = new R1Proof();

  prover.prove(proof);
  const r1verifier = new R1Verifier(g, h, prover.B_commit, n, m);

  return r1verifier.verify(proof);
}

test("test R1 relation", () => {
  const n = 4;
  const m = 2;
  const g: GroupElement = randomGroupElement();
  const h_ = new Array<GroupElement>();
  const b = new Array<Exponent>();
  let h: GroupElement;
  for (let i = 0; i < m; i++) {
    h = randomGroupElement();
    h_.push(h);
    b.push(new BN(1));
    for (let j = 1; j < n; j++) {
      h = randomGroupElement();
      h_.push(h);
      b.push(new BN(0));
    }
  }
  expect(testR1(g, h_, b, n, m)).toBeTruthy();
});

test("test one-out-of-n", () => {
  const n = 4;
  const m = 2;
  const N = 16;
  const index = 5;
  const g: GroupElement = randomGroupElement();
  const h_gens = new Array<GroupElement>(n * m);
  for (let i = 0; i < h_gens.length; i++) {
    h_gens[i] = randomGroupElement();
  }
  const r: Exponent = randomExponent();

  const prover: SigmaProver = new SigmaProver(g, h_gens, n, m);
  const commits = new Array<GroupElement>();
  const zero = new BN(0);
  for (let i = 0; i < N; i++) {
    if (i == index) {
      const c = commit(g, zero, h_gens[0], r);
      commits.push(c);
    } else {
      commits.push(randomGroupElement());
    }
  }
  const proof: SigmaProof = prover.prove(commits, index, r);
  const verifier: SigmaVerifier = new SigmaVerifier(g, h_gens, n, m);
  expect(verifier.verify(commits, proof)).toBeTruthy();
});
