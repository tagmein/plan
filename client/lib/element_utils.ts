export function closest_visible_element<T extends HTMLElement>(
 target: Element | null,
 direction: number = 0,
): T | null {
 if (direction === 0) {
  if (target && getComputedStyle(target).display !== 'none') {
   return target as unknown as T | null
  }
  const prev = closest_visible_element(target, -1)
  if (prev) {
   return prev as unknown as T | null
  }
  return closest_visible_element(target, 1)
 }
 while (target) {
  target =
   direction === 1 ? target.nextElementSibling : target.previousElementSibling
  if (target && getComputedStyle(target).display !== 'none') {
   break
  }
 }
 return target as unknown as T | null
}
