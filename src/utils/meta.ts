/**
 * Use in switch statements or other scenarios to add type-safety to the overall pattern. This can be used
 * to ensure that every possibility is enumerated in the switch statement and cause the code to refuse
 * compilation unless all possibilities are covered.
 */
export function exhaustiveGuard(_value: never): never {
  throw new Error(`ERROR! Reached forbidden guard function with unexpected value: ${_value}`);
}
