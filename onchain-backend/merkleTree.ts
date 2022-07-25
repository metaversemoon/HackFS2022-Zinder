import { ethers } from 'ethers'

export class MerkleTree {

  left: MerkleTree | null;

  right: MerkleTree | null;

  value: string;

  height: number;

  constructor(vals: string[], merkle?: MerkleTree) {
    // for extending a merkle tree 1 more layer, joining an existing merkle tree with new vals
    // the amount of vals.length needs to be the same as amount of leaves in the merkle tree
    // this tree support 2**N vals
    if (typeof merkle !== 'undefined') {
      if (Math.ceil(Math.log2(vals.length)) != merkle.height) {
        throw new Error("the merkle tree and the values need to have the same leaf/values sizes");
      }
      this.left = merkle;
      this.height = merkle.height + 1;
      this.right = new MerkleTree(vals);
      this.value = ethers.utils.keccak256(this.left.value.concat(this.right.value));

      // leaf node
    } else if (vals.length == 1) {
      this.value = vals[0];
      this.height = 0;
      this.left = null;
      this.right = null;

      // regular node
    } else {
      this.height = Math.ceil(Math.log2(vals.length));
      this.left = new MerkleTree(vals.slice(0, vals.length / 2));
      this.right = new MerkleTree(vals.slice(length / 2));
      this.value = ethers.utils.keccak256(this.left.value.concat(this.right.value));

    }
  }

  getProof(index: number): string[] {
    // this is always true..
    if (this.left && this.right) {
      if (this.height == 1) {
        if (index > 1) {
          return [this.right.value, this.left.value];
        } else {
          return [this.left.value, this.right.value];
        }
      } else {
        // right
        if (index > Math.pow(2, this.height - 1)) {
          return this.right.getProof(index - Math.pow(2, this.height - 1)).concat(this.left.value);
        } else {
          //left
          return this.left.getProof(index).concat(this.right.value);
        }
      }
    }
    // should not reach here..
    throw new Error("tried to access a null node");
  }

  public static checkProof(hashes: string[], rootHash: string, initialEOA: string): boolean {
    if (hashes[0] == initialEOA && hashes[hashes.length - 1] == rootHash) {
      let finalHash = hashes[0];
      for (let i = 1; i < hashes.length; i++) {
        finalHash = ethers.utils.keccak256(finalHash.concat(hashes[i]))
      }
      if (finalHash == rootHash)
        return true;
    }

    return false;
  }
}
