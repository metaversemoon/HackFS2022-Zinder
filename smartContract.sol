// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

contract Zinder {
    uint256 public counter;
    mapping(address => uint256) public userId;
    mapping(uint256 => string) public userStreamId;

    mapping(address => address[]) public merkleRoot;

    constructor() {
        counter = 0;
    }

    function registerUser(address merkle, string streamId) public {
        if (userId[msg.sender] == 0) {
            counter += 1;
            userId[msg.sender] = counter;

            updateMerkle(merkle);
            userStreamId[counter] = streamId;
        }
    }

    function updateMerkle(address merkle) public {
        merkleRoot[msg.sender].push(merkle);
    }
    
    function getLatestMerkle(address userEOA) public returns (address) {
        return merkleRoot[userEOA][merkleRoot[userEOA].length-1]
    }

    function rootBelongsToUser(address userEOA, address merkle)
        public
        returns (boolean)
    {
        uint i;
        uint len = merkleRoot[userEOA].length;
        for (i = 0; i < len; i++) {
            if (merkleRoot[userEOA][i] == merkle) {
                return true;
            }
        }
        return false;
    }
}
