import { DID } from "dids";
import { Integration } from "lit-ceramic-sdk";
import { useState } from "react";

const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "1000000000000",
    },
  },
];

export const LitProtocol = () => {
  const litCeramicIntegration = new Integration(
    "https://ceramic-clay.3boxlabs.com",
    "polygon"
  );
  const streamID =
    "kjzl6cwe1jw1479rnblkk5u43ivxkuo29i4efdx1e7hk94qrhjl0d4u0dyys1au"; // test data
  const [secret, setSecret] = useState("");
  const [stream, setStream] = useState("");
  const [stringToEncrypt, setStringToEncrypt] = useState("");

  const encryptLit = async () => {
    const response = await litCeramicIntegration
      .encryptAndWrite(stringToEncrypt, accessControlConditions)
      .then((value: any) => setStream(value));
    console.log("response");
    console.log(response);
  };

  return (
    <div>
      <input
        style={{ marginRight: "10px" }}
        key="secret"
        onChange={(event) => {
          setSecret(event.target.value);
        }}
        value={secret}
        placeholder="secret"
      />
      <input
        style={{ marginRight: "10px" }}
        key="stringToEncrypt"
        onChange={(event) => {
          setStringToEncrypt(event.target.value);
        }}
        value={stringToEncrypt}
        placeholder="String to encrypt"
      />

      <button onClick={encryptLit}>Encrypt</button>

      <p>
        Result:
        <br />
        {stream}
      </p>
    </div>
  );
};
