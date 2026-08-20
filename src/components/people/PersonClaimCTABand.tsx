'use client';

import { APP_SIGN_UP_HREF, trackSignUpClicked } from '~/lib/analytics';
import { Container } from '~/ui/Container';
import { IconResolver } from '~/ui/IconResolver';
import { ButtonLink } from '~/ui/Inputs/Button';
import { Text } from '~/ui/Text';
import { PERSON_CLAIM_ACTION_ID, PERSON_CLAIM_ANCHOR_ID } from './claimFormAnchor';

/**
 * GTM resolves the sign-up conversion through this id — `trackSignUpClicked`
 * pushes it into `window.dataLayer` and the Data Layer Variable is keyed on it.
 *
 * It was also HubSpot's key for the collected owner form that used to sit here.
 * That form is gone (marketing, 2026-08-17: send the person to Win instead of
 * taking their address), so HubSpot will stop receiving submissions under this
 * name. The id is kept rather than retired so the clicks that replace those
 * submissions land on the GTM variable already wired up for this surface.
 */
const CLAIM_FORM_ID = 'person-claim-owner';

export type PersonClaimCTABandProps = {
	displayName: string;
};

/**
 * Full-width light-blue claim CTA band for UNCLAIMED empowered CANDIDATE
 * profiles (Figma states D/F). Mirrors the Figma "Are you [Name]? Complete your
 * profile now." band, with a button into Win sign-up where the frame draws an
 * inline name/email form. Rendered in the person `person-cta` section slot
 * (below the content well, above the elections index) in place of the claimed
 * "Join the movement" CTA.
 *
 * Candidate-only by construction: `buildPersonSectionOverrides` no longer shows
 * any claim surface to the officeholder or past personas, so there is no Serve
 * branch here. Someone reaching this band is running, and running means Win,
 * which they can self-serve into.
 *
 * The band takes no `personId`: nothing is submitted from here any more, and the
 * `Sign Up Clicked` event carries `page_path`, which is the profile URL — so the
 * click is still attributable to the person whose page it came from.
 */
export function PersonClaimCTABand({ displayName }: PersonClaimCTABandProps) {
	return (
		<article
			id={PERSON_CLAIM_ANCHOR_ID}
			tabIndex={-1}
			className='py-(--container-padding) scroll-mt-24 bg-goodparty-cream focus:outline-none'
			data-component='CTABannerBlock'
		>
			<Container size='xl'>
				<div className='flex flex-col items-center gap-6 rounded-3xl bg-blue-100 p-6 text-center text-midnight-900 lg:px-32 lg:py-40'>
					<div className='flex flex-col items-center gap-4'>
						<Text as='h2' styleType='heading-lg'>
							{`Are you ${displayName}? Complete your profile now.`}
						</Text>
						<Text styleType='body-1'>
							Your community deserves accountable leadership. Claim your profile and share why you&rsquo;re
							running and your top priorities with residents. Create a free GoodParty.org account to get
							started.
						</Text>
					</div>
					{/*
					  * `ButtonLink` renders through `Anchor`, which decorates
					  * app.goodparty.org URLs with the captured fbclid/utm params, so a
					  * candidate who arrived from an ad lands on sign-up with the
					  * attribution that stitches the two halves of the funnel together.
					  * The tracked href is the bare one, as everywhere else on the site,
					  * so this point stays comparable with the rest of the funnel.
					  */}
					<ButtonLink
						parent='PersonClaimCTABand'
						id={PERSON_CLAIM_ACTION_ID}
						href={APP_SIGN_UP_HREF}
						formId={CLAIM_FORM_ID}
						styleType='primary'
						styleSize='md'
						onClick={() => trackSignUpClicked({ href: APP_SIGN_UP_HREF, label: 'Claim profile', formId: CLAIM_FORM_ID })}
						iconRight={<IconResolver icon='arrow-up-right' className='h-5 w-5' />}
					>
						Claim this profile
					</ButtonLink>
				</div>
			</Container>
		</article>
	);
}
