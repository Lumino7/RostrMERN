import React, { useState, useContext } from "react";
import NavBar from "../../shared/components/NavBar";
import RostrDatePicker from "../../shared/components/RostrDatePicker";
import ScheduleTable from "../components/ScheduleTable";
import Modal from "../../shared/components/Modal";
import { RostrContext } from "../../shared/context/rostr-context";

const SchedulePage = () => {
  const context = useContext(RostrContext);

  const { weekStart, setWeekStart } = context;

  const handleNextClick = (event) => {
    setWeekStart((weekStart) => {
      const nextWeekStart = new Date(weekStart).setDate(
        weekStart.getDate() + 7,
      );
      return new Date(nextWeekStart);
    });
  };

  const handlePrevClick = (event) => {
    setWeekStart((weekStart) => {
      const nextWeekStart = new Date(weekStart).setDate(
        weekStart.getDate() - 7,
      );
      return new Date(nextWeekStart);
    });
  };

  return (
    <>
      <NavBar />

      <div className="container-fluid">
        <div className="row">
          <div className="col-12 d-flex justify-content-center align-items-center gap-4 py-4">
            <button
              className="btn green-button"
              id="previous-button"
              aria-label="Previous Week"
              onClick={handlePrevClick}
            >
              {"<"}
            </button>
            <div className="date-selector">
              <RostrDatePicker
                customInput={
                  <h2 className="fw-bold " style={{ cursor: "pointer" }}>
                    Week of {weekStart.toDateString()}
                  </h2>
                }
              />
            </div>
            <div className="text-center"></div>
            <button
              className="btn green-button"
              id="next-button"
              aria-label="Next Week"
              onClick={handleNextClick}
            >
              {">"}
            </button>
          </div>
        </div>
        <ScheduleTable />
      </div>
    </>
  );
};

export default SchedulePage;
