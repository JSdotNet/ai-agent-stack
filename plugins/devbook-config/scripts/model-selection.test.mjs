import assert from 'node:assert/strict';
import test from 'node:test';

import { parseModelSelection, toPhases } from './model-selection.mjs';

const file = `# Flow Model Selection Overrides

| Category | Model |
| --- | --- |
| Implementation & Coding | sonnet |
| **Testing, QA & Monitoring** | \`inherit\` |
| Human-in-the-Loop | opus |
| Made Up | haiku |
`;

test('each category row becomes the phases its stages became', () => {
    const { phases, unknown } = toPhases(parseModelSelection(file));
    assert.deepEqual(phases, {
        'flow-code': {
            'phase-implement': { model: 'sonnet' },
            'phase-build-test': { model: 'inherit' },
            'phase-verify': { model: 'inherit' },
        },
    });
    assert.deepEqual(unknown.map((u) => u.category), ['Human-in-the-Loop', 'Made Up']);
});

test('documentation reaches report-back in both flows', () => {
    const { phases } = toPhases([{ category: 'Documentation & Low-Complexity', model: 'haiku' }]);
    assert.deepEqual(phases['flow-code'], { 'phase-report-back': { model: 'haiku' } });
    assert.deepEqual(Object.keys(phases['flow-spec']), ['phase-drafting:ai', 'phase-report-back']);
});
