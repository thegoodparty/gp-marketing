import { defineEnableDraftMode } from 'next-sanity/draft-mode';

import { client } from '~/lib/client';
import { token } from '~/lib/env';

export const { GET } = defineEnableDraftMode({
	client: client.withConfig({
		token,
	}),
});
