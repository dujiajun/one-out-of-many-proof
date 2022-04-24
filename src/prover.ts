import { Exponent, GroupElement, R1Proof, SigmaProof } from "./types";
import {
  commit,
  commitBits,
  convertToNal,
  convertToSigma,
  generateChallenge,
  multiExponents,
  newFactor,
  randomExponent,
} from "./primitives";
import BN from "bn.js";
import { zero } from "./params";

export class R1Prover {
  rA: Exponent;
  rC: Exponent;
  rD: Exponent;
  g: GroupElement;
  h: GroupElement[];

  b: Exponent[];
  r: Exponent;
  B_commit: GroupElement;
  n: number;
  m: number;
  constructor(
    g: GroupElement,
    h: GroupElement[],
    b: Exponent[],
    r: Exponent,
    n: number,
    m: number
  ) {
    this.g = g;
    this.h = h;
    this.b = b;
    this.r = r;
    this.n = n;
    this.m = m;
    this.B_commit = commitBits(g, h, b, r);
    this.rA = new BN(0);
    this.rC = new BN(0);
    this.rD = new BN(0);
  }

  prove(proof_out: R1Proof, skip_final_response: boolean = false) {
    const a_out = new Array<Exponent>(this.n * this.m);
    a_out.fill(new BN(0));
    for (let j = 0; j < this.m; j++) {
      for (let i = 1; i < this.n; i++) {
        a_out[j * this.n + i] = randomExponent();
        a_out[j * this.n] = a_out[j * this.n].sub(a_out[j * this.n + i]);
      }
    }
    console.log("after computing a_out");

    this.rA = randomExponent();
    const A: GroupElement = commitBits(this.g, this.h, a_out, this.rA);
    proof_out.A = A;
    console.log("after computing A");
    const c = new Array<Exponent>(this.n * this.m);
    for (let i = 0; i < c.length; i++) {
      c[i] = a_out[i].mul(new BN(1).sub(this.b[i].mul(new BN(2))));
    }

    this.rC = randomExponent();
    const C: GroupElement = commitBits(this.g, this.h, c, this.rC);
    proof_out.C = C;
    console.log("after computing C");
    const d = new Array<Exponent>(this.n * this.m);
    for (let i = 0; i < d.length; i++) {
      d[i] = a_out[i].sqr().neg();
    }

    this.rD = randomExponent();
    const D: GroupElement = commitBits(this.g, this.h, d, this.rD);
    proof_out.D = D;
    console.log("after computing D");
    if (!skip_final_response) {
      const group_elements = new Array<GroupElement>(A, this.B_commit, C, D);
      const x: Exponent = generateChallenge(group_elements);
      this.generateFinalResponse(a_out, x, proof_out);
    }
    return a_out;
  }

  generateFinalResponse(
    a: Exponent[],
    challenge_x: Exponent,
    proof_out: R1Proof
  ) {
    proof_out.f.splice(0);
    for (let j = 0; j < this.m; j++) {
      for (let i = 1; i < this.n; i++) {
        proof_out.f.push(
          this.b[j * this.n + i].mul(challenge_x).add(a[j * this.n + i])
        );
      }
    }
    proof_out.ZA = this.r.mul(challenge_x).add(this.rA!);
    proof_out.ZC = this.rC.mul(challenge_x).add(this.rD!);
    console.log("after generateFinalResponse");
  }
}

export class SigmaProver {
  g: GroupElement = zero;
  h: GroupElement[] = [];
  n: number = 0;
  m: number = 0;

  constructor(g: GroupElement, h: GroupElement[], n: number, m: number) {
    this.g = g;
    this.h = h;
    this.n = n;
    this.m = m;
  }

  prove(commits: GroupElement[], l: number, r: Exponent): SigmaProof {
    const proof_out = new SigmaProof();
    const setSize = commits.length;

    const rB: Exponent = randomExponent();
    const sigma = convertToSigma(l, this.n, this.m);

    const Pk = new Array<Exponent>(this.m);
    for (let k = 0; k < Pk.length; k++) {
      Pk[k] = randomExponent();
    }

    const r1prover = new R1Prover(this.g, this.h, sigma, rB, this.n, this.m);
    proof_out.B = r1prover.B_commit;
    const a = r1prover.prove(proof_out.r1Proof, true);
    console.log("after r1prover.prove");
    const N = setSize;
    const P_i_k = new Array(N);
    for (let i = 0; i < N; i++) P_i_k[i] = new Array<Exponent>();
    for (let i = 0; i < N; i++) {
      const coefficients: Exponent[] = P_i_k[i];
      const I: number[] = convertToNal(i, this.n, this.m);
      coefficients.push(a[I[0]]);
      coefficients.push(sigma[I[0]]);
      for (let j = 1; j < this.m; j++) {
        newFactor(sigma[j * this.n + I[j]], a[j * this.n + I[j]], coefficients);
      }
    }
    console.log("after P_i_k");
    const Gk = new Array<GroupElement>(this.m);
    for (let k = 0; k < this.m; k++) {
      const P_i = new Array<Exponent>(N);
      for (let i = 0; i < N; i++) {
        P_i[i] = P_i_k[i][k];
      }
      const c_k: GroupElement = multiExponents(commits, P_i).add(
        commit(this.g, new BN(0), this.h[0], Pk[k])
      ) as GroupElement;
      Gk[k] = c_k;
    }
    proof_out.Gk = Gk;
    console.log("after Gk");
    const group_elements = [
      proof_out.r1Proof.A,
      proof_out.B,
      proof_out.r1Proof.C,
      proof_out.r1Proof.D,
    ];
    group_elements.splice(group_elements.length, 0, ...Gk);

    const x = generateChallenge(group_elements);
    console.log("afrer generateChallenge");
    r1prover.generateFinalResponse(a, x, proof_out.r1Proof);
    console.log("after generateFinalResponse");
    let z = r.mul(x.pow(new BN(this.m)));
    let sum = new BN(0),
      x_k = new BN(1);
    for (let k = 0; k < this.m; k++) {
      sum = sum.add(Pk[k].mul(x_k));
      x_k = x_k.mul(x);
    }
    z = z.sub(sum);
    proof_out.z = z;
    return proof_out;
  }
}
