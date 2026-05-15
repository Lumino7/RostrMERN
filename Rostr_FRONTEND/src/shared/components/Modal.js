import { useState, useRef, useEffect, useContext } from "react";
import { RostrContext } from "../context/rostr-context";
import ReactDOM from "react-dom";
import formatTime from "../util/formatTime";

const Modal = ({
  showModal,
  onModalClose,
  shift,
  shiftCellDate,
  shiftUserId,
  children,
}) => {
  let context = useContext(RostrContext);
  let { updatedShifts, setUpdatedShifts, triggerRefresh } = context;
  const dialogRef = useRef(null);

  const initialFormData = {
    start: shift ? formatTime(shift.start) : "",
    end: shift ? formatTime(shift.end) : "",
    isOnCall: shift?.type === "on-call" || false,
    isOff: shift?.type === "off" || false,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (showModal) {
      setFormData(initialFormData);
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [showModal, initialFormData]);

  // Optional: Handle the "Esc" key or Backdrop click native 'close' event
  const handleNativeClose = (e) => {
    onModalClose();
    //onModalClose calls setShowModal to false, so React is also aware that the modal was closed.
  };

  const handleBackDropClick = (event) => {
    // when a dialog is open, the browser expands it to cover the viewport.
    // If the user clicked a button inside, event.target is the Button.
    // Button !== Dialog, so nothing happens. Modal stays open.
    if (event.target === dialogRef.current) {
      onModalClose();
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const val = type === "checkbox" ? checked : value;

    if (name === "isOff" && val === true) {
      // Logic: "Off" clears everything else
      setFormData({
        start: "",
        end: "",
        isOnCall: false,
        isOff: true,
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const formatSubmittedShift = () => {
    if (formData.isOff) {
      return {
        date: shift
          ? new Date(shift.date).toDateString()
          : shiftCellDate.toDateString(),
        user: shiftUserId,
        type: "off",
      };
    }

    const [startHour, startMinutes] = formData.start.split(":");
    const startMilliseconds = new Date(shift?.date || shiftCellDate).setHours(
      startHour,
      startMinutes,
      0,
      0,
    );
    const submittedStart = new Date(startMilliseconds).toISOString();
    const [endHour, endMinutes] = formData.end.split(":");
    const endMilliseconds = new Date(shift?.date || shiftCellDate).setHours(
      endHour,
      endMinutes,
      0,
      0,
    );
    const tempEnd = new Date(endMilliseconds);
    let submittedEnd;

    // add 1 day to end if start < end
    if (startMilliseconds < endMilliseconds) {
      submittedEnd = tempEnd.toISOString();
    } else {
      submittedEnd = new Date(
        tempEnd.setDate(tempEnd.getDate() + 1),
      ).toISOString();
    }

    let shiftType = "work";
    if (formData.isOff) {
      shiftType = "off";
    } else if (formData.isOnCall) {
      shiftType = "on-call";
    }

    return {
      date: shift
        ? new Date(shift.date).toDateString()
        : shiftCellDate.toDateString(),
      user: shiftUserId,
      start: submittedStart,
      end: submittedEnd,
      type: shiftType,
    };
  };

  const handleShiftSubmit = async (event) => {
    event.preventDefault();

    const submittedShift = formatSubmittedShift();

    setUpdatedShifts((prev) => {
      const index = prev.findIndex(
        (prevUpdatedShift) =>
          prevUpdatedShift.user === submittedShift.user &&
          new Date(prevUpdatedShift.date).toDateString() ===
            new Date(submittedShift.date).toDateString(),
      );
      if (index !== -1) {
        const newList = [...prev];
        newList[index] = submittedShift;
        return newList;
      } else {
        return [...prev, submittedShift];
      }
    });
    onModalClose();
  };

  const content = (
    <dialog
      ref={dialogRef}
      onClose={handleNativeClose}
      onClick={handleBackDropClick}
      className="p-8 rounded-2xl shadow-2xl bg-white border-none max-w-md w-full"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {shift ? "EDIT SHIFT" : "CREATE SHIFT"}
      </h2>
      <h4 className="text-m font-bold mb-4 text-gray-800">
        {shiftCellDate?.toDateString()}
      </h4>
      <form className="flex flex-col gap-6" onSubmit={handleShiftSubmit}>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-600">
            SHIFT START
          </label>
          <input
            type="time"
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            name="start"
            value={formData.start}
            onChange={handleChange}
            disabled={formData.isOff}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-600">
            SHIFT END
          </label>
          <input
            type="time"
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            name="end"
            value={formData.end}
            onChange={handleChange}
            disabled={formData.isOff}
          />
        </div>

        <div className="flex items-center gap-4 border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-600"
              name="isOnCall"
              checked={formData.isOnCall}
              onChange={handleChange}
              disabled={formData.isOff}
            />
            <span className="text-sm">On-call</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-600"
              type="checkbox"
              name="isOff"
              checked={formData.isOff}
              onChange={handleChange}
            />
            <span className="text-sm">Off</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onModalClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Stage for Submission
          </button>
        </div>
      </form>
    </dialog>
  );

  return ReactDOM.createPortal(content, document.getElementById("modal-hook"));
};

export default Modal;
