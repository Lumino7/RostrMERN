import { useContext, useEffect, useState } from "react";
import { RostrContext } from "../../shared/context/rostr-context";
import ShiftCell from "./ShiftCell";

const TableBody = () => {
  let context = useContext(RostrContext);
  const { activeUser, weekStart, setWeekStart, refreshTrigger } = context;
  const [loadedShifts, setLoadedShifts] = useState();
  const [loadedUsers, setLoadedUsers] = useState();
  let formattedShiftRows;

  const week = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    week[i] = day;
  }

  useEffect(() => {
    const fetchShifts = async () => {
      let dateFrom = new Date(weekStart);
      dateFrom = dateFrom.toDateString();

      let dateTo = new Date(weekStart);
      dateTo.setDate(dateTo.getDate() + 6);
      dateTo = dateTo.toDateString();
      //   console.log(`dateFrom=${encodeURIComponent(dateFrom)}`);
      //   console.log(`dateTo=${encodeURIComponent(dateTo)}`);

      const url = `${process.env.REACT_APP_BACKEND_URL}/shifts?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;

      try {
        const response = await fetch(url);
        const responseData = await response.json();
        setLoadedShifts(responseData.shifts);
      } catch (err) {
        console.log(err);
      }
    };
    fetchShifts();
  }, [weekStart, refreshTrigger]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/users`,
        );
        const responseData = await response.json();
        setLoadedUsers(responseData.users);
        // console.log("here");
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, []);

  const formatShifts = () => {
    let formattedShiftRows = [];

    loadedUsers.forEach((user) => {
      let formattedShiftRow = {};
      formattedShiftRow.user = user;

      if (loadedShifts) {
        for (let i = 0; i < 7; i++) {
          formattedShiftRow[`shift${i}`] = loadedShifts.find(
            (shift) =>
              shift.user.id === user.id &&
              new Date(shift.date).toDateString() === week[i].toDateString(),
          );
        }
      }
      formattedShiftRows.push(formattedShiftRow);
    });

    formattedShiftRows.sort((a, b) =>
      a.user.lastName.localeCompare(b.user.lastName, undefined, {
        sensitivity: "base",
      }),
    );

    return formattedShiftRows;
  };

  if (loadedUsers) {
    formattedShiftRows = formatShifts();
  }

  return (
    <tbody>
      {formattedShiftRows?.map((shiftRow) => (
        <tr key={shiftRow.user.id}>
          {/* Format Name */}
          <td
            style={
              shiftRow.user.id === activeUser.userId
                ? { backgroundColor: "rgba(0, 0, 0, 0.1)" }
                : {}
            }
          >{`${shiftRow.user.lastName}, ${shiftRow.user.firstName}`}</td>

          {/* Map through the 7 shift slots */}
          {[
            "shift0",
            "shift1",
            "shift2",
            "shift3",
            "shift4",
            "shift5",
            "shift6",
          ].map((shiftNo, index) => (
            <ShiftCell
              key={`${shiftRow.user.id}-${shiftNo}`}
              shift={shiftRow[shiftNo]}
              shiftCellDate={week[index]}
              shiftUserId={shiftRow.user.id}
            />
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
