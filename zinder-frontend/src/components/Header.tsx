import {
  AppBar,
  Toolbar,
  Typography,
  Link,
  Button,
  Backdrop,
  Box,
  Fade,
  Modal,
  styled,
  Skeleton,
  Dialog,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MarkunreadIcon from "@mui/icons-material/Markunread";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { TransitionProps } from "@mui/material/transitions";
import Slide from "@mui/material/Slide";

import React, { useState } from "react";
import SignUp from "./SignUp";
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import IconButton from "@mui/material/IconButton";
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

  const toggleDrawer = (newOpen: boolean) => () => {
    console.log("NEW");
    setDrawerOpen(newOpen);
  };

  return (
    <React.Fragment>
      <AppBar position="static" color="transparent" elevation={1}>
        <Toolbar sx={{ flexWrap: "wrap", height: 10 }}>
          <Typography variant="h5" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Zinder
          </Typography>
          <nav>
            <IconButton aria-label="messages">
              <MarkunreadIcon height={30} onClick={toggleDrawer(true)} />
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
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Chats
            </Typography>
          </Toolbar>
        </AppBar>
        <List>
          <ListItem button>
            <ListItemText
              primary="0x940f2dCdd20232377BcD522b9562BB533eED9E53"
              secondary="New Match with Beary"
            />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText
              primary="0xaE87c8148C417445f4AF84008cd6c50a67bc5CBB"
              secondary="That's my favorite festival too"
            />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText
              primary="0x86c8B2ba94D23603178B78b6521B655c1A123b09"
              secondary="I love the Patrizio POAP"
            />
          </ListItem>
        </List>
      </Dialog>
    </React.Fragment>
  );
};
