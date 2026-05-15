const express = require("express");
const { check, body } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

const shiftsControllers = require("../controllers/shifts-controllers");

const router = express.Router();

// router.use(checkAuth); // uncomment once frontend is working (for token)

router.get("/", shiftsControllers.getShifts);
// url: /shifts?dateFrom=2024-03-16&dateTo=2024-03-22

// router.use(checkAuth);   //re-activate later

router.put(
  "/batch",
  [
    body("shifts")
      .isArray({ min: 1 })
      .withMessage("Shifts must be an array with at least one shift"),
    body("shifts.*.date")
      .notEmpty()
      .withMessage("Date is required")
      .customSanitizer((value) => new Date(new Date(value))),
    body("shifts.*.user").notEmpty().withMessage("User is required"),
    // start is required only for work or on-call shifts
    body("shifts.*.start")
      .if(
        body("shifts.*.type").custom(
          (type) => type === "work" || type === "on-call",
        ),
      )
      .notEmpty()
      .withMessage("Start time is required for work or on-call shifts"),

    // end is required only for work or on-call shifts
    body("shifts.*.end")
      .if(
        body("shifts.*.type").custom(
          (type) => type === "work" || type === "on-call",
        ),
      )
      .notEmpty()
      .withMessage("End time is required for work or on-call shifts"),

    body("shifts.*.type")
      .notEmpty()
      .isIn(["work", "on-call", "off", "bank_holiday", "leave", "sick"])
      .withMessage("Invalid shift type"),
  ],
  shiftsControllers.saveShifts,
);

router.put(
  "/batchdelete",
  [
    body("shifts.*.user").notEmpty().withMessage("User is required"),
    body("shifts.*.date")
      .notEmpty()
      .withMessage("Date is required")
      .customSanitizer(
        (value) => new Date(new Date(value).setHours(0, 0, 0, 0)),
      ),
  ],
  shiftsControllers.deleteShifts,
);

module.exports = router;
