import { collection } from 'iggs-utils';
import { MonoTypeOperatorFunction, Observable, Subject, Subscriber, Timestamp, finalize, takeUntil, timestamp } from 'rxjs';

type ObsOrMillis = Observable<unknown> | number;
type CacheArgType = ObsOrMillis | { refreshObs: Observable<unknown>; refreshMillis: number; bufferLen?: number } | { refreshObs: Observable<unknown>; bufferLen?: number } | { refreshMillis: number; bufferLen?: number };

export function cache<T>(cacheArg: CacheArgType, bufferLen = 1): MonoTypeOperatorFunction<T> {
	const refresh$ = refreshToObservable(cacheArg);
	const refreshMillis = refreshToMillis(cacheArg);

	let source: Observable<T>;
	const valuesBuffer = new collection.EvictingDequeue<Timestamp<T>>(bufferLen);
	let incompleteSubscribers: Subscriber<T>[] = [];

	let subscribedToSource = false;
	let subscribingToSource = false;
	let srcComplete = false;

	let lastValueTime: number;

	const destWrap = new Observable<T>(subscriber => {
		const now = Date.now();

		if (!srcComplete) incompleteSubscribers.push(subscriber);

		if (!subscribedToSource) subscribeToSource();

		if (!!refreshMillis && srcComplete && !subscribingToSource && lastValueTime + refreshMillis < now) subscribeToSource();
		else valuesBuffer.filter(v => !refreshMillis || v.timestamp + refreshMillis > now).forEach(v => subscriber.next(v.value));

		if (srcComplete) subscriber.complete();
	});

	const subscribeToSource = () => {
		subscribedToSource = subscribingToSource = true;
		srcComplete = false;

		source
			.pipe(
				timestamp(),
				takeUntil(refresh$),
				finalize(() => (incompleteSubscribers = []))
			)
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

	return (_source: Observable<T>) => {
		source = _source;
		return destWrap;
	};
}

function refreshToObservable(cacheArg: CacheArgType): Subject<void> {
	const retVal = new Subject<void>();

	if (cacheArg instanceof Observable) cacheArg.subscribe(retVal);
	//@ts-ignore
	else if (typeof cacheArg === 'object' && cacheArg?.refreshObs instanceof Observable)
		//@ts-ignore
		cacheArg.refreshObs.subscribe(retVal);

	return retVal;
}

function refreshToMillis(cacheArg: CacheArgType): number {
	if (typeof cacheArg === 'number') return cacheArg;

	//@ts-ignore
	if (!(cacheArg instanceof Observable) && typeof cacheArg?.refreshMillis === 'number')
		//@ts-ignore
		return cacheArg.refreshMillis;
}
