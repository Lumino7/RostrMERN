import { useState, useContext, useEffect } from "react";
import { RostrContext } from "../../shared/context/rostr-context";
import Modal from "../../shared/components/Modal";
import formatTime from "../../shared/util/formatTime";

const ShiftCell = (props) => {
  const [showModal, setShowModal] = useState(false);
  const onModalClose = () => setShowModal(false);

  const { updatedShifts, refreshTrigger, activeUser } =
    useContext(RostrContext);

  const matchingUpdatedShift = updatedShifts.find((updatedShift) => {
    return (
      updatedShift.user == props.shiftUserId &&
      new Date(updatedShift.date).toDateString() ==
        new Date(props.shiftCellDate).toDateString()
    );
  });

  const activeShift = matchingUpdatedShift || props.shift;
  const isUpdated = !!matchingUpdatedShift;

  let cellStyle;

  if (isUpdated) {
    cellStyle = { backgroundColor: "rgba(47, 180, 247, 0.3)" };
  } else if (props.shiftUserId === activeUser.userId) {
    cellStyle = { backgroundColor: "rgba(0, 0, 0, 0.1)" };
  } else {
    cellStyle = {};
  }

  const cellContent =
    activeShift?.type === "off"
      ? "Off"
      : `${formatTime(activeShift?.start)} - ${formatTime(activeShift?.end)}`;

  return (
    <>
      {activeUser.userRole === "admin" && (
        <Modal
          showModal={showModal}
          onModalClose={onModalClose}
          shift={props.shift}
          shiftCellDate={props.shiftCellDate}
          shiftUserId={props.shiftUserId}
        />
      )}
      <td
        onClick={() => {
          return setShowModal(true);
        }}
        style={cellStyle}
      >
        {activeShift && cellContent && (
          <div style={{ textAlign: "center" }}>
            <div>{cellContent}</div>
            {activeShift.type === "on-call" && <div>On-Call</div>}
          </div>
        )}
      </td>
    </>
  );
};

export default ShiftCell;
