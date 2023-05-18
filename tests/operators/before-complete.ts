import assert from 'node:assert';
import { describe, it } from 'node:test';
import { of } from 'rxjs';
import { beforeComplete } from '../../src';

describe('Before Complete', () => {
	it('the callback provided to beforeComplete should be called before complete', async () => {

		const values: number[] = [];
		of(1, 2, 3)
			.pipe(beforeComplete(() => values.push(4)))
			.subscribe({
				next: v => values.push(v),
				complete: () => assert.deepEqual(values, [1, 2, 3, 4])
			});
	});
});
