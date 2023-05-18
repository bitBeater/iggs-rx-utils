import { MonoTypeOperatorFunction, Observable } from 'rxjs';

type BeforeCompleteArgType = Promise<unknown> | Observable<unknown> | (() => void) | (() => Promise<unknown>) | (() => Observable<unknown>);

/**
 * @category Operators
 * @description This operator will execute the given argument before completing the source observable.
 *				 The argument can be a Promise, an Observable, a function that returns a Promise or an Observable or a simple function.
 *				 </r>
 *				  *<h class="very-important">If the argument is an Observable or a function that returns an Observable, the returned Observable will complete only when the argument Observable completes</h>*
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
export const beforeComplete =
	<T>(arg: BeforeCompleteArgType): MonoTypeOperatorFunction<T> =>
		src =>
			new Observable<T>(subscriber => {
				const subscription = src.subscribe({
					next: v => subscriber.next(v),
					error: err => subscriber.error(err),
					complete() {
						const manageArg = (arg: BeforeCompleteArgType) => {
							if (typeof arg === 'function') {
								const argRetVal = arg();
								if (argRetVal instanceof Promise || argRetVal instanceof Observable) return manageArg(argRetVal);
								subscriber.complete();
							}

							if (arg instanceof Promise) arg.catch(err => subscriber.error(err)).then(() => subscriber.complete());

							if (arg instanceof Observable)
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
