import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Backdrop,
  Box,
  Fade,
  Modal,
  Dialog,
} from "@mui/material";
import MarkunreadIcon from "@mui/icons-material/Markunread";
import { TransitionProps } from "@mui/material/transitions";
import Slide from "@mui/material/Slide";
import { ExampleChatService } from "@chatscope/use-chat/dist/examples";

import React, { useState } from "react";
import SignUp from "./SignUp";
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import IconButton from "@mui/material/IconButton";
import { Inbox } from "./Inbox";
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  maxWidth: "400px",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Header = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const connectedWallets = useWallets();
  const provider = connectedWallets.find(({ provider }) => provider);
  const login = (provider: any) => {
    const ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    const signer = ethersProvider.getSigner();
    console.log(signer);
  };

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <React.Fragment>
      <AppBar position="static" color="transparent" elevation={1}>
        <Toolbar sx={{ flexWrap: "wrap", height: 10 }}>
          <Typography variant="h5" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Zinder
          </Typography>
          <nav>
            <IconButton aria-label="messages">
              <MarkunreadIcon height={30} onClick={() => setDrawerOpen(true)} />
            </IconButton>
          </nav>
          <Button
            href="#"
            variant={wallet ? "outlined" : "contained"}
            onClick={() => {
              if (!wallet) {
                connect();
              } else {
                disconnect(wallet);
              }
            }}
            sx={{ my: 0.5, mx: 1.5, height: 30 }}
          >
            {wallet ? "Logout" : "Login"}
          </Button>
          {/* <Button
          href="#"
          sx={{ my: 0.5, mx: 1.5, height: 30 }}
          onClick={handleOpen}
        >
          Sign up
        </Button> */}
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={open}>
              <Box sx={style}>
                <SignUp />
              </Box>
            </Fade>
          </Modal>
        </Toolbar>
      </AppBar>

      <Dialog
        fullScreen
        open={drawerOpen}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <Inbox setDrawerOpen={setDrawerOpen} />
      </Dialog>
    </React.Fragment>
  );
};
