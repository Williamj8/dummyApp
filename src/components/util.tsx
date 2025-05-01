export const daysOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];


export const validatess = (values: {capPool2: number; capPool3: number}) :
 { isValid: boolean; capPool1: number} => {
    const {capPool2, capPool3} = values;
    const capPool1 = 100 - (capPool2 + capPool3);

    return {
        isValid: capPool1 >= 0 && capPool1 <=100,
        capPool1,
    }
 }