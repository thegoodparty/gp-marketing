export function getSetValues<S extends Set<unknown>>(set: S): S extends Set<infer T> ? T[] : never {
	return [...set.values()] as any;
}

export function getMapValues<M extends Map<unknown, unknown>>(map: M): M extends Map<any, infer T> ? T[] : never {
	return [...map.values()] as any;
}
