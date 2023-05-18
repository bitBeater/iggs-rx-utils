import { assert } from 'node:console';
import { describe, it } from 'node:test';
import { lastValueFrom } from 'rxjs';
import { TakeSubject } from '../../src/index';

describe('TakeSubject', () => {
	it('should complete after 1 next call', async () => {
		const takeSubject = new TakeSubject();
		var nexted = false;
		var completed = false;
		takeSubject.subscribe({
			next: () => {
				nexted = true;
			},
			complete: () => {
				completed = true;
			}
		});

		setTimeout(() => {
			takeSubject.next();
		});

		await lastValueFrom(takeSubject);
		assert(nexted);
		assert(completed);
	});

	it('should complete after 3 next call', async () => {
		const takeSubject = new TakeSubject(3);
		var nexted = false;
		var completed = false;
		takeSubject.subscribe({
			next: () => {
				nexted = true;
			},
			complete: () => {
				completed = true;
			}
		});
		setTimeout(() => {
			takeSubject.next();
			takeSubject.next();
			takeSubject.next();
		});

		await lastValueFrom(takeSubject);
		assert(nexted);
		assert(completed);
	});
});
