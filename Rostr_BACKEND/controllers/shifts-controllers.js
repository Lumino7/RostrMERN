const { validationResult } = require("express-validator");

const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Shift = require("../models/shift");
const User = require("../models/user");
const sendShiftEmail = require("../util/mailer");

const getShifts = async (req, res, next) => {
  const { dateFrom, dateTo } = req.query;

  let filter = {};
  let shifts;

  if (dateFrom && dateTo) {
    filter.date = {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    };
    try {
      shifts = await Shift.find(filter).populate({
        path: "user",
        select: "-password -__v -id -password",
      });
    } catch (err) {
      const error = new HttpError(
        "Fetching places failed, please try again later",
        500,
      );
      return next(error);
    }
  } else {
    const error = new HttpError("Shift date duration required", 400);
    return next(error);
  }

  if (!shifts || shifts.length === 0) {
    const error = new HttpError(
      "Could not find shifts for the provided date duration.",
      404,
    );
    return next(error);
  }

  res.status(200).json({
    shifts: shifts.map((shift) => shift.toObject({ getters: true })),
  });
};

const saveShifts = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data",
      422,
    );
    return next(error);
  }

  // ADMIN CHECK, put back later
  // if (req.userData.role !== "admin") {
  //   const error = new HttpError(
  //     "You are not allowed to modify/save shifts.",
  //     403,
  //   );
  //   return next(error);
  // }

  const { shifts } = req.body;

  try {
    // Identify which shifts already exist in the DB
    const existingShifts = await Shift.find({
      // find docs where User A is on Date X OR User B is on Date Y etc.
      $or: shifts.map((s) => ({ user: s.user, date: s.date })),
    });

    // lookup Set of strings to avoid O(n²)
    // This creates a key like "userId_2026-05-12" to check existence
    const existingMap = new Set(
      existingShifts.map((s) => `${s.user}_${new Date(s.date).toDateString()}`),
    );

    // Step 1: Apply validation / cleaning manually (pre-validate logic)
    const cleanedShifts = shifts.map((shift) => {
      // Apply your type-based logic
      if (shift.type === "work" || shift.type === "on-call") {
        shift.start = new Date(shift.start);
        shift.end = new Date(shift.end);
        if (!shift.start || !shift.end) {
          throw new Error(
            "Start and end times are required for work/on-call shifts.",
          );
        }
      } else {
        // Clear times for leave/sick/off
        shift.start = "";
        shift.end = "";
      }

      return shift;
    });

    const updatesToNotify = [];

    // Step 2: Build bulk operations
    const bulkOps = cleanedShifts.map((shift) => {
      const shiftKey = `${shift.user}_${new Date(shift.date).toDateString()}`; // If the shift key exists in our Set, it's an UPDATE, not an INSERT

      if (existingMap.has(shiftKey)) {
        updatesToNotify.push(shift);
      }

      return {
        updateOne: {
          filter: { user: shift.user, date: shift.date }, // natural key
          update: {
            start: shift.start,
            end: shift.end,
            type: shift.type,
          },
          upsert: true,
        },
      };
    });

    // Step 3: Execute bulkWrite
    const result = await Shift.bulkWrite(bulkOps, { ordered: false });

    if (updatesToNotify.length > 0) {
      // Get unique user IDs from the update list
      const userIds = [...new Set(updatesToNotify.map((s) => s.user))];
      const usersToUpdate = await User.find({ _id: { $in: userIds } });

      usersToUpdate.forEach((user) => {
        // Filter shifts belonging to this specific user
        const userShifts = updatesToNotify.filter(
          (s) => s.user.toString() === user._id.toString(),
        );
        const dateList = userShifts
          .map((s) => new Date(s.date).toDateString())
          .join(", ");

        sendShiftEmail(user.email, user.firstName, dateList);
      });
    }

    // Step 4: Return summary
    return res.status(200).json({
      message: "Shifts processed successfully",
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
      total: shifts.length,
    });
  } catch (err) {
    console.error(err);

    // Handle bulk write errors (like duplicate keys)
    if (err.name === "BulkWriteError") {
      return res.status(200).json({
        message: "Some shifts could not be processed due to conflicts",
        inserted: err.result?.nUpserted || 0,
        modified: err.result?.nModified || 0,
        matched: err.result?.nMatched || 0,
        total: shifts.length,
      });
    }

    return next(new HttpError("Failed to process shifts", 500));
  }
};

const deleteShifts = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data",
      422,
    );
    return next(error);
  }

  // PUT BACK LATER
  // if (req.userData.role !== "admin") {
  //   const error = new HttpError("You are not allowed to delete shifts.", 403);
  //   return next(error);
  // }

  const { shifts } = req.body;

  try {
    const bulkOps = shifts.map((shift) => ({
      deleteOne: {
        filter: { user: shift.user, date: shift.date }, // natural key
      },
    }));

    // Step 3: Execute bulkWrite
    const result = await Shift.bulkWrite(bulkOps, { ordered: false });

    // Step 4: Return summary
    return res.status(200).json({
      message: "Shifts processed successfully",
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
      total: shifts.length,
    });
  } catch (err) {
    console.error(err);

    // Handle bulk write errors (like duplicate keys)
    if (err.name === "BulkWriteError") {
      return res.status(200).json({
        message: "Some shifts could not be processed due to conflicts",
        inserted: err.result?.nUpserted || 0,
        modified: err.result?.nModified || 0,
        matched: err.result?.nMatched || 0,
        total: shifts.length,
      });
    }

    return next(new HttpError("Failed to delete shifts", 500));
  }

  // in the frontend, make the cells red where the updates failed.
  // also, highlight the ones that were changed
};

exports.getShifts = getShifts;
exports.saveShifts = saveShifts;
exports.deleteShifts = deleteShifts;
