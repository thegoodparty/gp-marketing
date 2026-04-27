export function undefinedCheck<T>(value: T): NonNullable<T> {
	return value ? value : (undefined as any);
}
