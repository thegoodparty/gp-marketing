'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { trackEvent, trackSegmentEvent } from '~/lib/analytics';
import { cn, tv } from './_lib/utils.ts';
import { primaryButtonStyleType } from './_lib/designTypesStore.ts';
import { Container } from './Container.tsx';
import { EmbedHtml } from './EmbedHtml.tsx';
import { Button, ComponentButton } from './Inputs/Button.tsx';
import { TextInput } from './Inputs/TextInput.tsx';
import { Text } from './Text.tsx';

// Same-origin proxy (src/app/api/demo-request/route.ts); the qualifier's real address lives there.
const API_ENDPOINT = '/api/demo-request';
const DEFAULT_TOUR_URL = '/product-tour';
const MIN_CHECKING_MS = 1800;

const STATES = [
	'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA',
	'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
	'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const OFFICES = [
	{ value: 'council', label: 'City or town council' },
	{ value: 'commission', label: 'City or town commissioner' },
	{ value: 'county', label: 'County commissioner or supervisor' },
	{ value: 'mayor', label: 'Mayor' },
	{ value: 'school', label: 'School board' },
	{ value: 'state', label: 'State legislature' },
	{ value: 'clerk', label: 'Clerk, treasurer, or other administrative office' },
	{ value: 'other', label: 'Something else' },
];

const GOALS = [
	{ value: 'voter_data', label: 'Access to voter data for my district' },
	{ value: 'outreach_tools', label: 'Voter outreach tools (texting, calls, door knocking)' },
	{ value: 'strategy', label: 'Campaign strategy support' },
	{ value: 'templates', label: 'Outreach templates and resources' },
	{ value: 'exploring', label: 'Just exploring for now' },
];

const STAGES = [
	{ value: 'exploring', label: 'Just exploring' },
	{ value: 'thinking', label: 'Thinking about running' },
	{ value: 'filed', label: 'I have filed papers to run' },
	{ value: 'ballot', label: 'I am on the ballot' },
	{ value: 'office', label: 'I am in office now' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		grid: 'grid gap-8 md:gap-12 lg:grid-cols-[2fr_3fr] lg:items-start',
		copy: 'flex flex-col gap-4',
		points: 'flex flex-col gap-4 mt-2',
		point: 'flex gap-3',
		pointDot: 'flex h-7 w-7 flex-none items-center justify-center rounded-full bg-blue-100 font-primary text-[0.8125rem] font-bold text-midnight-900',
		card: 'rounded-2xl border border-neutral-200 bg-white p-6 text-black shadow-xl-duo md:p-8',
		progress: 'mb-6 flex gap-1.5',
		progressBar: 'h-1 flex-1 rounded-full bg-blue-100',
		progressBarOn: 'h-1 flex-1 rounded-full bg-btn-primary-bg',
		fields: 'flex flex-col gap-5',
		row: 'grid gap-4 sm:grid-cols-2',
		label: 'font-secondary text-text-md font-semibold text-black',
		select: [
			'font-secondary w-full min-h-12 rounded-md border border-neutral-300 bg-white px-3.5 py-3 text-body-2 text-black',
			'focus:outline-none focus-visible:border-btn-primary-bg focus-visible:ring-2 focus-visible:ring-btn-primary-bg/30',
		],
		options: 'flex flex-col gap-2',
		option: [
			'flex cursor-pointer items-start gap-3 rounded-md border border-neutral-300 bg-white px-3.5 py-3 font-secondary text-body-2 text-black',
			'hover:border-neutral-400 has-[:checked]:border-btn-primary-bg has-[:checked]:bg-blue-50',
		],
		optionInput: 'mt-0.5 h-4 w-4 flex-none accent-btn-primary-bg',
		consent: 'flex items-start gap-3 font-secondary text-caption text-neutral-700',
		error: 'font-secondary text-caption text-error-600',
		actions: 'mt-6 flex items-center justify-between gap-4',
		checking: 'flex flex-col items-center gap-4 py-8 text-center',
		spinner: 'h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-btn-primary-bg',
		tag: 'inline-block w-fit rounded-full px-3 py-1 font-primary text-[0.75rem] font-semibold uppercase tracking-wider',
		tourCard: 'mt-4 flex flex-col gap-3 rounded-xl bg-midnight-900 p-6 text-white',
	},
	variants: {
		backgroundColor: {
			cream: { base: 'bg-goodparty-cream', copy: 'text-black' },
			midnight: { base: 'bg-midnight-900', copy: 'text-white' },
		},
	},
});

