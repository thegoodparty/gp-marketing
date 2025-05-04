import RightSideCTA from './RightSideCTA';
import RightSideSecondaryLink from './RightSideSecondaryLink';
import { Settings } from '@/app/types/navigation';

interface RightSideProps {
  settings: Settings;
}

export default function RightSide({ settings }: RightSideProps) {
  return (
    <div className="hidden lg:flex items-center gap-4">
      <RightSideSecondaryLink link={settings?.navigation?.rightSideSecondaryLink} />
      <RightSideCTA cta={settings?.navigation?.rightSideCTA} />
    </div>
  );
}
