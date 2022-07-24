import { GraphQLClient, useQuery } from "graphql-hooks";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { getMutualPoaps, getMutualPoapsQuery } from "../utils/queries";

const columns: GridColDef[] = [
  { field: "addressB", headerName: "Address", width: 100 },
  { field: "mutualEventsCount", headerName: "Count", width: 70 },
  {
    field: "mutualEventString",
    headerName: "Events",
    width: 330,
  },
];

const convertRows = async (data: any) => {
  const events = data || [];
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
    event.id = event.addressB;
    return event;
  });
  return Promise.all(poapData);
};

export const MutualPoaps = ({ address }: { address: string }) => {
  const endpoint =
    "https://api.thegraph.com/subgraphs/id/QmcPJp1DE3UnZc8ERvw2svtZeeLHiRKidj48BXv2kfpZrb";
  const graphql = new GraphQLClient({ url: endpoint });
  const [rows, setRows] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getMutualPoaps("0xe626e8ca82603e3b44751f8562b5ed126d345140", graphql)
      .then(convertRows)
      .then((data) => {
        console.log("DATA");
        setRows(data);
        setLoading(false);
      });
  }, [address]);
  return (
    <div style={{ height: 500, width: "100%", marginTop: 70 }}>
      <Typography variant="h5" style={{ paddingBottom: "10px" }}>
        POAP Users like you:
      </Typography>
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
