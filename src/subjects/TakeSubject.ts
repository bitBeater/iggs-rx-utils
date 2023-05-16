import { Subject } from 'rxjs';

/**
 * @description This subject will complete after the given number of takes.
 * @example ### Example
 * ```ts
 * const stop$ = new TakeSubject();
 * setTimeout(() => stop$.next(), 5000);
 *
 * stop$.subscribe({
 *     next: () => console.log("stop$ next"),
 *     complete: () => console.log("stop$ complete")
 * });
 *
 * interval(1000)
 *     .pipe(takeUntil(stop$))
 *     .subscribe({
 *         next: (v) => console.log("interval next", v),
 *         complete: () => console.log("interval complete")
 *     });
 * // OUTPUT:
 * // interval next 0
 * // interval next 1
 * // interval next 2
 * // interval next 3
 * // interval next 4
 * // stop$ next
 * // interval complete
 * // stop$ complete
 *```
 *
 * @see {@link Subject}
 */

export class TakeSubject<T = void> extends Subject<T> {
	private takes = 0;
	constructor(private readonly _take = 1) {
		super();
	}

	next(value?: T): void {
		this.takes++;
		super.next(value);
		if (this.takes === this._take) {
			this.complete();
		}
	}
}
