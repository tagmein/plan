/// <reference path="./types/global.d.ts" />

globalThis.__dirname = ''

Function.prototype.and = function (next) {
 const me = this
 return function (...args: any) {
  me(...args)
  if (next) {
   next()
  }
 }
}
