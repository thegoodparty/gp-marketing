import React from 'react';
import * as MdIcons from 'react-icons/fa';

interface DynamicIconProps {
  iconName: string;
  size?: number;
  color?: string;
  className?: string;
}

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

type IconComponent = React.FC<IconProps>;

const DynamicIcon: React.FC<DynamicIconProps> = ({
  iconName,
  size = 24,
  color = 'currentColor',
  className = '',
}) => {
  if (!iconName) return null;

  // Ensure the icon name starts with Md
  if (!iconName.startsWith('Md')) {
    console.error(`Icon ${iconName} must start with 'Md' for Material Design icons`);
    return null;
  }

  const Icon = MdIcons[iconName as keyof typeof MdIcons] as IconComponent;

  if (!Icon) {
    console.error(`Icon ${iconName} not found in Material Design icons`);
    return null;
  }

  return <Icon size={size} color={color} className={className} />;
};

export default DynamicIcon;
