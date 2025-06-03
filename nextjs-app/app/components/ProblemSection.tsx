import React from 'react';
import * as LucideIcons from 'lucide-react';
import styles from './ProblemSection.module.css';

// Custom Button component
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'default',
}) => {
  const baseClasses =
    'inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses =
    variant === 'outline'
      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
      : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900';

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};

interface ListItem {
  icon: string;
  text: string;
}

interface Column {
  title: string;
  backgroundColor: string;
  items: ListItem[];
  button?: {
    label: string;
    url: string;
    icon?: string;
  };
}

interface ProblemSectionProps {
  block: {
    columns: Column[];
  };
}

// Helper to get Lucide icon component
const getLucideIcon = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.HelpCircle; // Fallback icon
};

export default function ProblemSection({ block }: ProblemSectionProps) {
  const { columns } = block;

  if (!columns || columns.length !== 2) {
    return null;
  }

  return (
    <section className="py-12 px-4 w-full">
      <div className="mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="grid gap-6 md:grid-cols-2">
          {columns.map((column, index) => {
            const ButtonIcon = column.button?.icon ? getLucideIcon(column.button.icon) : null;

            return (
              <div
                key={index}
                className="rounded-3xl p-10 lg:p-12"
                style={{ backgroundColor: column.backgroundColor }}
              >
                {/* Column Title */}
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                  {column.title}
                </h2>

                {/* List Items */}
                <div className="space-y-6 mb-8">
                  {column.items.map((item, itemIndex) => {
                    const ItemIcon = getLucideIcon(item.icon);

                    return (
                      <div key={itemIndex} className="flex items-start gap-4">
                        {/* Icon Container */}
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <ItemIcon className="w-6 h-6 text-gray-700" />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 pt-1">
                          <p className="text-gray-900 leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CTA Button */}
                {column.button && column.button.label && column.button.url && (
                  <div className="mt-8">
                    <Button
                      variant="default"
                      onClick={() => window.open(column.button!.url, '_blank')}
                      className={`${styles.gpBtn} !bg-gray-900 !text-white hover:!bg-gray-800`}
                    >
                      {ButtonIcon && <ButtonIcon className="mr-2 h-4 w-4" />}
                      {column.button.label}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
