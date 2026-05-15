import { useContext, useEffect } from "react";
import { RostrContext } from "../../shared/context/rostr-context";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";

const ScheduleTable = (props) => {
  const {
    activeUser,
    updatedShifts,
    setUpdatedShifts,
    triggerRefresh,
    refreshTrigger,
  } = useContext(RostrContext);

  const handleChangesSubmit = async (event) => {
    if (activeUser.userRole === "admin") {
      event.preventDefault();

      try {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/shifts/batch`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shifts: updatedShifts }),
        });
        alert("Shift Submitted Successfully");
        setUpdatedShifts([]);
        triggerRefresh();
      } catch (err) {
        console.log(err);
      }
    } else {
      alert("You are not authorized to edit shifts.");
    }
  };

  return (
    <>
      {updatedShifts.length > 0 && (
        <div className={"flex justify-end mb-4"}>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={handleChangesSubmit}
          >
            {" "}
            Save Changes
          </button>
        </div>
      )}
      <div className="row">
        <div
          className="col-12"
          style={{ maxWidth: "100%" }}
          id="sched-container"
        >
          <table className="table" id="sched-table">
            <TableHeader refreshTrigger={refreshTrigger} />
            <TableBody />
          </table>
        </div>
      </div>
    </>
  );
};

export default ScheduleTable;
