import { GraphQLClient } from "graphql-hooks";

export const getMostCommonMutualPoapsQuery = (address: string) =>
  `
  {
 
    mutualEvents(
      first:100,
      orderBy:mutualEventsCount,
      orderDirection:desc,

    ){
      id
      events {id}
      ownerA{id}
      mutualEventsCount
    }

     
  }
`;
export const getMutualPoapsQuery = (address: string) =>
  `
  {
 
    mutualEvents(
      first:100,
      orderBy:mutualEventsCount,
      orderDirection:desc,
      where:{ownerA:"${address}"}


    ){
      id
      events {id}
      ownerA{id}
      mutualEventsCount
    }

    mutualEvents(
      first:100,
      orderBy:mutualEventsCount,
      orderDirection:desc,
      where:{ownerB:"${address}"}


    ){
      id
      events {id}
      ownerB{id}
      mutualEventsCount
    }
    
  }
`;

export const getMutualPoapsBetweenAandBQuery = (
  addressA: string,
  addressB: string
) => {
  let addresses = [addressA, addressB];
  if (addressA > addressB) {
    addresses = [addressB, addressA];
  }

  return `
  {
 
    mutualEvents(
      first:100,
      orderBy:mutualEventsCount,
      orderDirection:desc,
      where:{ownerA:"${addresses[0]}", ownerB:"${addresses[1]}"}


    ){
      id
      events {id}
      ownerA{id}
      mutualEventsCount
    }
    
  }
`;
};

export const getMutualPoaps = async (
  address: string,
  client: GraphQLClient
) => {
  if (!client) {
    return [];
  }
  try {
    const { data } = await (client as any).requestViaHttp({
      query: getMutualPoapsQuery(address),
    });
    const mutualEvents = [];
    for (const mutualEvent of data.mutualEvents) {
      mutualEvents.push({
        events: mutualEvent.events,
        mutualEventsCount: mutualEvent.events.length,
        addressA: address,
        addressB:
          mutualEvent?.ownerA?.id === address
            ? mutualEvent?.ownerB?.id
            : mutualEvent?.ownerA?.id,
      });
    }
    mutualEvents.sort((a: any, b: any) => {
      return b.mutualEventsCount - a.mutualEventsCount;
    });
    console.log("mutualEvents", mutualEvents);
    return mutualEvents;
  } catch (err) {
    console.log(err);
    return [];
  }
};
