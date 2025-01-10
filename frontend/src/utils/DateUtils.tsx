import { Dob } from "./GlobalInterface";

export const MONTHS: string[] = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const VI_MONTHS: string[] = [
  "",
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export const WEEKDAY = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getDayOfWeek = (date: Date) => {
  return WEEKDAY[date.getDay()];
};

export const getMonths = (): JSX.Element[] => {
  return MONTHS.map((month, index) => {
    if (index === 0) {
      return <option value={index} key={month}></option>;
    } else {
      return (
        <option value={index} key={month}>
          {month}
        </option>
      );
    }
  });
};

export const getDays = (): JSX.Element[] => {
  let options: JSX.Element[] = [];

  for (let i = 0; i < 32; i++) {
    if (i === 0) options.push(<option value={0} key={i}></option>);
    else {
      options.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
    }
  }

  return options;
};

export const getYears = (): JSX.Element[] => {
  let options: JSX.Element[] = [];

  for (let i = 2024; i > 1901; i--) {
    if (i === 2024) options.push(<option value={0} key={i}></option>);
    else {
      options.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
    }
  }

  return options;
};

export const stringifyDate = (date: Dob): string => {
  return `${MONTHS[date.month].substring(0, 3)} ${date.day}, ${date.year}`;
};

export const stringifyVNDate = (date: Dob): string => {
  let result: string = "";

  if (date.day < 10) result = `0${date.day}`;
  else result = `${date.day}`;

  if (date.month < 10) result += `/0${date.month}`;
  else result += `/${date.month}`;

  result += `/${date.year}`;

  return result;
};

export const stringifyFullMonthAndYear = (date: Date): string => {
  return `${MONTHS[date.getMonth() + 1]} ${date.getFullYear()}`;
};

export const stringifyTime = (date: Date): string => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm;

  if (hours === 0) {
    hours = 12;
    ampm = "AM";
  } else if (hours > 12) {
    hours = hours % 12;
    ampm = "PM";
  } else {
    ampm = "AM";
  }

  return `${hours}:${minutes < 10 ? `0${minutes}` : `${minutes}`} ${ampm}`;
};

export const stringifyFullDate = (date: Date): string => {
  return `${
    MONTHS[date.getMonth() + 1]
  } ${date.getDate()}, ${date.getFullYear()}`;
};

export const stringifyBirthDate = (date: Dob): string => {
  return `${MONTHS[date.month + 1]} ${date.day}, ${date.year}`;
};

export const cleanDateForRequest = (date: Dob): string => {
  let month: string = "";
  let day: string = "";

  if (date.month < 10) month = `0${date.month}`;
  else month = `${date.month}`;

  if (date.day < 10) day = `0${date.day}`;
  else day = `${date.day}`;

  return `${date.year}-${month}-${day}`;
};

export const convertDateStringToDob = (dateString: string): Dob => {
  const [year, month, day] = dateString.split("-").map(Number);
  return { year, month, day };
};

export function lessThanDay(d1: Date, d2: Date): boolean {
  let timeDifference = d1.getTime() - d2.getTime();
  let dayDifference = timeDifference / (1000 * 3600 * 24);
  return dayDifference < 1;
}
export function lessThanWeek(d1: Date, d2: Date): boolean {
  let timeDifference = d1.getTime() - d2.getTime();
  let dayDifference = Math.round(timeDifference / (1000 * 3600 * 24));
  return dayDifference < 7;
}

export function lessThanMonth(d1: Date, d2: Date): boolean {
  let timeDifference = d1.getTime() - d2.getTime();
  let dayDifference = Math.round(timeDifference / (1000 * 3600 * 24));
  return dayDifference <= 30;
}

export function lessThanYear(d1: Date, d2: Date): boolean {
  let timeDifference = d1.getTime() - d2.getTime();
  let dayDifference = Math.round(timeDifference / (1000 * 3600 * 24));
  return dayDifference <= 365;
}
