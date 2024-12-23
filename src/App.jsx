import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { calculateAnimalEarnings, setBalance } from "./redux/slices/barnSlice";
import {
  addExp,
  setUserAnimals,
  setUserLevelData,
} from "./redux/slices/userSlice";
import "./App.css";

const App = () => {
  const dispatch = useDispatch();
  const { balance } = useSelector((state) => state.barnyard);
  const {
    username,
    level,
    exp,
    requiredExp,
    animals: userAnimals,
  } = useSelector((state) => state.user);
  const [animalData, setAnimalData] = useState([]);

  useEffect(() => {
    fetch("/data/animal.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setAnimalData(data))
      .catch((error) => console.error("Error loading animal data:", error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (animalData.length > 0) {
        const earnings = {};
        const expRates = {};
        animalData.forEach((animal) => {
          earnings[animal.name.toLowerCase()] = animal.earnings;
          expRates[animal.name.toLowerCase()] = animal.exp;
        });

        const animals = userAnimals.reduce((acc, curr) => {
          const [key, value] = Object.entries(curr)[0];
          acc[key] = value;
          return acc;
        }, {});

        dispatch(calculateAnimalEarnings({ animals, earnings }));
        let totalExp = 0;
        Object.keys(animals).forEach((animal) => {
          totalExp += animals[animal] * expRates[animal];
        });
        dispatch(addExp(totalExp));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, animalData, userAnimals]);

  const handleAddAnimal = (animal) => {
    dispatch(setBalance(balance - animal.price));
    const updatedAnimals = userAnimals.map((obj) => {
      const [key] = Object.entries(obj)[0];
      if (key === animal.name.toLowerCase()) {
        return { [key]: obj[key] + 1 };
      }
      return obj;
    });
    dispatch(setUserAnimals(updatedAnimals));
  };

  const handleReset = () => {
    dispatch(setBalance(0));
    dispatch(
      setUserAnimals(
        userAnimals.map((obj) => {
          const [key] = Object.entries(obj)[0];
          return { [key]: key === "chicken" ? 1 : 0 };
        })
      )
    );
    dispatch(addExp(-exp));
    dispatch(setUserLevelData({ level: 1, exp: 0, requiredExp: 10 })); // Reset exp to 0
  };

  return (
    <>
      <h1>Barnvale</h1>
      <div className="user-info">
        <div className="user-detail">
          <div className="name-level">
            <p>{username}</p>
            <p>Lv: {level}</p>
          </div>
          <p>
            EXP: {exp.toFixed(2)} / {requiredExp}
          </p>
          <p>${balance.toFixed(2)}</p>
        </div>

        <div className="user-animal">
          {userAnimals.map((animalObj, index) => {
            const [animal, count] = Object.entries(animalObj)[0];
            const animalInfo = animalData.find(
              (data) => data.name.toLowerCase() === animal
            );

            if (!animalInfo) return null;

            return (
              <div key={index} className="animal-card">
                <img
                  src={animalInfo.image}
                  alt={animalInfo.name}
                  className="animal-image"
                />
                <p>: {count}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="buttons">
        {animalData.map((animal) => {
          const userAnimal = userAnimals.find(
            (obj) => Object.keys(obj)[0] === animal.name.toLowerCase()
          );
          const userAnimalCount = userAnimal ? Object.values(userAnimal)[0] : 0;

          return (
            <button
              key={animal.id}
              onClick={() => handleAddAnimal(animal)}
              disabled={
                balance < animal.price ||
                level < animal.level ||
                userAnimalCount >= animal.max
              }>
              Add {animal.name} (${animal.price}) (Requires Level {animal.level}
              )
            </button>
          );
        })}

        <button className="reset" onClick={handleReset}>
          Reset Game
        </button>
      </div>
    </>
  );
};

export default App;
