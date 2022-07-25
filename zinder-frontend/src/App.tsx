import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { ProfileDetails } from "./components/ProfileDetails";
import { Container, Box, Typography } from "@mui/material";
import ProfileCard from "./components/ProfileCard";
import { NftExplorer } from "./components/CommonNFTs";
import { Header } from "./components/Header";

import { init, useWallets } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import { defaultChains } from "./providerConfig";
import { ConfettiHearts } from "./components/DrawHearts";
import { useConnectWallet } from "@web3-onboard/react";
import { LitProtocol } from "./components/LitProtocol";
import { MutualPoaps } from "./components/MutualPoaps";
const injected = injectedModule();

const web3Onboard = init({
  wallets: [injected],
  chains: defaultChains,
  appMetadata: {
    name: "POAP Match",
    icon: "<svg><svg/>",
    description: "POAP Match",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
  accountCenter: {
    desktop: {
      position: "bottomLeft",
      enabled: true,
      minimal: true,
      containerElement: "body",
    },
    mobile: {
      position: "bottomLeft",
      enabled: true,
      minimal: true,
      containerElement: "body",
    },
  },
});

function App() {
  const [confetti, setConfetti] = useState(false);
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const defaultOwnAddress = "0xe626e8ca82603e3b44751f8562b5ed126d345140";
  const defaultAddresses = [
    "0xecd8c7abae05083c7bf368e022a311c24a11870f",
    "0x0cad7af8b05d0438ffa1a1b73d05676154ae1dca",
    "0xf6244b82a8ff1ac80e880f94fbce44a4bf7e7b01",
  ];
  const [address, setAddress] = useState(defaultAddresses[0]);
  const [ownAddress, setOwnAddress] = useState(
    "0xe626e8ca82603e3b44751f8562b5ed126d345140"
  );
  const [addresses, setAddresses] = useState(defaultAddresses);
  const [swipeIndex, setSwipeIndex] = useState(0);

  const like = (address: string) => {
    setConfetti(false);
    setSwipeIndex((index) => index + 1);
    setAddress(addresses[swipeIndex + 1]);
    setConfetti(true);
  };
  const dislike = (address: string) => {
    setSwipeIndex((index) => index + 1);
    setAddress(addresses[swipeIndex + 1]);
  };

  useEffect(() => {
    setOwnAddress(wallet?.accounts?.[0]?.address || ownAddress);
  }, [wallet?.accounts]);

  useEffect(() => {
    console.log(addresses);
    setAddress(addresses[0]);
  }, [addresses]);
  return (
    <React.Fragment>
      {confetti && <ConfettiHearts />}

      <Header />
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <ProfileCard address={address} like={like} dislike={dislike} />
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography
            onClick={() => {
              setConfetti(true);
              setInterval(() => setConfetti(false), 2500);
            }}
          ></Typography>
          <ProfileDetails addressA={ownAddress} addressB={address} />
        </Box>

        <Box sx={{ my: 4 }}>
          <MutualPoaps address={ownAddress} setAddresses={setAddresses} />
        </Box>

        <Box sx={{ my: 4, paddingBottom: 10, paddingTop: 10 }}>
          <Typography variant="h5" style={{ paddingBottom: "10px" }}>
            Made possible with:
          </Typography>
          <div>
            <img width="100%" src="./sponsors.jpg" />
          </div>
        </Box>
      </Container>
    </React.Fragment>
  );
}

export default App;
