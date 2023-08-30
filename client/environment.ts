globalThis.__dirname = ''

interface Function {
 and<T extends (...args: any[]) => any>(
  this: T,
  next?: () => any,
 ): (this: T, ...args: Parameters<T>) => void
}

Function.prototype.and = function (next) {
 const me = this
 return function (...args: any) {
  me(...args)
  if (next) {
   next()
  }
 }
}
