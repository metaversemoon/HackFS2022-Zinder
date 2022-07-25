import { GraphQLClient, useQuery } from "graphql-hooks";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { getMutualPoapsBetweenAandBQuery } from "../utils/queries";
import React from "react";

const columns: GridColDef[] = [
  { field: "id", headerName: "Event", width: 100 },
  { field: "name", headerName: "Name", width: 300 },
  { field: "year", headerName: "Year", width: 70 },
  {
    field: "image_url",
    headerName: "",
    renderCell: (params) => {
      return (
        <React.Fragment>
          <img height="90%" src={params?.value} />
        </React.Fragment>
      );
    },
    width: 80,
  },
];

const convertRows = async (data: any) => {
  const events = data?.mutualEvents || [];
  const poapData = await Promise.all(
    events.map(async (event: any) => {
      event.fetchedEvents = await Promise.all(
        event.events.map(async (event: any) => {
          const url = `https://api.poap.tech/metadata/${event.id}/1`;
          const data = await fetch(url);
          const jsondata = await data.json();
          jsondata.id = event.id;
          return jsondata;
        })
      );
      event.mutualEventString = event.fetchedEvents
        .map((evt: any) => evt.name)
        .join(", ");
      return event;
    })
  );

  return (poapData as any)?.[0]?.fetchedEvents || [];
};

export const ProfileDetails = ({
  addressA,
  addressB,
}: {
  addressA: string;
  addressB: string;
}) => {
  const endpoint =
    "https://api.thegraph.com/subgraphs/id/QmcPJp1DE3UnZc8ERvw2svtZeeLHiRKidj48BXv2kfpZrb";
  const graphql = new GraphQLClient({ url: endpoint });

  const { loading, error, data } = useQuery(
    getMutualPoapsBetweenAandBQuery(addressA, addressB),
    {
      client: graphql,
    }
  );
  const [rows, setRows] = useState<any>([]);
  useEffect(() => {
    convertRows(data).then(setRows);
  }, [data]);
  return (
    <div style={{ height: 400, width: "100%" }}>
      <Typography variant="h5" style={{ paddingBottom: "10px" }}>
        Mutual Poaps:
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
