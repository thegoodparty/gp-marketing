/**
 * The round function is a utility function that rounds a given value to a specified number of decimal places.
 * @param {number} value The value to be rounded.
 * @param {number} [round=3] The number of decimal places to round the value to, with a default value of 3.
 * @returns {number} The value rounded to the specified number of decimal places.
 */

export const round = (value: number, round = 3) => Number(value.toFixed(round));
