import { ethers, Signer } from 'ethers'
import { randomBytes } from "crypto";
import { Client as XmtpClient, Conversation, Message, Stream } from '@xmtp/xmtp-js'
import { MerkleTree } from "./merkleTree";

// TODO needs to run in secure context!!
function checkSecureContext() {
  if (typeof window !== 'undefined') {
    console.log('You are on the browser')
    // Can use 'window' here
    if (window.isSecureContext) {
      console.log("✅ you are in secure context");
      return true;
    } else {
      console.log("you are NOT in secure context!");
      return false;
    }
  } else {
    console.log("✅ server side");
    // assume secure context
    return true;
  }
}

export function keccak256(str: string): string {
  return ethers.utils.keccak256(str);
}

export function generateSeed() {
  return ethers.utils.keccak256(randomBytes(64));

}

// for testing purposes only!!! [for repeatable addresses]
export function generateSeedStatic(key: string) {
  let seed = ethers.utils.id(key);
  return seed;
}

export function getPrivateKeyFromSeedAtIndex(seed: string, index: number) {
  let privateKey = ethers.utils.keccak256(seed);
  for (let i = 0; i < index; i++) {
    privateKey = ethers.utils.keccak256(privateKey);
  }
  return privateKey;
}

/// @param depth: Power value for the merkleRoot depth (2**depth)
export async function generateUserIdMerkleRoot(seed: string, depth: number) {
  let privateKey = seed;
  let publicKeys: string[] = [];
  for (let i = 0; i < 2 ** depth; i++) {
    privateKey = ethers.utils.keccak256(privateKey);
    publicKeys.push(new ethers.Wallet(privateKey).publicKey)
  }

  return new MerkleTree(publicKeys);
}


interface WalletsAndPublicKeys {
  wallets: ethers.Wallet[];
  publicKeys: string[];
}
// 2**depth wallets
export async function generateWalletsAndPublicKeys(seed: string, depth: number) {
  let privateKey = seed;
  let wallets: ethers.Wallet[] = [];
  let publicKeys: string[] = [];
  let walletsAndPublicKeys: WalletsAndPublicKeys = {wallets, publicKeys };
  for (let i = 0; i < 2 ** depth; i++) {
    privateKey = ethers.utils.keccak256(privateKey);
    let wallet = new ethers.Wallet(privateKey);
    walletsAndPublicKeys.wallets.push(wallet);
    walletsAndPublicKeys.publicKeys.push(wallet.address);
  }

  return walletsAndPublicKeys;
}



// optionaly provide a seed for generating the same addresses
// for testing purposes!
export async function generatePrivateUserDataObj(seed?: string) {
  let masterSeed;
  if (typeof seed !== 'undefined') {
    // testing purposes
    masterSeed = generateSeedStatic(seed);
  } else {
    masterSeed = generateSeed();
  }

  const privateData: { privateKey_XMTP_MSGBOX: string, swipeIndex: number, activeXmtpIndexes: number[] } = {

    privateKey_XMTP_MSGBOX: getPrivateKeyFromSeedAtIndex(masterSeed, 0),
    swipeIndex: 1,
    activeXmtpIndexes: []

  }

  return privateData;
}

function createPublicUserDataObj(name: string, images?: string[], age?: number, location?: string, bio?: string, seed?: string) {
  const publicUserData: { userId: string, privateData: any, name: string, images?: string[], age?: number, location?: string, bio?: string } = {
    userId: "",
    privateData: generatePrivateUserDataObj(seed),
    name: name
  }


}


async function getXmtpClientFromKey(privatekey: string, provider: ethers.providers.JsonRpcProvider) {
  let signer = new ethers.Wallet(privatekey, provider);
  return await XmtpClient.create(signer)
}

function getXmtpPublicKey(client: XmtpClient) {

}
function getXmtpPrivateKey(client: XmtpClient) {
  return client.address()
}

// testing area
checkSecureContext();
const start = Date.now();
generateSeed()
const infuraGateWay = "https://mainnet.infura.io/v3/2845e9f98fb046909451b060d647f8c8";
const provider = new ethers.providers.JsonRpcProvider(infuraGateWay);
// const duration = Date.now() - start;


console.log(generatePrivateUserDataObj);
console.log(Date.now() - start);
// end of testing area
