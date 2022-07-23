import { GraphQLClient, useQuery } from "graphql-hooks";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";

export const getMutualPoaps = (address: string, owner: "A" | "B" = "A") =>
  `
  {
 
    mutualEvents(
      first:5,
      orderBy:mutualEventsCount,
      orderDirection:desc
      where:{mutualEventsCount_lt:10}


    ){
      id
      events {id}
      mutualEventsCount
    }
    
  }
`;
const columns: GridColDef[] = [
  { field: "id", headerName: "Address", width: 70 },
  { field: "mutualEventsCount", headerName: "Count", width: 70 },
  {
    field: "mutualEventString",
    headerName: "Events",
    width: 330,
  },
];

const convertRows = async (data: any) => {
  console.log(data);
  const events = data?.mutualEvents || [];
  const poapData = events.map(async (event: any) => {
    event.fetchedEvents = await Promise.all(
      event.events.map(async (event: any) => {
        const url = `https://api.poap.tech/metadata/${event.id}/1`;
        const data = await fetch(url);
        const jsondata = await data.json();
        return jsondata;
      })
    );
    event.mutualEventString = event.fetchedEvents
      .map((evt: any) => evt.name)
      .join(", ");
    return event;
  });
  return Promise.all(poapData);
};

export const ProfileDetails = () => {
  const address = "0xf7bcc2ee99fca65cb83dc9234fbb5ebd8af27a31";
  const endpoint =
    "https://api.thegraph.com/subgraphs/id/QmcPJp1DE3UnZc8ERvw2svtZeeLHiRKidj48BXv2kfpZrb";
  const graphql = new GraphQLClient({ url: endpoint });
  const { loading, error, data } = useQuery(getMutualPoaps(address, "A"), {
    client: graphql,
  });
  const [rows, setRows] = useState<any>([]);
  useEffect(() => {
    convertRows(data).then(setRows);
  }, [data]);
  return (
    <div style={{ height: 400, width: "100%" }}>
      <Typography variant="h5">Mutual Poaps:</Typography>
      <DataGrid
        loading={loading}
        rows={rows || []}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
    </div>
  );
};
