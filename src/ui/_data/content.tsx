export const primaryButton = {
	label: 'Primary CTA',
	href: '/',
	buttonProps: {
		styleType: 'primary' as const,
	},
	buttonType: 'internal' as const,
};

export const secondaryButton = {
	label: 'Secondary CTA',
	href: '/',
	buttonProps: {
		styleType: 'secondary' as const,
	},
	buttonType: 'internal' as const,
};

export function buttons() {
	return [primaryButton, secondaryButton];
}

export function shortCopy() {
	return (
		<>
			<p>
				Lorem ipsum dolor sit amet consectetur. Sit vivamus mattis mollis quam elementum tellus. Quis vestibulum ipsum in consectetur
				mattis. Fusce tortor proin nisl cursus ultrices laoreet aliquam nulla tincidunt.
			</p>
			<p>
				Et cursus cursus ullamcorper vestibulum at tincidunt placerat convallis. Tempus lectus tellus sed velit vel pretium et laoreet. Nec
				dolor ultrices suspendisse cras pretium.
			</p>
		</>
	);
}

export function longCopy() {
	return (
		<>
			<h2>Lorem ipsum dolor sit amet, consectetur adipiscing elit?</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac aliquam mi non rutrum risus elementum quis sed dolor. Etiam velit neque
				et ornare id. Eu fringilla aliquam, pellentesque lorem.
			</p>
			<p>
				Sed a a ac velit amet etiam facilisis. <a href=''>Pretium at diam vivamus</a> quis diam imperdiet sed ipsum. Magnis aliquet
				fermentum in maecenas ultricies nibh auctor egestas. Velit, lobortis interdum tellus turpis morbi. Dignissim varius ligula nec sed.
				Augue convallis quam elementum morbi nec praesent pharetra. Donec pulvinar fringilla quam enim nisi iaculis id diam. Viverra integer
				fames consectetur vitae.
			</p>
			<ul>
				<li>Sit hoc ultimum bonorum, quod nunc a me defenditur;</li>
				<li>Claudii libidini, qui tum erat summo ne imperio, dederetur.</li>
				<li>Negat enim summo bono afferre incrementum diem.</li>
				<li>Quis istud possit, inquit, negare?</li>
				<li>Sit ista in Graecorum levitate perversitas, qui maledictis insectantur eos, a quibus de veritate dissentiunt.</li>
			</ul>
			<p>
				Elementum massa est faucibus tellus luctus aliquam urna nunc. Faucibus quis ultricies ac at aliquet in scelerisque nam. Pretium,
				tellus ullamcorper in quam porttitor. Leo a tortor tellus in elementum. Parturient ornare at consectetur massa fringilla augue
				tempor. Convallis urna viverra odio lorem. Risus mattis sollicitudin duis ac sagittis, id platea metus. Parturient auctor cras
				turpis consectetur vulputate libero. Elit dictumst donec dignissim urna auctor semper.{' '}
			</p>
			<h4>Lorem ipsum dolor sit amet, consectetur adipiscing elit?</h4>
			<ol>
				<li>
					Sit hoc ultimum bonorum, quod nunc a me defenditur;
					<ol>
						<li>Sit hoc ultimum bonorum, quod nunc a me defenditur;</li>
						<li>Claudii libidini, qui tum erat summo ne imperio, dederetur.</li>
						<li>Negat enim summo bono afferre incrementum diem.</li>
						<li>Quis istud possit, inquit, negare?</li>
						<li>Sit ista in Graecorum levitate perversitas, qui maledictis insectantur eos, a quibus de veritate dissentiunt.</li>
					</ol>
				</li>
				<li>Claudii libidini, qui tum erat summo ne imperio, dederetur.</li>
				<li>Negat enim summo bono afferre incrementum diem.</li>
				<li>Quis istud possit, inquit, negare?</li>
				<li>Sit ista in Graecorum levitate perversitas, qui maledictis insectantur eos, a quibus de veritate dissentiunt.</li>
			</ol>
			<p>
				Viverra purus consequat porta sit amet, et eu massa, interdum. Dui enim at sed habitant urna quam aenean. In ultricies amet amet,
				pretium, accumsan sit pellentesque urna. Dolor interdum venenatis sit orci tincidunt purus a, quis. Est facilisis iaculis.
			</p>
			<blockquote>
				Leo a tortor tellus in elementum. Parturient ornare at consectetur massa fringilla augue tempor. Convallis urna viverra odio lorem.
				Risus mattis sollicitudin duis ac sagittis. Viverra purus consequat porta sit amet, et eu massa, interdum. Dui enim at sed habitant
				urna quam aenean. In ultricies amet amet, pretium, accumsan sit pellentesque urna. Dolor interdum venenatis sit orci tincidunt purus
				a, quis. Est facilisis iaculis.
			</blockquote>
			<p>
				Viverra purus consequat porta sit amet, et eu massa, interdum. Dui enim at sed habitant urna quam aenean. In ultricies amet amet,
				pretium, accumsan sit pellentesque urna. Dolor interdum venenatis sit orci tincidunt purus a, quis. Est facilisis iaculis.
			</p>
		</>
	);
}
