import * as utils from "./utils"
import { MerkleTree } from "./merkleTree";
import { ethers, Signer, Wallet, providers } from 'ethers'
import { Client, Conversation, CompositeCodec } from '@xmtp/xmtp-js'

import { ContentTypeSwipeProof, ProofCodec } from './XmtpSwipeType'

interface WalletsAndPublicKeys {
  wallets: ethers.Wallet[];
  publicKeys: string[];
}

interface IUserContactMsg {
  privateXmtpAdr: string;
  idx: number;
}


interface IPublicUser {
  smartContractAddress: string,
  eoa: string,
  XMTP_MSGBOX: string,
  userCounterId: number,
  name: string,
  images: string[],
  age: number,
  location: string,
  bio: string,

  privateUserDataStreamAddress: string
}

interface IPrivateData {
  masterSeed: string,
  eoa: string,
  wallets: Wallet[],
  userMerkleTree: MerkleTree,
  swipedUsers: Map<number, boolean>(),
  userThatSwipedUs: Map<number, userContactMsg>(),
  swipeIndex: number,
  swipedUserIndexesRange: number[],
  activeXmtpIndexes: number[],
  userCounterId: number,
  userEOA: string,
  name: string,
  images: string[],
  age: number,
  location: string;
  bio: string

}

export default class BusinessLogic {

  smartContractAddress!: string;
  masterSeed!: string;
  eoa!: string;

  infuraGateWay = "https://mainnet.infura.io/v3/2845e9f98fb046909451b060d647f8c8";
  provider!: ethers.providers.JsonRpcProvider;

  wallets: Wallet[] = [];
  userMerkleTree: MerkleTree;

  XMTP_MSGBOX!: Client;

  swipedUsers = new Map<number, boolean>();
  userThatSwipedUs = new Map<number, IUserContactMsg>();

  zinderContract!: any;

  swipeIndex!: number;
  swipedUserIndexesRange!: number[];
  activeXmtpIndexes!: number[];

  xmtpClients!: Client[];
  xmtpConversation!: Conversation[];


  userCounterId!: number;
  userEOA!: string;
  name!: string;
  images!: string[]; //StreamID
  age!: number;
  location!: string;
  bio!: string;

  privateUserDataStreamAddress!: string; //StreamID




  constructor(smartContractAddress: string, eoa: string, masterSeed: string, wallets: ethers.Wallet[], userMerkleTree: MerkleTree, xmtp: Client, swipeIndex: number, activeXmtpIndexes?: number[], providerGateWay?: string) {
    if (providerGateWay) {
      this.provider = new ethers.providers.JsonRpcProvider(providerGateWay);
    } else {
      new ethers.providers.JsonRpcProvider(this.infuraGateWay);
    }


    let abi = ["function rootBelongsToUser(uint256 id, address merkle) public returns (bool)"];
    this.zinderContract = new ethers.Contract(smartContractAddress, abi, this.provider);

    this.masterSeed = masterSeed;

    this.swipeIndex = swipeIndex;

    this.wallets = wallets;

    this.userMerkleTree = userMerkleTree;

    this.userEOA = eoa;

    this.provider = new ethers.providers.JsonRpcProvider(this.infuraGateWay);
    this.XMTP_MSGBOX = xmtp;

    if (typeof activeXmtpIndexes !== 'undefined') {
      this.activeXmtpIndexes = activeXmtpIndexes;
    } else {
      this.activeXmtpIndexes = [];
    }
  }

  get userId(): string { return this.userMerkleTree.value; }


  public static async build(smartContractAddress: string, eoa: string, merkleDepth: number, seed?: string): Promise<PrivateUserData> {
    let masterSeed;
    if (typeof seed !== 'undefined') {
      // testing purposes
      masterSeed = utils.generateSeedStatic(seed);
    } else {
      masterSeed = utils.generateSeed();
    }
    let privateKey_XMTP_MSGBOX = utils.getPrivateKeyFromSeedAtIndex(masterSeed, 0);
    let xmtpMsgBoxWallet = new Wallet(privateKey_XMTP_MSGBOX);
    const xmtp = await Client.create(xmtpMsgBoxWallet, { codecs: [new ProofCodec()] });
    //



    let walletsAndPublicKeys = await utils.generateWalletsAndPublicKeys(utils.getPrivateKeyFromSeedAtIndex(masterSeed, 1), merkleDepth);


    let publicKeys: string[] = walletsAndPublicKeys.publicKeys;
    let merkleTree = new MerkleTree(publicKeys);

    return new PrivateUserData(smartContractAddress, eoa, masterSeed, walletsAndPublicKeys.wallets, merkleTree, xmtp, 1);
  }

