const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const shiftSchema = new Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  date: {
    type: Date,
    required: true,
    // Ensure the date is stored as "start of day" (00:00:00)
    // to make the unique constraint effective.
    // new Date(v.setHours(0, 0, 0, 0)) will work, but that is not good practice as that will mutate the original value and mutating values are not good practice.
    set: (value) => new Date(value),
  },
  start: {
    type: Date,
    // only required if shift is work or on-call
    required: function () {
      return this.type === "work" || this.type === "on-call";
    },
  },
  end: {
    type: Date,
    required: function () {
      return this.type === "work" || this.type === "on-call";
    },
  },
  type: {
    type: String,
    enum: ["work", "on-call", "off", "bank_holiday", "leave", "sick"],
    default: "work",
  },
});

// Unique constraint for User-Date combination
shiftSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Shift", shiftSchema);
