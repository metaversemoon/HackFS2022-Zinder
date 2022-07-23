import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { ProfileDetails } from "./components/ProfileDetails";
import { Container, Box, Typography } from "@mui/material";
import RecipeReviewCard from "./components/ProfileCard";
import { NftExplorer } from "./components/CommonNFTs";
import { Header } from "./components/Header";

import { init, useWallets } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import { defaultChains } from "./providerConfig";
import { ConfettiHearts } from "./components/DrawHearts";
import { useConnectWallet } from "@web3-onboard/react";
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

  return (
    <React.Fragment>
      {confetti && <ConfettiHearts />}

      <Header />
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <RecipeReviewCard />
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography
            onClick={() => {
              setConfetti(true);
              setInterval(() => setConfetti(false), 2500);
            }}
          ></Typography>
          <ProfileDetails />
        </Box>
      </Container>
    </React.Fragment>
  );
}

export default App;
