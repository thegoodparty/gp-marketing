import type { Meta, StoryObj } from '@storybook/react';
import { ElectionsIndexBlock } from './ElectionsIndexBlock.tsx';

const meta: Meta<typeof ElectionsIndexBlock> = {
	title: 'Page Sections/Elections Index Block',
	component: ElectionsIndexBlock,
	render: args => <ElectionsIndexBlock {...args} />,
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for Illinois counties
const illinoisCounties = [
	{ name: 'Adams County', href: '/elections/illinois/adams-county', level: 'county' as const },
	{ name: 'Alexander County', href: '/elections/illinois/alexander-county', level: 'county' as const },
	{ name: 'Bond County', href: '/elections/illinois/bond-county', level: 'county' as const },
	{ name: 'Boone County', href: '/elections/illinois/boone-county', level: 'county' as const },
	{ name: 'Brown County', href: '/elections/illinois/brown-county', level: 'county' as const },
	{ name: 'Bureau County', href: '/elections/illinois/bureau-county', level: 'county' as const },
	{ name: 'Calhoun County', href: '/elections/illinois/calhoun-county', level: 'county' as const },
	{ name: 'Carroll County', href: '/elections/illinois/carroll-county', level: 'county' as const },
	{ name: 'Cass County', href: '/elections/illinois/cass-county', level: 'county' as const },
	{ name: 'Champaign County', href: '/elections/illinois/champaign-county', level: 'county' as const },
	{ name: 'Christian County', href: '/elections/illinois/christian-county', level: 'county' as const },
	{ name: 'Clark County', href: '/elections/illinois/clark-county', level: 'county' as const },
	{ name: 'Clay County', href: '/elections/illinois/clay-county', level: 'county' as const },
	{ name: 'Clinton County', href: '/elections/illinois/clinton-county', level: 'county' as const },
	{ name: 'Coles County', href: '/elections/illinois/coles-county', level: 'county' as const },
	{ name: 'Cook County', href: '/elections/illinois/cook-county', level: 'county' as const },
	{ name: 'Crawford County', href: '/elections/illinois/crawford-county', level: 'county' as const },
	{ name: 'Cumberland County', href: '/elections/illinois/cumberland-county', level: 'county' as const },
	{ name: 'DeKalb County', href: '/elections/illinois/dekalb-county', level: 'county' as const },
	{ name: 'DeWitt County', href: '/elections/illinois/dewitt-county', level: 'county' as const },
	{ name: 'Douglas County', href: '/elections/illinois/douglas-county', level: 'county' as const },
	{ name: 'DuPage County', href: '/elections/illinois/dupage-county', level: 'county' as const },
	{ name: 'Edgar County', href: '/elections/illinois/edgar-county', level: 'county' as const },
	{ name: 'Edwards County', href: '/elections/illinois/edwards-county', level: 'county' as const },
	{ name: 'Effingham County', href: '/elections/illinois/effingham-county', level: 'county' as const },
	{ name: 'Fayette County', href: '/elections/illinois/fayette-county', level: 'county' as const },
	{ name: 'Ford County', href: '/elections/illinois/ford-county', level: 'county' as const },
	{ name: 'Franklin County', href: '/elections/illinois/franklin-county', level: 'county' as const },
	{ name: 'Fulton County', href: '/elections/illinois/fulton-county', level: 'county' as const },
	{ name: 'Gallatin County', href: '/elections/illinois/gallatin-county', level: 'county' as const },
];

// Sample data for Cook County cities
const cookCountyCities = [
	{ name: 'Chicago', href: '/elections/illinois/cook-county/chicago', level: 'city' as const },
	{ name: 'Evanston', href: '/elections/illinois/cook-county/evanston', level: 'city' as const },
	{ name: 'Oak Park', href: '/elections/illinois/cook-county/oak-park', level: 'city' as const },
	{ name: 'Cicero', href: '/elections/illinois/cook-county/cicero', level: 'city' as const },
	{ name: 'Skokie', href: '/elections/illinois/cook-county/skokie', level: 'city' as const },
	{ name: 'Des Plaines', href: '/elections/illinois/cook-county/des-plaines', level: 'city' as const },
	{ name: 'Arlington Heights', href: '/elections/illinois/cook-county/arlington-heights', level: 'city' as const },
	{ name: 'Schaumburg', href: '/elections/illinois/cook-county/schaumburg', level: 'city' as const },
	{ name: 'Palatine', href: '/elections/illinois/cook-county/palatine', level: 'city' as const },
	{ name: 'Orland Park', href: '/elections/illinois/cook-county/orland-park', level: 'city' as const },
	{ name: 'Tinley Park', href: '/elections/illinois/cook-county/tinley-park', level: 'city' as const },
	{ name: 'Oak Lawn', href: '/elections/illinois/cook-county/oak-lawn', level: 'city' as const },
];

// Generate Texas counties for large result set test
const texasCounties = Array.from({ length: 254 }, (_, i) => ({
	name: `County ${String(i + 1).padStart(3, '0')}`,
	href: `/elections/texas/county-${String(i + 1).padStart(3, '0')}`,
	level: 'county' as const,
}));

export const StateLevel: Story = {
	args: {
		backgroundColor: 'midnight',
		stateSlug: 'illinois',
		header: {
			label: 'Illinois Elections',
			title: 'Counties in Illinois',
			copy: 'Browse elections by county to find races in your area.',
		},
		elections: illinoisCounties,
		initialDisplayCount: 24,
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=22896-253869',
		},
	},
};