export type DemoRequestTalkingPoint = { title: string; copy: string };

export type DemoRequestBlockProps = {
	className?: string;
	heading?: string;
	body?: string;
	talkingPoints?: DemoRequestTalkingPoint[];
	backgroundColor?: 'cream' | 'midnight';
};

type Step = 'race' | 'goals' | 'contact' | 'checking' | 'result';

type QualifyResponse = {
	outcome?: 'pass' | 'tour';
	first_name?: string;
	city?: string;
	calendar_url?: string;
	redirect_url?: string;
	redirect_seconds?: number;
	error?: string;
};

type Answers = {
	city: string;
	state: string;
	office: string;
	officeOther: string;
	goals: string[];
	stage: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	smsConsent: boolean;
};

const EMPTY_ANSWERS: Answers = {
	city: '',
	state: '',
	office: '',
	officeOther: '',
	goals: [],
	stage: '',
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	smsConsent: false,
};

class QualifyError extends Error {
	public apiMessage: string | null;
	public constructor(apiMessage: string | null) {
		super(apiMessage ?? 'qualify request failed');
		this.apiMessage = apiMessage;
	}
}

function pagePath(): string | null {
	return typeof window !== 'undefined' ? window.location.pathname : null;
}

function track(eventName: string, props?: Record<string, unknown>): void {
	const payload = { page_path: pagePath(), ...props };
	trackEvent(eventName, payload);
	trackSegmentEvent(eventName, payload);
}

function isQualifyResponse(data: unknown): data is QualifyResponse {
	return typeof data === 'object' && data !== null;
}

