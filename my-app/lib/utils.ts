import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function objHasProp<O, K extends string>(
    potentialObj: O,
    keys: K[]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
): potentialObj is TObj<O, K> {
  if (
      typeof potentialObj !== "object" ||
      potentialObj === null ||
      potentialObj instanceof Date ||
      potentialObj instanceof Array
  )
    return false;

  if (keys.every((key) => key in potentialObj)) {
    return true;
  }
  return false;
}
