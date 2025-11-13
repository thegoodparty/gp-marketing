import type { AvatarProps } from '../Avatar';

export function resolveAvatars(avatars?: any): AvatarProps[] | undefined {
	return avatars?.map((person: any) => ({
		_key: person._id,
		image: person.personOverview?.img_profilePicture,
	}));
}
