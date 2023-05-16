import assert from 'node:assert';
import { describe, it } from 'node:test';
import { of } from 'rxjs';
import { beforeComplete } from '../../src';

describe('Before Complete', () => {
	it('the callback provided to beforeComplete should be called before complete', async () => {
		let runnedBeforeComplete = false;
		of(1)
			.pipe(beforeComplete(() => (runnedBeforeComplete = true)))
			.subscribe({
				next: () => assert.equal(runnedBeforeComplete, false),
				complete: () => assert.equal(runnedBeforeComplete, true),
			});
	});
});
