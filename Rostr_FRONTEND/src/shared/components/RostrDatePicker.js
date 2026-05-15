import { useState, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RostrContext } from "../context/rostr-context";

const isMonday = (date) => date.getDay() === 1;

const RostrDatePicker = (props) => {
  const context = useContext(RostrContext);
  const { weekStart, setWeekStart } = context;

  const handleDateChange = (date) => {
    setWeekStart(new Date(date));
  };

  return (
    <DatePicker
      selected={weekStart} // What is highlighted on the calendar
      onChange={handleDateChange}
      filterDate={isMonday} // Only allow Mondays
      dateFormat="dd-MMM-yyyy" // Matches your format
      placeholderText="Select a Monday"
      customInput={props.customInput} //replaces the date input bar.
    />
  );
};

export default RostrDatePicker;
