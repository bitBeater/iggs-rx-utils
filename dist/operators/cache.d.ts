import { MonoTypeOperatorFunction, Observable } from 'rxjs';
type ObsOrMillis = Observable<unknown> | number;
type CacheArgType = ObsOrMillis | {
    refreshObs?: Observable<unknown>;
    refreshMillis: number;
    bufferLen?: number;
} | {
    refreshObs: Observable<unknown>;
    refreshMillis?: number;
    bufferLen?: number;
};
/**
 * @description This operator is similar to the rxjs shareReplay operator, but with some differences:
 * 				Caches the last values of the source observable and emits it to current subscribers.
 * 				When new subscribers subscribe, they are immediately notified of the last value(s) of the source observable, and then notified of any new values, if the source observable is completed but last valules isnt expired, the new subscribers are notified of the last value(s) of the source observable, and then completed.
 * 				when the source completes, the current subscribers are completed, but cached values will be kept, for future subscribers, until they expire.
 * 				when the source emits a value, the cache is updated, and all the current subscribers are notified.
 * 				when the source emits an error, the error is passed to all current subscribers.
 *
 * @example
 * ```ts
 *	const source = interval(1000).pipe(take(6));
 *
 *	const cached = source.pipe(cache(3000, 2));
 *
 *	cached.subscribe(v => console.log('sub1', v));
 *	// sub1 0
 *	// sub1 1
 *	// sub1 2
 *	// sub1 3
 *	// sub1 4
 *	// sub1 5
 *
 *	setTimeout(() => {
 *		cached.subscribe(v => console.log('sub2', v));
 *		// sub2 1
 *		// sub2 2
 *		// sub2 3
 *		// sub2 4
 *		// sub2 5
 *
 *	}, 3500);
 * ```
 *  @param refreshObsOrMillis if an observable, the cache will be cleared when this observable emits a value.
 * 							  if a number, the cache will be cleared when the source observable completes, and the last value was emitted more than this number of milliseconds ago.
 *
 * @param bufferLen defaults to 1 (only the last value is cached).  If greater than 1, the last n values are cached.
 * @param cacheArg an observable or number of milliseconds to wait before clearing the cache. If an object, it can contain a refreshObs (observable) and/or refreshMillis (number) and/or bufferLen (number).
 * @returns an observable that emits the last value(s) of the source observable.
 */
export declare function cache<T>(cacheArg: CacheArgType, bufferLen?: number): MonoTypeOperatorFunction<T>;
export {};
//# sourceMappingURL=cache.d.ts.map