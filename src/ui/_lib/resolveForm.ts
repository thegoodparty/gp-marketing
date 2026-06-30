import type { Field_formProvider, Field_formType, Forms } from 'sanity.types';

export type FormProps = {
	type?: Field_formType;
	provider?: Field_formProvider;
	formId?: string;
	redirectTo?: string;
};

export function resolveForm(form?: Forms) {
	if (!form?.formOverview) return undefined;

	const { field_formProvider, field_formType, field_hubspotFormId, field_redirectUrl } = form.formOverview;

	if (field_formProvider === 'Hubspot' && field_formType === 'Newsletter') {
		return {
			provider: field_formProvider,
			formId: field_hubspotFormId,
			type: field_formType,
			redirectTo: field_redirectUrl || undefined,
		};
	}

	return undefined;
}
