import { ethereum, BigInt } from "@graphprotocol/graph-ts";

import {
  EventToken as EventTokenEvent,
  Transfer as TransferEvent,
} from "../generated/Poap/Poap";

import {
  Token,
  Account,
  Event,
  Transfer,
  MutualEvent,
  EventIterator, //workaround https://github.com/graphprotocol/graph-ts/issues/219
} from "../generated/schema";

import { log } from "@graphprotocol/graph-ts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const sortStrings = (a: string, b: string): string[] => {
  if (a > b) {
    return [b, a];
  }
  return [a, b];
};

function createEventID(event: ethereum.Event): string {
  return event.block.number
    .toString()
    .concat("-")
    .concat(event.logIndex.toString());
}

export function handleEventToken(ev: EventTokenEvent): void {
  let event = Event.load(ev.params.eventId.toString());
  let eventIterator = EventIterator.load(ev.params.eventId.toString());
  // This handler always run after the transfer handler
  let token = Token.load(ev.params.tokenId.toString());
  if (token == null) {
    return;
  }
  if (event == null) {
    event = new Event(ev.params.eventId.toString());
    event.tokenCount = BigInt.fromI32(0);
    event.tokenMints = BigInt.fromI32(0);
    event.transferCount = BigInt.fromI32(0);
    event.created = ev.block.timestamp;
  }
  if (eventIterator == null) {
    eventIterator = new EventIterator(ev.params.eventId.toString());
    eventIterator.ownerCount = BigInt.fromI32(0);
    eventIterator.owners = [];
  }
  eventIterator.ownerCount += BigInt.fromI32(1);

  event.tokenCount += BigInt.fromI32(1);
  event.tokenMints += BigInt.fromI32(1);
  event.transferCount += BigInt.fromI32(1);
  if (event.id != null) {
    token.event = event.id;
    token.mintOrder = event.tokenMints;
    eventIterator.save();
    event.save();
    token.save();
  }
}

export function handleTransfer(ev: TransferEvent): void {
  let token = Token.load(ev.params.tokenId.toString());
  let from = Account.load(ev.params.from.toHex());
  let to = Account.load(ev.params.to.toHex());
  let transfer = new Transfer(createEventID(ev));

  if (from == null) {
    from = new Account(ev.params.from.toHex());
    // The from account at least has to own one token
    from.tokensOwned = BigInt.fromI32(1);
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
  if (token.event == null) {
    return;
  }
  let eventId = token.event!.toString();
  let event = Event.load(eventId); //bug
  let eventIterator = EventIterator.load(eventId);
  // if(eventIterator == null){
  //   eventIterator = new EventIterator
  // }
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
  }

  if (eventIterator != null && event != null) {
    if (to.id != ZERO_ADDRESS) {
      if (eventIterator.owners.length > 0) {
        log.warning("NO ZERO OWNERS", []);
        for (
          let eventIteratorIndex = 0;
          eventIteratorIndex < eventIterator.owners.length;
          eventIteratorIndex++
        ) {
          const mutualX = eventIterator.owners[eventIteratorIndex];
          if (to.id != mutualX) {
            const sortedString: string[] = sortStrings(mutualX, to.id);
            const mutualKey: string = sortedString[0]
              .concat("-")
              .concat(sortedString[1]);
            let mutualEvent = MutualEvent.load(mutualKey);
            if (mutualEvent == null) {
              mutualEvent = new MutualEvent(mutualKey);
              mutualEvent.ownerA = sortedString[0];
              mutualEvent.ownerB = sortedString[1];
              mutualEvent.events = [event.id];
              mutualEvent.mutualEventsCount = BigInt.fromI32(1);
              mutualEvent.save();
            } else {
              const mutualEvents = mutualEvent.events;
              mutualEvents.push(event.id);
              mutualEvent.events = mutualEvents;
              mutualEvent.mutualEventsCount = BigInt.fromI32(
                mutualEvents.length
              );
              mutualEvent.save();
            }
          }
        }
      }
      const eventOwners = eventIterator.owners;

      eventOwners.push(to.id);
      eventIterator.owners = eventOwners;
      eventIterator.ownerCount += BigInt.fromI32(1);
      eventIterator.save();
    }
  }

  transfer.token = token.id;
  transfer.from = from.id;
  transfer.to = to.id;
  transfer.transaction = ev.transaction.hash;
  transfer.timestamp = ev.block.timestamp;
  transfer.save();
}
