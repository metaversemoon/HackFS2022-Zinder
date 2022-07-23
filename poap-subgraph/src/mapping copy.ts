import { ethereum, BigInt } from "@graphprotocol/graph-ts";

import {
  EventToken as EventTokenEvent,
  Transfer as TransferEvent,
} from "../generated/Poap/Poap";

import { log } from "@graphprotocol/graph-ts";

import {
  Token,
  Account,
  Event,
  Transfer,
  MutualEvent,
  //workaround https://github.com/graphprotocol/graph-ts/issues/219
  AccountIterator,
} from "../generated/schema";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function createEventID(event: ethereum.Event): string {
  return event.block.number
    .toString()
    .concat("-")
    .concat(event.logIndex.toString());
}

export function handleEventToken(ev: EventTokenEvent): void {
  const eventId = ev.params.eventId.toString();
  let event = Event.load(eventId);
  // This handler always run after the transfer handler
  let token = Token.load(ev.params.tokenId.toString());
  if (token == null) {
    return;
  }
  if (event == null) {
    event = new Event(eventId);
    event.tokenCount = BigInt.fromI32(0);
    event.tokenMints = BigInt.fromI32(0);
    event.transferCount = BigInt.fromI32(0);
    event.created = ev.block.timestamp;
  }

  event.tokenCount += BigInt.fromI32(1);
  event.tokenMints += BigInt.fromI32(1);
  event.transferCount += BigInt.fromI32(1);
  token.event = event.id;
  token.mintOrder = event.tokenMints;
  event.save();
  token.save();
}

export function handleTransfer(ev: TransferEvent): void {
  let token = Token.load(ev.params.tokenId.toString());
  let from = Account.load(ev.params.from.toHex());
  let fromI = AccountIterator.load(ev.params.from.toHex());
  let to = Account.load(ev.params.to.toHex());
  let toI = AccountIterator.load(ev.params.to.toHex());
  let transfer = new Transfer(createEventID(ev));

  if (from == null) {
    from = new Account(ev.params.from.toHex());
    // The from account at least has to own one token
    from.tokensOwned = BigInt.fromI32(1);

    fromI = new AccountIterator(ev.params.from.toHex());
    fromI.events = [];
    fromI.eventCount = BigInt.fromI32(0);
  }
  // Don't subtracts from the ZERO_ADDRESS (it's the one that mint the token)
  // Avoid negative values
  if (from.id != ZERO_ADDRESS) {
    from.tokensOwned -= BigInt.fromI32(1);
  }
  from.save();

  if (to == null) {
    to = new Account(ev.params.to.toHex());
    to.tokensOwned = BigInt.fromI32(0);
    toI = new AccountIterator(ev.params.to.toHex());
    toI.events = [];
    toI.eventCount = BigInt.fromI32(0);
  }
  to.tokensOwned += BigInt.fromI32(1);
  to.save();

  if (token == null) {
    token = new Token(ev.params.tokenId.toString());
    token.transferCount = BigInt.fromI32(0);
    token.created = ev.block.timestamp;
  }
  token.owner = to.id;
  token.transferCount += BigInt.fromI32(1);
  token.save();
  let event: Event | null = null;
  let eventId = "";
  if (token.event != null) {
    eventId = token.event!.toString();
    event = Event.load(eventId); //bug
  }
  if (fromI != null && eventId.length > 0) {
    fromI.events.push(eventId);
    fromI.eventCount = BigInt.fromI32(fromI.events.length);
  }
  if (fromI != null) {
    fromI.save();
  }
  if (toI != null && eventId.length > 0) {
    if (toI.events.length == 0) {
      toI.events = [eventId];
    } else {
      toI.events.push(eventId);
      toI.events = toI.events;
    }
    toI.eventCount = BigInt.fromI32(toI.events.length);

    log.warning("TO: {}", [eventId]);
  }
  if (toI != null) {
    toI.save();
  }
  if (event != null) {
    // Add one transfer
    event.transferCount += BigInt.fromI32(1);

    // Burning the token
    if (to.id == ZERO_ADDRESS) {
      event.tokenCount -= BigInt.fromI32(1);
      // Subtract all the transfers from the burned token
      event.transferCount -= token.transferCount;
    }
    event.save();
    event = Event.load(eventId);
    if (event != null) {
      if (false) {
        // for (let tokenIndex = 0; tokenIndex < event.tokens.length; tokenIndex++) {
        //   const eventToken = event.tokens[tokenIndex];
        //   log.warning("TOKEN: {}", [eventToken]);
        //   const ownerToken = new Token(eventToken);
        //   if (
        //     ownerToken.owner &&
        //     ownerToken.owner.toString() != to.id.toString()
        //   ) {
        //     const mutualKey: String = ownerToken.owner + ":" + to.id.toString();
        //     log.warning("MutualKey: {}", [mutualKey.toString()]);
        //     let mutualEvent = MutualEvent.load(mutualKey);
        //     if (mutualEvent == null) {
        //       mutualEvent = new MutualEvent(mutualKey);
        //       mutualEvent.ownerA = ownerToken.owner;
        //       mutualEvent.ownerB = to.id.toString();
        //       mutualEvent.events = [event.id];
        //       mutualEvent.mutualEventsCount = BigInt.fromI32(1);
        //     } else {
        //       //           mutualPoaps.events =
        //       mutualEvent.mutualEventsCount += BigInt.fromI32(1);
        //     }
        //     mutualEvent.save();
        //   }
        // }
      }
    }
  }

  transfer.token = token.id;
  transfer.from = from.id;
  transfer.to = to.id;
  transfer.transaction = ev.transaction.hash;
  transfer.timestamp = ev.block.timestamp;
  transfer.save();
}
