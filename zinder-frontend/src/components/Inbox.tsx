import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  MessageList,
  Input as ChatInput,
  Button as ChatButton,
} from "react-chat-elements";

export const token = () => {
  return Math.floor((Math.random() * 10) % 8);
};

const txtMessage = {
  type: "text",
  id: Math.random() + "",
  position: token() >= 1 ? "right" : "left",
  text: "asdasd",
  title: "asdasd",
  focus: true,
  date: +new Date(),
  dateString: "now",
  // avatar: `data:image/png;base64,${photo(20)}`,
  // titleColor: getRandomColor(),
  forwarded: true,
  replyButton: true,
  removeButton: true,
  status: "received",
  notch: true,
  copiableDate: true,
  retracted: false,
  className: "",
};

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return () => setValue(() => value + 1);
}

export const Inbox = ({
  setDrawerOpen,
}: {
  setDrawerOpen: (status: boolean) => void;
}) => {
  const [messageListArray, setMessageListArray] = useState<any>([]);
  const [status, setStatus] = useState<string>("");
  const messageListReference = React.useRef();
  const inputReferance = React.useRef();
  const [messageList, setMessageList] = useState(false);
  const forceUpdate = useForceUpdate();

  let clearRef = () => {};
  const addMessage = (data: number) => {
    setMessageListArray([...messageListArray, txtMessage]);
    clearRef();
    forceUpdate();
  };

  return (
    <React.Fragment>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(false)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Chats
          </Typography>
        </Toolbar>
      </AppBar>
      {messageList ? (
        <div>
          <MessageList
            className="message-list"
            referance={messageListReference}
            lockable={true}
            downButton={false}
            downButtonBadge={10}
            sendMessagePreview={true}
            dataSource={
              [
                {
                  position: "right",
                  type: "text",
                  text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit",
                  date: new Date(),
                },
              ] as any
            }
          />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              right: 0,
              left: 0,
              margin: "0 auto 1rem auto",
              width: "60%",
            }}
          >
            <ChatInput
              className="rce-example-input"
              placeholder="Write your message here."
              defaultValue=""
              referance={inputReferance}
              clear={(clear: any) => (clearRef = clear)}
              maxHeight={50}
              onKeyPress={(e: any) => {
                if (e.shiftKey && e.charCode === 13) {
                  return true;
                }
                if (e.charCode === 13) {
                  clearRef();
                  addMessage(token());
                }
              }}
              rightButtons={
                <ChatButton text="Submit" onClick={() => addMessage(token())} />
              }
            />
          </div>
        </div>
      ) : (
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
      )}
    </React.Fragment>
  );
};
