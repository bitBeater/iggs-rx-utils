import { describe, it } from 'node:test';
import { lastValueFrom } from 'rxjs';
import { TakeSubject } from '../../src/index';

describe('TakeSubject', () => {
	it('should complete after 1 next call', async () => {
		const takeSubject = new TakeSubject();
		setTimeout(() => {
			takeSubject.next();
		});

		await lastValueFrom(takeSubject);
	});

	it('should complete after 3 next call', async () => {
		const takeSubject = new TakeSubject(3);
		setTimeout(() => {
			takeSubject.next();
			takeSubject.next();
			takeSubject.next();
		});

		await lastValueFrom(takeSubject);
	});
});
