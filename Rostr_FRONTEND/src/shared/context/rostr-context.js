import { createContext, useState } from "react";

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // Get the day of the week, use 7 instead of 0 if Sunday
  if (day !== 1) {
    d.setDate(d.getDate() - (day - 1)); // Set the date to the Monday of the current week
  }
  return d;
}

const initialDate = getMonday(new Date());

export const RostrContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  token: null,
  setToken: () => {},
  activeUser: null,
  setActiveUser: () => {},
  weekStart: null,
  setWeekStart: () => {},
  updatedShifts: [],
  setUpdatedShifts: () => {},
  refreshTrigger: 0, //anything that has refreshTrigger either as a prop or dependency will re-render whenever triggerRefresh is called.
  triggerRefresh: () => {},
});

export const RostrProvider = (props) => {
  const [weekStart, setWeekStart] = useState(initialDate);
  const [updatedShifts, setUpdatedShifts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [activeUser, setActiveUser] = useState({
    userId: "",
    userRole: "",
  });

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <RostrContext.Provider
      value={{
        token,
        setToken,
        activeUser,
        setActiveUser,
        isLoggedIn,
        setIsLoggedIn,
        weekStart,
        setWeekStart,
        updatedShifts,
        setUpdatedShifts,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {props.children}
    </RostrContext.Provider>
  );
};
