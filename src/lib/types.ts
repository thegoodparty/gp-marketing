export type Params<
	T extends undefined | ((context: any) => Promise<Record<string, string>[]>) = undefined,
	Type = T extends (context: any) => Promise<Record<infer F, string>[]> ? Record<F | 'locale', string> : { locale: string },
> = {
	params: Type;
	searchParams: Record<string, string | string[] | undefined>;
};
