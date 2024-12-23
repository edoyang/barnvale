import { configureStore } from "@reduxjs/toolkit";
import barnReducer from "./slices/barnSlice";
import userReducer from "./slices/userSlice";

const store = configureStore({
  reducer: {
    barnyard: barnReducer,
    user: userReducer,
  },
});

window.addEventListener("beforeunload", () => {
  const state = store.getState();
  localStorage.setItem("barnyardBalance", state.barnyard.balance);
  localStorage.setItem("userAnimals", JSON.stringify(state.user.animals));
  localStorage.setItem("userLevel", state.user.level);
  localStorage.setItem("userExp", state.user.exp);
  localStorage.setItem("userRequiredExp", state.user.requiredExp);
  localStorage.setItem("userLastOnline", JSON.stringify(Date.now()));
});

const savedBalance = localStorage.getItem("barnyardBalance");
const savedUserAnimals = localStorage.getItem("userAnimals");
const savedLastOnline = localStorage.getItem("userLastOnline");
const savedLevel = localStorage.getItem("userLevel");
const savedExp = localStorage.getItem("userExp");
const savedRequiredExp = localStorage.getItem("userRequiredExp");

if (savedBalance !== null) {
  store.dispatch({
    type: "barnyard/setBalance",
    payload: parseFloat(savedBalance),
  });
}

if (savedUserAnimals !== null) {
  store.dispatch({
    type: "user/setUserAnimals",
    payload: JSON.parse(savedUserAnimals),
  });
}

if (savedLevel !== null && savedExp !== null && savedRequiredExp !== null) {
  store.dispatch({
    type: "user/setUserLevelData",
    payload: {
      level: parseInt(savedLevel, 10),
      exp: parseFloat(savedExp),
      requiredExp: parseInt(savedRequiredExp, 10),
    },
  });
}

if (savedLastOnline !== null) {
  const lastOnline = parseInt(savedLastOnline, 10);
  const currentTime = Date.now();
  const timeElapsedInSeconds = Math.floor((currentTime - lastOnline) / 1000);

  fetch("/data/animal.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((animalsData) => {
      const earnings = {};
      const expRates = {};
      animalsData.forEach((animal) => {
        earnings[animal.name.toLowerCase()] = animal.earnings;
        expRates[animal.name.toLowerCase()] = animal.exp;
      });
      const animals = store.getState().user.animals.reduce((acc, curr) => {
        const [key, value] = Object.entries(curr)[0];
        acc[key] = value;
        return acc;
      }, {});

      store.dispatch({
        type: "barnyard/calculateOfflineEarnings",
        payload: {
          animals,
          earnings,
          expRates,
          timeElapsed: timeElapsedInSeconds,
        },
      });

      let totalExp = 0;
      Object.keys(animals).forEach((animal) => {
        totalExp += animals[animal] * expRates[animal] * timeElapsedInSeconds;
      });
      store.dispatch({
        type: "user/addExp",
        payload: totalExp,
      });
    })
    .catch((error) => console.error("Error loading animal data:", error));

  store.dispatch({
    type: "user/setLastOnline",
    payload: currentTime,
  });
}

export default store;
