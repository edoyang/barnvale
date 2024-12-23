import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "John",
  lastOnline: null,
  level: 1,
  exp: 0,
  requiredExp: 10,
  animals: [{ chicken: 1 }, { pig: 0 }, { sheep: 0 }, { cow: 0 }],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLastOnline: (state, action) => {
      state.lastOnline = action.payload;
    },
    setUserAnimals: (state, action) => {
      state.animals = action.payload;
    },
    setUserLevelData: (state, action) => {
      const { level, exp, requiredExp } = action.payload;
      state.level = level;
      state.exp = exp;
      state.requiredExp = requiredExp;
    },
    addExp: (state, action) => {
      const expGained = action.payload;
      state.exp += expGained;
      if (state.exp >= state.requiredExp) {
        state.exp -= state.requiredExp;
        state.level += 1;
        state.requiredExp = state.level * 10 + state.requiredExp;
      }
    },
    addAnimalToUser: (state, action) => {
      const { animal } = action.payload;
      const updatedAnimals = state.animals.map((obj) => {
        const [key] = Object.entries(obj)[0];
        if (key === animal) {
          return { [key]: obj[key] + 1 };
        }
        return obj;
      });
      state.animals = updatedAnimals;
    },
  },
});

export const {
  setLastOnline,
  setUserAnimals,
  setUserLevelData,
  addExp,
  addAnimalToUser,
} = userSlice.actions;
export default userSlice.reducer;