  setUserNumId(numId: number) {
    this.userCounterId = numId;
  }

  // createWallet() {
  //   this.wallets.push(new ethers.Wallet(utils.getPrivateKeyFromSeedAtIndex(this.masterSeed, this.swipeIndex)));
  //   this.wallets.push(new ethers.Wallet(utils.getPrivateKeyFromSeedAtIndex(this.masterSeed, this.swipeIndex + 1)));
  //   this.swipeIndex += 2;
  // }

  addActiveXmtpIndex(idx: number) {
    this.activeXmtpIndexes.push(idx);
  }

  // TODO
  // need to check remove Active index
  removeActiveXmtpIndex(idx: number) {
    const index = this.activeXmtpIndexes.indexOf(idx, 0);
    if (index > -1) {
      this.activeXmtpIndexes.splice(index, 1);
    }
  }

  incrementSwipeIndex() {
    this.swipeIndex += 1;
  }




  //TODO! check
  async swipe(userCounterId: number, peerAddress: string) {

    let receipt = this.userThatSwipedUs.get(userCounterId);
    if (receipt) {
      this.addXmtpClientConversation(receipt.privateXmtpAdr, receipt.idx);
    } else {
      let xmtp = await Client.create(this.wallets[this.swipeIndex])
      this.swipedUsers.set(userCounterId, true);

      let conversation = await xmtp.conversations.newConversation(
        peerAddress
      )

      let proof = this.userMerkleTree.getProof(this.swipeIndex);
      let msgComposition = [this.userCounterId, this.swipeIndex, this.userMerkleTree.value].concat(proof);
      let msg = JSON.stringify(msgComposition);
      conversation.send(msg, {
        contentType: ContentTypeSwipeProof,
        contentFallback: msg
      })

    }
  }

  // matched(idx: number) {
  //   this.xmtpClients[idx].registerCodec: (new NumberCodec())
  // }

  async readGlobalMsgBox() {
    let stream = await this.XMTP_MSGBOX.conversations.stream()
    while (true) {
      for await (const conversation of stream) {
        let convo = await conversation.messages()
        for (let msg in convo) {
          if (convo[msg].contentType?.typeId == 'proof') {
            try {
              let parsedMsg = JSON.parse(convo[msg].content);
              // do stuff with proof here
              //TODO!
              let proof = parsedMsg.slice(3);
              let sender = convo[msg].senderAddress;
              if (typeof sender !== 'undefined') {
                let checked = MerkleTree.checkProof(proof, parsedMsg[2], sender);
                if (checked) {
                  if (this.swipedUsers.has(parsedMsg[0])) {
                    // an already swiped user has matched us
                    //TODO!
                    this.startMatchConvo();
                  } else {
                    // a user swiped us, we didnt swipe back yet.
                    if (typeof parsedMsg[4][1] == 'string') {
                      let privateXmtp: string = parsedMsg[4][1];
                      let idx: number = parsedMsg[2];
                      let usercontact = { "aa", idx };
                      this.userThatSwipedUs.set(parsedMsg[0], usercontact);
                    }
                  }
                }
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
      }
    }
  }
  //TODO!
  startMatchConvo() {

  }

  async jsonifyPublic() {
    //TODO

  }

  async jsonifyPrivate() {
    //TODO

  }

  async uploadToCeramic() {
    //TODO
    let ceramic;
    return ceramic;
  }

  async addXmtpClientConversation(peerAddress: string, idx: number) {
    const xmtp = await Client.create(this.wallets[this.swipeIndex]);
    this.swipeIndex += 2;
    this.xmtpClients.push(xmtp);
    let convo = await xmtp.conversations.newConversation(peerAddress)
    this.xmtpConversation.push(convo);
    convo.send(idx);


  }
}


}
