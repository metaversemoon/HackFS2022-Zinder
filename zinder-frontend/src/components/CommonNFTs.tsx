import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import useFetch from "use-http";

const recursiveFetch = async () => {};

export const NftExplorer = (props: { address: string }) => {
  const { address } = props;

  const [NFTSA, setNFTSA] = useState<any[]>([]);
  const [NFTSB, setNFTSB] = useState([]);

  // Init a bigData array to push new data on each iteration

  //   const fetchAllPaginateData = async (
  //     address: string,
  //     continuation = "",
  //     lastKey = ""
  //   ) => {
  //     try {
  //       const fetchURL = `https://api.nftport.xyz/v0/accounts/${address}?chain=ethereum${
  //         continuation !== "" ? `&continuation=${continuation}` : ""
  //       }`;
  //       const response = await fetch(fetchURL, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "07267954-3980-4a13-a092-265672aa2943",
  //         },
  //       });
  //       const data = await response.json();
  //       console.log(data);
  //       if (continuation === "" && lastKey === "") {
  //         setNFTSA((current) => [...current, ...(data.nfts as any)]);
  //       }
  //       //   const { data } = response;
  //       //   const { totalPages } = data; // Your api should give you a total page count, result or something to setup your iteration

  //       //   NFTSA.push(data); // push on big data response data

  //       //   // if current page isn't the last, call the fetch feature again, with page + 1
  //       //   if (
  //       //     pageKey < totalPages &&
  //       //     pageKey < 10 // (this is a test dev condition to limit for 10 result) */
  //       //   ) {
  //       //     pageKey++;
  //       //     await new Promise((resolve) => setTimeout(resolve, 200)); // setup a sleep depend your api request/second requirement.
  //       //     console.debug(pageKey, "/", totalPages);
  //       //     return await fetchAllPaginateData(pageKey);
  //       //   }

  //       //   console.clear();
  //       //   return console.info("Data complete.");
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  const [lastKey, setLastKey] = useState("start");
  const { get: searchNFT, response: accountNFTs } = useFetch<any>(
    `https://api.nftport.xyz/v0/accounts/${address}?chain=ethereum`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "07267954-3980-4a13-a092-265672aa2943",
      },
    }
  );

  useEffect(() => {
    searchNFT();
  });

  //   useEffect(() => {
  //     fetchAllPaginateData(address);
  //   }, [fetchAllPaginateData, address]);

  return <React.Fragment>{accountNFTs?.data?.total || 0}</React.Fragment>;
};
