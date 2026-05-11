import 'server-only';
import { Experiment } from '@amplitude/experiment-node-server';
import { cookies } from 'next/headers';

const DEPLOYMENT_KEY = process.env['AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY'];

let clientPromise: ReturnType<typeof initClient> | null = null;

async function initClient() {
	if (!DEPLOYMENT_KEY) return null;
	const client = Experiment.initializeLocal(DEPLOYMENT_KEY);
	await client.start();
	return client;
}

function getClient(): Promise<Awaited<ReturnType<typeof initClient>>> {
	const promise = clientPromise ?? initClient();
	clientPromise = promise;
	return promise;
}

export async function getAmplitudeDeviceId(): Promise<string | null> {
	const apiKey = process.env['NEXT_PUBLIC_AMPLITUDE_API_KEY'];
	if (!apiKey) return null;

	const cookieName = `AMP_${apiKey.substring(0, 10)}`;
	const jar = await cookies();
	const raw = jar.get(cookieName)?.value;
	if (!raw) return null;

	try {
		const decoded = decodeURIComponent(raw);
		const parsed: unknown = JSON.parse(decoded);
		if (typeof parsed !== 'object' || parsed === null) return null;
		const deviceId = (parsed as Record<string, unknown>)['deviceId'];
		return typeof deviceId === 'string' ? deviceId : null;
	} catch {
		return null;
	}
}

export async function resolveVariant(flagKey: string): Promise<string | null> {
	try {
		const client = await getClient();
		if (!client) return null;

		const deviceId = await getAmplitudeDeviceId();
		if (!deviceId) return null;

		const variants = client.evaluateV2({ device_id: deviceId }, [flagKey]);
		return variants[flagKey]?.value ?? null;
	} catch {
		return null;
	}
}
