import type { NextPage } from "next";
import { useState } from "react";
import TinderCard from "react-tinder-card";

const db = [
  {
    name: "Richard Hendricks",
    url: "https://picsum.photos/200/200",
  },
  {
    name: "Erlich Bachman",
    url: "https://picsum.photos/200/200",
  },
  {
    name: "Monica Hall",
    url: "https://picsum.photos/200/200",
  },
  {
    name: "Jared Dunn",
    url: "https://picsum.photos/200/200",
  },
  {
    name: "Dinesh Chugtai",
    url: "https://picsum.photos/200/200",
  },
];

const Home: NextPage = () => {
  const characters = db;
  const [lastDirection, setLastDirection] = useState();

  const swiped = (direction: any, nameToDelete: any) => {
    console.log("removing: " + nameToDelete);
    setLastDirection(direction);
  };

  const outOfFrame = (name: string) => {
    console.log(name + " left the screen!");
  };

  return (
    <div>
      {" "}
      {typeof window !== "undefined" && (
        <div style={{ height: "100px" }}>
          <link
            href="https://fonts.googleapis.com/css?family=Damion&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Alatsi&display=swap"
            rel="stylesheet"
          />
          <h1>React Tinder Card</h1>
          <div className="cardContainer">
            {characters.map((character) => (
              <TinderCard
                className="swipe"
                key={character.name}
                onSwipe={(dir) => swiped(dir, character.name)}
                onCardLeftScreen={() => outOfFrame(character.name)}
              >
                <div
                  style={{ backgroundImage: "url(" + character.url + ")" }}
                  className="card"
                >
                  <h3>{character.name}</h3>
                </div>
              </TinderCard>
            ))}
          </div>
          {lastDirection ? (
            <h2 className="infoText">You swiped {lastDirection}</h2>
          ) : (
            <h2 className="infoText" />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