export const CountyLevel: Story = {
	args: {
		backgroundColor: 'midnight',
		stateSlug: 'illinois',
		countySlug: 'cook-county',
		header: {
			label: 'Cook County Elections',
			title: 'Cities in Cook County',
			copy: 'Browse elections by city to find races in your area.',
		},
		elections: cookCountyCities,
		initialDisplayCount: 24,
	},
};

export const CreamBackground: Story = {
	args: {
		backgroundColor: 'cream',
		stateSlug: 'illinois',
		header: {
			label: 'Illinois Elections',
			title: 'Counties in Illinois',
			copy: 'Browse elections by county to find races in your area.',
		},
		elections: illinoisCounties,
		initialDisplayCount: 24,
	},
};

export const LargeResultSet: Story = {
	args: {
		backgroundColor: 'midnight',
		stateSlug: 'texas',
		header: {
			label: 'Texas Elections',
			title: 'Counties in Texas',
			copy: 'Texas has 254 counties. Use the search to find your county.',
		},
		elections: texasCounties,
		initialDisplayCount: 24,
	},
};

export const EmptyResults: Story = {
	args: {
		backgroundColor: 'midnight',
		stateSlug: 'illinois',
		header: {
			label: 'Illinois Elections',
			title: 'Counties in Illinois',
			copy: 'Browse elections by county to find races in your area.',
		},
		elections: [],
		initialDisplayCount: 24,
	},
};

export const CityLevel: Story = {
	args: {
		backgroundColor: 'midnight',
		stateSlug: 'illinois',
		countySlug: 'cook-county',
		citySlug: 'chicago', // Component returns null when citySlug is provided
		header: {
			title: 'Should not render',
		},
		elections: [],
	},
	render: args => (
		<div className="p-8 bg-goodparty-cream min-h-[200px]">
			<div className="mb-4 p-4 bg-amber-100 border border-amber-300 rounded-lg">
				<p className="font-semibold text-amber-800">Expected Behavior: Component returns null</p>
				<p className="text-amber-700 text-sm mt-1">
					When <code className="bg-amber-200 px-1 rounded">citySlug</code> is provided, the ElectionsIndexBlock
					component returns <code className="bg-amber-200 px-1 rounded">null</code> because city pages should not
					display this component (there are no child locations below city level).
				</p>
			</div>
			<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
				<p>Component output area (empty because component returns null):</p>
				<ElectionsIndexBlock {...args} />
			</div>
		</div>
	),
};

export const WithoutSearch: Story = {
	args: {
		backgroundColor: 'midnight',
		stateSlug: 'illinois',
		header: {
			label: 'Illinois Elections',
			title: 'Counties in Illinois',
		},
		elections: illinoisCounties.slice(0, 12),
		showSearch: false,
		initialDisplayCount: 24,
	},
};

export const MinimalHeader: Story = {
	args: {
		backgroundColor: 'midnight',
		stateSlug: 'illinois',
		header: {
			title: 'Counties in Illinois',
		},
		elections: illinoisCounties,
		initialDisplayCount: 24,
	},
};
