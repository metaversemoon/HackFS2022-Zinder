# HackFS2022-Submission: Zinder find your POAP partner


This project uses POAPs smart contracts and APIs for the initial user data.

You can connect your wallet with metamask and sign up to create a profile stored encrypted on IPFS.

For the matching we query the blockchain with the graph. It was challenging and rewarding to work with AssemblyScript and solve the issues of querying N-to-N.

For messaging we use XMTP we came up with the novel concept of private inboxes for your matches. Essentialy we do the following:

Generate 2^N Keys
Make a merkle Tree
Create public XMTP address and associate it with the Root and EOA
User1 sends a message to LitAction alongside a merkle tree root proof and another address used for the and an address of user2 global xmtp client
User2 sends a message to LitAction alongside a merkle tree root proof and an address of user1 global xmtp client and another address used for the and an address of user1 global xmtp client
User1 sends a message with a different key+the root proof to Address2 of User2 with a Merkle Proof Private Communication Begins
private communication user1 Address2 <-> user2 Address2


![screenshot](./Slides/zinder-frontend.png?raw=true)
