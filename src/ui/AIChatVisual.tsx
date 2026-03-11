import { cn, tv } from './_lib/utils.ts';

const styles = tv({
	slots: {
		base: 'relative bg-white rounded-2xl border border-neutral-200 p-10 min-h-[30rem] flex flex-col',
		header: 'flex items-center gap-2 mb-6 flex-shrink-0',
		dot: 'w-3 h-3 rounded-full',
		dotR: 'bg-[#FF5F57]',
		dotY: 'bg-[#FFBD2E]',
		dotG: 'bg-[#28C840]',
		bubbles: 'flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto',
		bubble: 'py-4 px-5 rounded-2xl text-sm leading-[1.5] max-w-[85%]',
		bubbleUser: 'bg-midnight-900 text-white self-end ml-auto rounded-br-sm',
		bubbleAi: 'bg-neutral-100 text-midnight-900 rounded-bl-sm',
		aiName: 'font-bold text-[#0052A5] text-xs uppercase tracking-wider mb-1.5',
	},
});

export type AIChatMessage = {
	role: 'user' | 'ai';
	name?: string;
	text: string;
};

export type AIChatVisualProps = {
	messages: AIChatMessage[];
	className?: string;
};

export function AIChatVisual(props: AIChatVisualProps) {
	const { base, header, dot, dotR, dotY, dotG, bubbles, bubble, bubbleUser, bubbleAi, aiName } = styles();

	return (
		<div className={cn(base(), props.className)} data-component='AIChatVisual'>
			<div className={header()}>
				<span className={cn(dot(), dotR())} />
				<span className={cn(dot(), dotY())} />
				<span className={cn(dot(), dotG())} />
			</div>
			<div className={bubbles()}>
				{props.messages.map((msg, i) => (
					<div
						key={i}
						className={cn(bubble(), msg.role === 'user' ? bubbleUser() : bubbleAi())}
					>
						{msg.role === 'ai' && msg.name && (
							<div className={aiName()}>{msg.name}</div>
						)}
						{msg.text}
					</div>
				))}
			</div>
		</div>
	);
}
