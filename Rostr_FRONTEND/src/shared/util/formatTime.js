const timeFormatConfig = [
  "en-GB",
  {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
];

const formatTime = (time) => {
  if (!time) {
    return "";
  }

  const date = new Date(time);
  if (isNaN(date.getTime())) {
    return "";
  }

  const formattedTime = date.toLocaleTimeString(...timeFormatConfig);

  return formattedTime;
};

export default formatTime;