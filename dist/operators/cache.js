"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const iggs_utils_1 = require("iggs-utils");
const rxjs_1 = require("rxjs");
const TakeSubject_1 = require("../subjects/TakeSubject");
function cache(cacheArg, bufferLen = 1) {
    const destroy$ = new TakeSubject_1.TakeSubject();
    const refresh$ = refreshToObservable(cacheArg);
    const refreshMillis = refreshToMillis(cacheArg);
    let source;
    const valuesBuffer = new iggs_utils_1.collection.EvictingDequeue(bufferLen, []);
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
            .pipe((0, rxjs_1.timestamp)(), (0, rxjs_1.takeUntil)(refresh$), (0, rxjs_1.takeUntil)(destroy$), (0, rxjs_1.finalize)(() => (incompleteSubscribers = [])))
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
    destroy$.subscribe({
        complete: () => {
            refresh$.complete();
        },
    });
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
