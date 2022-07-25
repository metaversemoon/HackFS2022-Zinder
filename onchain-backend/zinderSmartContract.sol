// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

contract Zinder {
    uint256 public counter;
    mapping(address => uint256) public userId;
    mapping(uint256 => string) public userStreamId;

    mapping(uint256 => address[]) public merkleRoot;

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
        uint256 id = userId[msg.sender];
        merkleRoot[id].push(merkle);
    }

    function rootBelongsToUser(uint256 id, address merkle)
        public
        returns (bool)
    {
        uint i;
        uint len = merkleRoot[id].length;
        for (i = 0; i < len; i++) {
            if (merkleRoot[id][i] == merkle) {
                return true;
            }
        }
        return false;
    }
}
