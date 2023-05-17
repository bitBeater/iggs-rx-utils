"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const iggs_utils_1 = require("iggs-utils");
const rxjs_1 = require("rxjs");
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
function cache(cacheArg, bufferLen = 1) {
    bufferLen = getBuffLen(cacheArg, bufferLen);
    const refresh$ = refreshToObservable(cacheArg);
    const refreshMillis = refreshToMillis(cacheArg);
    let source;
    const valuesBuffer = new iggs_utils_1.collection.EvictingDequeue(bufferLen);
    /** current subscribers */
    let incompleteSubscribers = [];
    let subscribedToSource = false;
    let subscribingToSource = false;
    let srcComplete = false;
    let lastValueTime;
    const destWrap = new rxjs_1.Observable(subscriber => {
        const now = Date.now();
        if (!srcComplete)
            incompleteSubscribers.push(subscriber);
        if (!subscribedToSource)
            subscribeToSource();
        if (!!refreshMillis && srcComplete && !subscribingToSource && lastValueTime + refreshMillis < now)
            subscribeToSource();
        else
            valuesBuffer.filter(v => !refreshMillis || v.timestamp + refreshMillis > now).forEach(v => subscriber.next(v.value));
        if (srcComplete)
            subscriber.complete();
    });
    const subscribeToSource = () => {
        subscribedToSource = subscribingToSource = true;
        srcComplete = false;
        source
            .pipe((0, rxjs_1.timestamp)(), (0, rxjs_1.takeUntil)(refresh$), (0, rxjs_1.finalize)(() => (incompleteSubscribers = [])))
            .subscribe({
            next: v => {
                subscribingToSource = false;
                valuesBuffer.push(v);
                lastValueTime = v.timestamp;
                incompleteSubscribers.forEach(s => s.next(v.value));
            },
            complete: () => {
                srcComplete = true;
                incompleteSubscribers.forEach(s => s.complete());
            },
            error: e => {
                incompleteSubscribers.forEach(s => s.error(e));
            },
        });
    };
    refresh$.subscribe({ next: () => subscribeToSource() });
    return (_source) => {
        source = _source;
        return destWrap;
    };
}
exports.cache = cache;
function refreshToObservable(cacheArg) {
    const retVal = new rxjs_1.Subject();
    if (cacheArg instanceof rxjs_1.Observable)
        cacheArg.subscribe(retVal);
    //@ts-ignore
    else if (typeof cacheArg === 'object' && (cacheArg === null || cacheArg === void 0 ? void 0 : cacheArg.refreshObs) instanceof rxjs_1.Observable)
        //@ts-ignore
        cacheArg.refreshObs.subscribe(retVal);
    return retVal;
}
function refreshToMillis(cacheArg) {
    if (typeof cacheArg === 'number')
        return cacheArg;
    //@ts-ignore
    if (!(cacheArg instanceof rxjs_1.Observable) && typeof (cacheArg === null || cacheArg === void 0 ? void 0 : cacheArg.refreshMillis) === 'number')
        //@ts-ignore
        return cacheArg.refreshMillis;
}
function getBuffLen(cacheArg, bufferLen = 1) {
    if (typeof cacheArg === 'object' && !(cacheArg instanceof rxjs_1.Observable) && typeof (cacheArg === null || cacheArg === void 0 ? void 0 : cacheArg.bufferLen) === 'number')
        return cacheArg.bufferLen;
    return bufferLen !== null && bufferLen !== void 0 ? bufferLen : 1;
}
//# sourceMappingURL=cache.js.map