export const hasFlag = (flags: number, checkFlag: number): boolean =>
  (flags & checkFlag) === checkFlag

/**
 * Retrieves the value from the array or string at the defined index or throws
 * if the value is undefined.
 */
export const getAtIndex = <T extends string | unknown[]>(
  arrayOrString: T,
  index: number,
): T[number] => {
  const value = arrayOrString[index]

  if (value === undefined) {
    throw new Error(`Value at index ${String(index)} is undefined.`)
  }

  return value
}
