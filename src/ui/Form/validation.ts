export function fieldValidation(type: 'email' | 'tel' | 'text') {
	switch (type) {
		case 'email':
			return {
				value:
					/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			};

		default:
			return undefined;
	}
}
