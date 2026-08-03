import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { PersonProfile } from './PersonProfile';
import type { ProfileState } from '~/lib/peopleProfile';
import { viewFor } from '~/testing/peopleProfileFixtures';

/**
 * Per-state render coverage for the public /people profile (states A–L). Each
 * story renders the exact fixture the 12-state integration matrix asserts on
 * (see src/lib/peopleProfile.states.test.ts), so the DOM output and the
 * resolved view stay in lockstep. `play` functions give machine-checkable
 * assertions in Storybook's interaction/test runner + a11y coverage.
 */
const meta: Meta<typeof PersonProfile> = {
	title: 'People/Person Profile',
	component: PersonProfile,
	parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof meta>;

/** Builds a story for a state, with assertions common to every state. */
function stateStory(state: ProfileState): Story {
	const view = viewFor(state);
	return {
		args: { view },
		play: async ({ canvasElement }) => {
			const canvas = within(canvasElement);

			// The rendered template is tagged with the resolved state letter.
			const article = canvasElement.querySelector('[data-component="PersonProfilePage"]');
			await expect(article).not.toBeNull();
			await expect(article?.getAttribute('data-state')).toBe(state);

			// The person's name always renders (hero), in both templates.
			await expect(canvas.getAllByText('Jane Public').length).toBeGreaterThan(0);

			// Pledge badge appears iff the view is pledged (suppressed on removal).
			const pledgeBadges = canvas.queryAllByText('Took the GoodParty.org Pledge');
			await expect(pledgeBadges.length > 0).toBe(view.pledged);

			// Removed profiles (K/L) strip the headshot.
			if (view.removed) {
				await expect(canvas.queryByAltText('Jane Public headshot')).toBeNull();
			}
		},
	};
}

export const A_ClaimedCandidate = stateStory('A');
export const B_ClaimedOfficeholder = stateStory('B');
export const C_ClaimedBoth = stateStory('C');
export const D_UnclaimedIndependentCandidate = stateStory('D');
export const E_UnclaimedIndependentOfficeholder = stateStory('E');
export const F_UnclaimedIndependentBoth = stateStory('F');
export const G_ClaimedPast = stateStory('G');
export const H_UnclaimedIndependentPast = stateStory('H');
export const I_UnclaimedMajorPartyCandidate = stateStory('I');
export const J_UnclaimedMajorPartyOfficeholder = stateStory('J');
export const K_RemovalRequestedRunning = stateStory('K');
export const L_RemovalRequestedOfficeholder = stateStory('L');
