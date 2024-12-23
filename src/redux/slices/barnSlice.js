import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
};

const barnSlice = createSlice({
  name: "barnyard",
  initialState,
  reducers: {
    calculateAnimalEarnings: (state, action) => {
      const { animals, earnings, expRates } = action.payload;
      Object.keys(animals).forEach((animal) => {
        state.balance += animals[animal] * earnings[animal];
      });
    },
    calculateOfflineEarnings: (state, action) => {
      const { animals, earnings, expRates, timeElapsed } = action.payload;
      Object.keys(animals).forEach((animal) => {
        state.balance += animals[animal] * earnings[animal] * timeElapsed;
      });
    },
    addAnimal: (state, action) => {
      const { animal, price } = action.payload;
      if (state.balance >= price) {
        state.balance -= price;
      }
    },
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
  },
});

export const {
  calculateAnimalEarnings,
  calculateOfflineEarnings,
  addAnimal,
  setBalance,
} = barnSlice.actions;
export default barnSlice.reducer;
