import 'server-only';
import { AmplitudeCookie, Experiment } from '@amplitude/experiment-node-server';
import { cookies } from 'next/headers';

const DEPLOYMENT_KEY = process.env['AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY'];

let clientPromise: ReturnType<typeof initClient> | null = null;

async function initClient() {
	if (!DEPLOYMENT_KEY) return null;
	return Experiment.initializeRemote(DEPLOYMENT_KEY);
}

function getClient() {
	if (!clientPromise) {
		clientPromise = initClient();
	}
	return clientPromise;
}

export async function getAmplitudeDeviceId(): Promise<string | null> {
	const apiKey = process.env['NEXT_PUBLIC_AMPLITUDE_API_KEY'];
	if (!apiKey) return null;

	const cookieName = `AMP_${apiKey.substring(0, 10)}`;
	const jar = await cookies();
	const raw = jar.get(cookieName)?.value;
	if (!raw) return null;

	// Next may URL-encode cookie values in Set-Cookie (e.g. '=' as '%3D'). Browsers usually
	// send decoded values, but normalize so AmplitudeCookie.parse always receives raw base64.
	let normalized = raw;
	try {
		normalized = decodeURIComponent(raw);
	} catch {
		normalized = raw;
	}
	const parsed = AmplitudeCookie.parse(normalized, true);
	return parsed.device_id ?? null;
}

export async function resolveVariant(flagKey: string): Promise<string | null> {
	try {
		const client = await getClient();
		if (!client) return null;

		const deviceId = await getAmplitudeDeviceId();
		if (!deviceId) return null;

		const variants = await client.fetchV2({ device_id: deviceId }, { flagKeys: [flagKey] });
		const variant = variants[flagKey];
		return variant?.value ?? variant?.key ?? null;
	} catch {
		return null;
	}
}
