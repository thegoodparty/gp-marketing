import type { ComponentProps, ComponentType, JSXElementConstructor, ReactElement } from 'react';
import type { Img_image } from 'sanity.types';

export type SanityImage = Img_image;

type InputType<T> = {
	[key: string]: any;
	name?: string;
	description?: string;
	defaultValue?: T;
	type?: Record<string, any> | 'boolean' | 'string' | 'number' | 'function' | 'symbol';
	if?:
		| {
				arg: string;
		  }
		| {
				global: string;
		  };
};

type StoryContextForLoaders<Component = ComponentType<any>, TArgs = Record<string, any>> = {
	[key: string]: any;
	componentId: string;
	title: string;
	kind: string;
	id: string;
	name: string;
	story: string;
	component?: Component;
	subcomponents?: Record<string, ComponentType<any>>;
	parameters: Record<string, any>;
	hooks: unknown;
	viewMode: 'story' | 'docs';
	globals: Record<string, any>;
	originalStoryFn:
		| ((context: StoryContext<Component, TArgs>) => ReactElement<unknown>)
		| ((args: TArgs, context: StoryContext<Component, TArgs>) => ReactElement<unknown>);
	args: TArgs;
	initialArgs: TArgs;
	argTypes: {
		[K in keyof TArgs]: InputType<TArgs[K]> & {
			name: string;
			type?: Record<string, any>;
		};
	};
};
type StoryContext<Component = ComponentType<any>, TArgs = Record<string, any>> = StoryContextForLoaders<Component, TArgs> & {
	loaded: Record<string, any>;
	abortSignal: AbortSignal;
	canvasElement: HTMLElement;
};

type BaseAnnotations<Component = ComponentType<any>, TArgs = Record<string, any>> = {
	parameters?: Record<string, any>;
	args?: TArgs;
	argTypes?: Partial<{
		[K in keyof TArgs]: InputType<TArgs[K]>;
	}>;
	decorators?: ((
		fn: (update?: { [key: string]: any; args?: TArgs; globals?: Record<string, any> }) => ReactElement<unknown>,
		c: StoryContext<Component, TArgs>,
	) => ReactElement<unknown>)[];
	loaders?: ((context: StoryContextForLoaders<Component, TArgs>) => Promise<Record<string, any>>)[];
	render?(args: TArgs, context: StoryContext<Component, TArgs>): ReactElement<unknown>;
};

type Story<Component = ComponentType<any>, TArgs = Record<string, any>> = BaseAnnotations<Component, TArgs> & {
	story?: {
		name?: string;
		storyName?: string;
		play?(context: StoryContext<TArgs>): Promise<void> | void;
	};
	name?: string;
	storyName?: string;
	play?(context: StoryContext<TArgs>): Promise<void> | void;
} & ((args: TArgs, context: StoryContext<Component, TArgs>) => ReactElement<unknown>);
export type ComponentStory<
	T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
	ExtraProps extends Record<string, any> = Record<string, never>,
> = Story<T, ComponentProps<T> & ExtraProps>;

type Meta<Component = ComponentType<any>, TArgs = Record<string, any>> = BaseAnnotations<Component, TArgs> & {
	title?: string;
	id?: string;
	includeStories?: RegExp | string[];
	excludeStories?: RegExp | string[];
	component?: Component;
	subcomponents?: Record<string, ComponentType<any>>;
};
export type ComponentMeta<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> = Meta<T, ComponentProps<T>>;
import type { DynamicOptions, Loader } from 'next/dynamic';
import type { FunctionComponent } from 'react';

declare module 'next/dynamic' {
	export default function dynamic<P extends Record<string, unknown> = Record<string, never>>(
		dynamicOptions: DynamicOptions<P> | Loader<P>,
		options?: DynamicOptions<P>,
	): FunctionComponent<P>;
}
