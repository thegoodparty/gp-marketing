export function undefinedCheck<T extends any>(value: T): NonNullable<T> {
	return value ? value : (undefined as any);
}
