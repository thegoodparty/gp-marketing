/**
 * Resolves the incoming design value based on the provided design type values.
 *
 * @param incomingDesignValue - The value to be resolved.
 * @param designTypeValues - An array of design type values to compare against.
 *
 * @returns The resolved design value if it matches one of the design type values, otherwise undefined.
 */
export function designTypeResolve<T extends readonly string[]>(
	incomingDesignValue: string | undefined,
	designTypeValues: T,
): T[number] | undefined {
	return incomingDesignValue && Array.isArray(designTypeValues) && designTypeValues.includes(incomingDesignValue)
		? incomingDesignValue
		: undefined;
}
