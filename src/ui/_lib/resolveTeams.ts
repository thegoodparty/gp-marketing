import type { Person } from 'sanity.types';
import type { TeamCardProps } from '../TeamCard';

export const resolveTeams = (teams?: any): TeamCardProps[] => {
	return teams?.map((team: Person) => ({
		_key: team._id,
		title: team.personOverview?.field_personName,
		label: team.personOverview?.field_jobTitleOrRole,
		image: team.personOverview?.img_profilePicture,
	}));
};
