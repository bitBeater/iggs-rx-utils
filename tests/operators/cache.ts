import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Observable, Subject, lastValueFrom } from 'rxjs';
import { cache } from '../../src/operators/cache';

describe('cache', () => {
	it('cache operator should cache source value until refres$', async () => {
		const refresh$ = new Subject<void>();
		var calls = 0;

		const src$ = new Observable(subscriber => {
			subscriber.next(calls++);
			subscriber.complete();
		});

		const cached$ = src$.pipe(cache(refresh$));

		assert.equal(await lastValueFrom(cached$), 0);
		assert.equal(await lastValueFrom(cached$), 0);

		refresh$.next();
		assert.equal(await lastValueFrom(cached$), 1);
		assert.equal(await lastValueFrom(cached$), 1);

		refresh$.next();
		assert.equal(await lastValueFrom(cached$), 2);
		assert.equal(await lastValueFrom(cached$), 2);
	});
});
