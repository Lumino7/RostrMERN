import { useContext } from "react";
import { RostrContext } from "../../shared/context/rostr-context";

const TableHeader = () => {
  const context = useContext(RostrContext);
  const getWeekDates = (date) => {
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(date); // clone!
      tempDate.setDate(tempDate.getDate() + i);

      const formattedDate = tempDate.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      dates.push(formattedDate);
    }
    return dates;
  };

  const weekDates = getWeekDates(context.weekStart);

  return (
    <thead>
      <tr>
        <th>Name</th>
        {weekDates.map((dateStr, index) => (
          <th key={index}>{dateStr}</th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
