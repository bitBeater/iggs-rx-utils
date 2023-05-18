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
export declare class TakeSubject<T = void> extends Subject<T> {
    private readonly _take;
    private takes;
    constructor(_take?: number);
    next(value?: T): void;
}
//# sourceMappingURL=TakeSubject.d.ts.map