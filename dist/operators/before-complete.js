"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeComplete = void 0;
const rxjs_1 = require("rxjs");
/**
 * @description This operator will execute the given argument before completing the source observable.
 * @example ### Example with a function that returns a Promise
 * ```ts
 * const promise = new Promise((resolve) => {
 *   setTimeout(() => {
 *      console.log("after 2.5s");
 *      resolve()
 *  }, 2500);
 * });
 *
 * of(1, 2, 3)
 *   .pipe(beforeComplete(() => promise))
 *   .subscribe({
 *     next: (v) => console.log("next", v),
 *     complete: () => console.log("complete"),
 *   });
 *   // OUTPUT:
 *   // next 1
 *   // next 2
 *   // next 3
 *   // after 2.5s
 *   // complete
 * ```
 *
 * @example ### Example with an Observable
 * ```ts
 * const timer$ = timer(2500).pipe( tap(() => console.log("after 2.5s")));
 *
 * of(1, 2, 3)
 *   .pipe(beforeComplete(timer$)
 *   .subscribe({
 *     next: (v) => console.log("next", v),
 *     complete: () => console.log("complete"),
 *   });
 *   // OUTPUT:
 *   // next 1
 *   // next 2
 *   // next 3
 *   // after 2.5s
 *   // complete
 * ```
 *
 * @example ### Example with a function
 *  ```ts
 *
 * of(1, 2, 3)
 *   .pipe(beforeComplete(console.log("beforeComplete"))
 *   .subscribe({
 *     next: (v) => console.log("next", v),
 *     complete: () => console.log("complete"),
 *   });
 *   // OUTPUT:
 *   // next 1
 *   // next 2
 *   // next 3
 *   // beforeComplete
 *   // complete
 * ```
 *
 * @param arg : Promise | Observable | (() => void) | (() => Promise) | (() => Observable)
 * @returns A function that returns an Observable that will execute the given argument before completing the source observable.
 */
const beforeComplete = (arg) => (source) => new rxjs_1.Observable(subscriber => {
    const subscription = source.subscribe({
        next: v => subscriber.next(v),
        error: err => subscriber.error(err),
        complete() {
            const manageArg = (arg) => {
                if (typeof arg === 'function') {
                    const argRetVal = arg();
                    if (argRetVal instanceof Promise || argRetVal instanceof rxjs_1.Observable)
                        return manageArg(argRetVal);
                    subscriber.complete();
                }
                if (arg instanceof Promise)
                    arg.catch(err => subscriber.error(err)).then(() => subscriber.complete());
                if (arg instanceof rxjs_1.Observable)
                    arg.subscribe({
                        next: () => { },
                        error: err => subscriber.error(err),
                        complete: () => subscriber.complete(),
                    });
            };
            manageArg(arg);
        },
    });
    return () => subscription.unsubscribe();
});
exports.beforeComplete = beforeComplete;
//# sourceMappingURL=before-complete.js.map