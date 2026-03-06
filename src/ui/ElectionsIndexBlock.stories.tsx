import type { Meta, StoryObj } from '@storybook/react';
import { ElectionsIndexBlock } from './ElectionsIndexBlock.tsx';

const meta: Meta<typeof ElectionsIndexBlock> = {
	title: 'New Components/Page Sections/Elections Index Block',
	component: ElectionsIndexBlock,
	render: args => <ElectionsIndexBlock {...args} />,
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for Illinois counties (state code: il)
const illinoisCounties = [
	{ name: 'Adams County', href: '/elections/il/adams-county', level: 'county' as const },
	{ name: 'Alexander County', href: '/elections/il/alexander-county', level: 'county' as const },
	{ name: 'Bond County', href: '/elections/il/bond-county', level: 'county' as const },
	{ name: 'Boone County', href: '/elections/il/boone-county', level: 'county' as const },
	{ name: 'Brown County', href: '/elections/il/brown-county', level: 'county' as const },
	{ name: 'Bureau County', href: '/elections/il/bureau-county', level: 'county' as const },
	{ name: 'Calhoun County', href: '/elections/il/calhoun-county', level: 'county' as const },
	{ name: 'Carroll County', href: '/elections/il/carroll-county', level: 'county' as const },
	{ name: 'Cass County', href: '/elections/il/cass-county', level: 'county' as const },
	{ name: 'Champaign County', href: '/elections/il/champaign-county', level: 'county' as const },
	{ name: 'Christian County', href: '/elections/il/christian-county', level: 'county' as const },
	{ name: 'Clark County', href: '/elections/il/clark-county', level: 'county' as const },
	{ name: 'Clay County', href: '/elections/il/clay-county', level: 'county' as const },
	{ name: 'Clinton County', href: '/elections/il/clinton-county', level: 'county' as const },
	{ name: 'Coles County', href: '/elections/il/coles-county', level: 'county' as const },
	{ name: 'Cook County', href: '/elections/il/cook-county', level: 'county' as const },
	{ name: 'Crawford County', href: '/elections/il/crawford-county', level: 'county' as const },
	{ name: 'Cumberland County', href: '/elections/il/cumberland-county', level: 'county' as const },
	{ name: 'DeKalb County', href: '/elections/il/dekalb-county', level: 'county' as const },
	{ name: 'DeWitt County', href: '/elections/il/dewitt-county', level: 'county' as const },
	{ name: 'Douglas County', href: '/elections/il/douglas-county', level: 'county' as const },
	{ name: 'DuPage County', href: '/elections/il/dupage-county', level: 'county' as const },
	{ name: 'Edgar County', href: '/elections/il/edgar-county', level: 'county' as const },
	{ name: 'Edwards County', href: '/elections/il/edwards-county', level: 'county' as const },
	{ name: 'Effingham County', href: '/elections/il/effingham-county', level: 'county' as const },
	{ name: 'Fayette County', href: '/elections/il/fayette-county', level: 'county' as const },
	{ name: 'Ford County', href: '/elections/il/ford-county', level: 'county' as const },
	{ name: 'Franklin County', href: '/elections/il/franklin-county', level: 'county' as const },
	{ name: 'Fulton County', href: '/elections/il/fulton-county', level: 'county' as const },
	{ name: 'Gallatin County', href: '/elections/il/gallatin-county', level: 'county' as const },
];

// Sample data for Cook County cities
const cookCountyCities = [
	{ name: 'Chicago', href: '/elections/il/cook-county/chicago', level: 'city' as const },
	{ name: 'Evanston', href: '/elections/il/cook-county/evanston', level: 'city' as const },
	{ name: 'Oak Park', href: '/elections/il/cook-county/oak-park', level: 'city' as const },
	{ name: 'Cicero', href: '/elections/il/cook-county/cicero', level: 'city' as const },
	{ name: 'Skokie', href: '/elections/il/cook-county/skokie', level: 'city' as const },
	{ name: 'Des Plaines', href: '/elections/il/cook-county/des-plaines', level: 'city' as const },
	{ name: 'Arlington Heights', href: '/elections/il/cook-county/arlington-heights', level: 'city' as const },
	{ name: 'Schaumburg', href: '/elections/il/cook-county/schaumburg', level: 'city' as const },
	{ name: 'Palatine', href: '/elections/il/cook-county/palatine', level: 'city' as const },
	{ name: 'Orland Park', href: '/elections/il/cook-county/orland-park', level: 'city' as const },
	{ name: 'Tinley Park', href: '/elections/il/cook-county/tinley-park', level: 'city' as const },
	{ name: 'Oak Lawn', href: '/elections/il/cook-county/oak-lawn', level: 'city' as const },
];

// Generate Texas counties for large result set test (state code: tx)
const texasCounties = Array.from({ length: 254 }, (_, i) => ({
	name: `County ${String(i + 1).padStart(3, '0')}`,
	href: `/elections/tx/county-${String(i + 1).padStart(3, '0')}`,
	level: 'county' as const,
}));

export const StateLevel: Story = {
	args: {
		backgroundColor: 'midnight',
		stateSlug: 'il',
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
		stateSlug: 'il',
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
		stateSlug: 'il',
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
		stateSlug: 'tx',
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
		stateSlug: 'il',
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
		stateSlug: 'il',
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
		stateSlug: 'il',
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
		stateSlug: 'il',
		header: {
			title: 'Counties in Illinois',
		},
		elections: illinoisCounties,
		initialDisplayCount: 24,
	},
};