export function DemoRequestBlock(props: DemoRequestBlockProps) {
	const id = useId();
	const [step, setStep] = useState<Step>('race');
	const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
	const [stepError, setStepError] = useState<string | null>(null);
	const [result, setResult] = useState<QualifyResponse | null>(null);
	const [countdown, setCountdown] = useState<number | null>(null);
	const submittingRef = useRef(false);
	const cardRef = useRef<HTMLDivElement>(null);

	const stepIndex = step === 'race' ? 1 : step === 'goals' ? 2 : 3;

	useEffect(() => {
		track('Demo Request Viewed');
	}, []);

	useEffect(() => {
		if (step !== 'result' || result?.outcome !== 'tour') return;
		const url = result.redirect_url || DEFAULT_TOUR_URL;
		let remaining = result.redirect_seconds ?? 8;
		setCountdown(remaining);
		const timer = window.setInterval(() => {
			remaining -= 1;
			setCountdown(remaining);
			if (remaining <= 0) {
				window.clearInterval(timer);
				track('Demo Request Tour Redirected');
				window.location.assign(url);
			}
		}, 1000);
		return () => window.clearInterval(timer);
	}, [step, result]);

	const update = <K extends keyof Answers>(key: K, value: Answers[K]) => {
		setAnswers(prev => ({ ...prev, [key]: value }));
		if (stepError) setStepError(null);
	};

	const goTo = (next: Step) => {
		setStepError(null);
		setStep(next);
		cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const submitRace = (e: React.FormEvent) => {
		e.preventDefault();
		const officeOk = answers.office && (answers.office !== 'other' || answers.officeOther.trim());
		if (!answers.city.trim() || !answers.state || !officeOk) {
			setStepError('Please add your city, state, and office.');
			return;
		}
		track('Demo Request Step Completed', { step: 1 });
		goTo('goals');
	};

	const submitGoals = (e: React.FormEvent) => {
		e.preventDefault();
		if (answers.goals.length === 0 || !answers.stage) {
			setStepError('Pick at least one goal and your campaign stage.');
			return;
		}
		track('Demo Request Step Completed', { step: 2 });
		goTo('contact');
	};

	const submitContact = (e: React.FormEvent) => {
		e.preventDefault();
		const phoneDigits = answers.phone.replace(/\D/g, '');
		if (!answers.firstName.trim() || !answers.lastName.trim() || !EMAIL_PATTERN.test(answers.email.trim()) || phoneDigits.length < 10) {
			setStepError('Please add your name, a valid email, and a mobile number.');
			return;
		}
		if (submittingRef.current) return;
		submittingRef.current = true;
		track('Demo Request Submitted', { stage: answers.stage, office: answers.office });
		goTo('checking');

		const started = Date.now();
		const body = {
			city: answers.city,
			state: answers.state,
			office: answers.office,
			office_other: answers.officeOther,
			goals: answers.goals,
			stage: answers.stage,
			first_name: answers.firstName,
			last_name: answers.lastName,
			email: answers.email,
			phone: answers.phone,
			sms_consent: answers.smsConsent,
			source_url: typeof window !== 'undefined' ? window.location.href : '',
		};

		fetch(API_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
			.then(async response => {
				const data: unknown = await response.json().catch(() => null);
				if (!response.ok || !isQualifyResponse(data) || (data.outcome !== 'pass' && data.outcome !== 'tour')) {
					// Only a message the qualifier wrote for the candidate (a 400 validation reply) is shown
					// verbatim; anything else falls back to the generic copy below.
					const apiMessage = response.status === 400 && isQualifyResponse(data) && data.error ? data.error : null;
					throw new QualifyError(apiMessage);
				}
				return data;
			})
			.then(data => {
				const wait = Math.max(0, MIN_CHECKING_MS - (Date.now() - started));
				window.setTimeout(() => {
					track('Demo Request Qualified', { outcome: data.outcome });
					setResult(data);
					goTo('result');
					submittingRef.current = false;
				}, wait);
			})
			.catch((error: unknown) => {
				submittingRef.current = false;
				const message = error instanceof QualifyError ? error.apiMessage : null;
				setStep('contact');
				setStepError(message ?? 'Something went wrong on our end. Please try again in a moment.');
			});
	};

	const {
		base,
		grid,
		copy,
		points,
		point,
		pointDot,
		card,
		progress,
		progressBar,
		progressBarOn,
		fields,
		row,
		label,
		select,
		options,
		option,
		optionInput,
		consent,
		error: errorClass,
		actions,
		checking,
		spinner,
		tag,
		tourCard,
	} = styles({ backgroundColor: props.backgroundColor ?? 'cream' });

	const firstName = result?.first_name?.trim() || answers.firstName.trim() || 'there';
	const cityName = result?.city?.trim() || answers.city.trim() || 'your city';

	return (
		<article className={cn(base(), props.className)} data-component='DemoRequestBlock'>
			<Container size='xl'>
				<div className={grid()}>
					<div className={copy()}>
						{props.heading && (
							<Text as='h2' styleType='heading-lg'>
								{props.heading}
							</Text>
						)}
						{props.body && <Text styleType='body-1'>{props.body}</Text>}
						{props.talkingPoints && props.talkingPoints.length > 0 && (
							<ol className={points()}>
								{props.talkingPoints.map((item, i) => (
									<li key={`${item.title}-${i}`} className={point()}>
										<span className={pointDot()} aria-hidden='true'>
											{i + 1}
										</span>
										<div>
											<Text as='p' styleType='body-2' className='font-semibold'>
												{item.title}
											</Text>
											<Text as='p' styleType='body-2'>
												{item.copy}
											</Text>
										</div>
									</li>
								))}
							</ol>
						)}
					</div>

					<div ref={cardRef} className={card()}>
						{step !== 'result' && (
							<div className={progress()} aria-hidden='true'>
								{[1, 2, 3].map(n => (
									<span key={n} className={n <= stepIndex ? progressBarOn() : progressBar()} />
								))}
							</div>
						)}

						{step === 'race' && (
							<form onSubmit={submitRace} noValidate className={fields()}>
								<div>
									<Text styleType='caption' className='text-neutral-600'>
										Step 1 of 3
									</Text>
									<Text as='h3' styleType='heading-sm'>
										Where are you running?
									</Text>
								</div>
								<div className={row()}>
									<TextInput
										label='City or town'
										name='city'
										autoComplete='address-level2'
										placeholder='e.g. Traverse City'
										value={answers.city}
										onChange={e => update('city', e.target.value)}
									/>
									<div className='flex flex-col gap-1.5'>
										<label htmlFor={`${id}-state`} className={label()}>
											State
										</label>
										<select id={`${id}-state`} name='state' className={select()} value={answers.state} onChange={e => update('state', e.target.value)}>
											<option value=''>Select</option>
											{STATES.map(s => (
												<option key={s} value={s}>
													{s}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className='flex flex-col gap-1.5'>
									<label htmlFor={`${id}-office`} className={label()}>
										What office are you running for?
									</label>
									<select id={`${id}-office`} name='office' className={select()} value={answers.office} onChange={e => update('office', e.target.value)}>
										<option value=''>Select</option>
										{OFFICES.map(o => (
											<option key={o.value} value={o.value}>
												{o.label}
											</option>
										))}
									</select>
								</div>
								{answers.office === 'other' && (
									<TextInput
										label='Tell us the office'
										name='office_other'
										placeholder='e.g. Township trustee, Village board'
										value={answers.officeOther}
										onChange={e => update('officeOther', e.target.value)}
									/>
								)}
								{stepError && (
									<span role='alert' className={errorClass()}>
										{stepError}
									</span>
								)}
								<div className={actions()}>
									<span />
									<Button parent='DemoRequestBlock' type='submit' styleType={primaryButtonStyleType} styleSize='lg'>
										Continue
									</Button>
								</div>
							</form>
						)}

						{step === 'goals' && (
							<form onSubmit={submitGoals} noValidate className={fields()}>
								<div>
									<Text styleType='caption' className='text-neutral-600'>
										Step 2 of 3
									</Text>
									<Text as='h3' styleType='heading-sm'>
										What are you hoping GoodParty.org helps with?
									</Text>
								</div>
								<fieldset className='flex flex-col gap-2'>
									<legend className={cn(label(), 'mb-1.5')}>Pick everything that applies</legend>
									<div className={options()}>
										{GOALS.map(g => (
											<label key={g.value} className={option()}>
												<input
													type='checkbox'
													name='goals'
													value={g.value}
													className={optionInput()}
													checked={answers.goals.includes(g.value)}
													onChange={e =>
														update('goals', e.target.checked ? [...answers.goals, g.value] : answers.goals.filter(v => v !== g.value))
													}
												/>
												<span>{g.label}</span>
											</label>
										))}
									</div>
								</fieldset>
								<fieldset className='flex flex-col gap-2'>
									<legend className={cn(label(), 'mb-1.5')}>Where is your campaign today?</legend>
									<div className={options()}>
										{STAGES.map(s => (
											<label key={s.value} className={option()}>
												<input
													type='radio'
													name='stage'
													value={s.value}
													className={optionInput()}
													checked={answers.stage === s.value}
													onChange={() => update('stage', s.value)}
												/>
												<span>{s.label}</span>
											</label>
										))}
									</div>
								</fieldset>
								{stepError && (
									<span role='alert' className={errorClass()}>
										{stepError}
									</span>
								)}
								<div className={actions()}>
									<Button parent='DemoRequestBlock' type='button' styleType='ghost' styleSize='lg' onClick={() => goTo('race')}>
										Back
									</Button>
									<Button parent='DemoRequestBlock' type='submit' styleType={primaryButtonStyleType} styleSize='lg'>
										Continue
									</Button>
								</div>
							</form>
						)}

						{step === 'contact' && (
							<form onSubmit={submitContact} noValidate className={fields()}>
								<div>
									<Text styleType='caption' className='text-neutral-600'>
										Step 3 of 3
									</Text>
									<Text as='h3' styleType='heading-sm'>
										How do we reach you?
									</Text>
								</div>
								<div className={row()}>
									<TextInput
										label='First name'
										name='first_name'
										autoComplete='given-name'
										value={answers.firstName}
										onChange={e => update('firstName', e.target.value)}
									/>
									<TextInput
										label='Last name'
										name='last_name'
										autoComplete='family-name'
										value={answers.lastName}
										onChange={e => update('lastName', e.target.value)}
									/>
								</div>
								<TextInput
									label='Email'
									name='email'
									type='email'
									autoComplete='email'
									inputMode='email'
									placeholder='you@example.com'
									value={answers.email}
									onChange={e => update('email', e.target.value)}
								/>
								<TextInput
									label='Mobile number'
									name='phone'
									type='tel'
									autoComplete='tel'
									inputMode='tel'
									placeholder='(555) 555-5555'
									value={answers.phone}
									onChange={e => update('phone', e.target.value)}
								/>
								<label className={consent()}>
									<input
										type='checkbox'
										name='sms_consent'
										className={optionInput()}
										checked={answers.smsConsent}
										onChange={e => update('smsConsent', e.target.checked)}
									/>
									<span>It is OK to text me about my demo and my campaign. Message and data rates may apply. Reply STOP to opt out.</span>
								</label>
								{stepError && (
									<span role='alert' className={errorClass()}>
										{stepError}
									</span>
								)}
								<div className={actions()}>
									<Button parent='DemoRequestBlock' type='button' styleType='ghost' styleSize='lg' onClick={() => goTo('goals')}>
										Back
									</Button>
									<Button parent='DemoRequestBlock' type='submit' styleType={primaryButtonStyleType} styleSize='lg'>
										Request my demo
									</Button>
								</div>
								<Text styleType='caption' className='text-neutral-600'>
									By submitting you agree to our terms and privacy policy. We only work with candidates running independent of the two
									major parties and big money.
								</Text>
							</form>
						)}

						{step === 'checking' && (
							<div className={checking()} role='status' aria-live='polite'>
								<span className={spinner()} aria-hidden='true' />
								<Text as='h3' styleType='heading-sm'>
									Checking a few things
								</Text>
								<Text styleType='body-2' className='text-neutral-600'>
									This takes a few seconds.
								</Text>
							</div>
						)}

						{step === 'result' && result?.outcome === 'pass' && (
							<div className='flex flex-col gap-3'>
								<span className={cn(tag(), 'bg-success-50 text-success-600')}>You are a fit for a live demo</span>
								<Text as='h3' styleType='heading-sm'>
									Pick a time, {firstName}
								</Text>
								<Text styleType='body-2'>
									Fifteen to twenty minutes with someone from our team. We will pull up the voter file for {cityName} and walk
									through what the next two weeks should look like.
								</Text>
								{result.calendar_url && (
									<>
										<EmbedHtml
											html={`<div class="meetings-iframe-container" data-src="${result.calendar_url}?embed=true"></div>`}
											height={720}
										/>
										<Text styleType='caption' className='text-neutral-600'>
											Calendar not loading?{' '}
											<a href={result.calendar_url} target='_blank' rel='noopener noreferrer' className='underline'>
												Open it in a new tab
											</a>
											.
										</Text>
									</>
								)}
							</div>
						)}

						{step === 'result' && result?.outcome === 'tour' && (
							<div className='flex flex-col gap-3'>
								<span className={cn(tag(), 'bg-bright-yellow-100 text-midnight-900')}>Start with the product tour</span>
								<Text as='h3' styleType='heading-sm'>
									Thanks, {firstName}. Here is the fastest way to see it.
								</Text>
								<Text styleType='body-2'>
									Based on your answers, a self-guided tour will show you more right now than a live meeting would. It takes about four
									minutes and covers the campaign plan, voter data, and outreach tools. When your race moves forward, come back and we
									will set up a call.
								</Text>
								<div className={tourCard()}>
									<Text as='h4' styleType='heading-xs'>
										GoodParty.org product tour
									</Text>
									<Text styleType='body-2'>Click through the real product at your own pace. No account needed.</Text>
									<ComponentButton
										buttonType='internal'
										href={result.redirect_url || DEFAULT_TOUR_URL}
										label='Take the tour'
										className='w-fit'
										buttonProps={{ styleType: 'outline-inverse', styleSize: 'lg' }}
									/>
									{countdown !== null && (
										<Text styleType='caption' className='text-midnight-300'>
											Taking you there in {countdown} {countdown === 1 ? 'second' : 'seconds'}
										</Text>
									)}
								</div>
								<Text styleType='caption' className='text-neutral-600'>
									Prefer to start for free?{' '}
									<Link href='/run-for-office' className='underline'>
										Create a free account
									</Link>{' '}
									and build your campaign plan today.
								</Text>
							</div>
						)}
					</div>
				</div>
			</Container>
		</article>
	);
}
