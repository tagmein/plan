interface Function {
 and<T extends (...args: any[]) => any>(
  this: T,
  next?: () => any,
 ): (this: T, ...args: Parameters<T>) => void
}
