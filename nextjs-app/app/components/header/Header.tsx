import HeaderLogo from './HeaderLogo';
import NavCategories from './NavCategories';
import RightSide from './RightSide';
import { Settings } from '@/app/types/navigation';
import MobileMenu from './MobileMenu';
interface HeaderProps {
  settings: Settings;
}

export default function Header({ settings }: HeaderProps) {
  return (
    <>
      <header className="fixed w-screen h-14 z-50">
        <div className="relative bg-white lg:block px-5 lg:px-8 z-50 h-14">
          <div
            className="flex justify-between items-center h-14"
            data-testid="navbar"
          >
            <div className="flex items-center">
              <HeaderLogo settings={settings} />
              <NavCategories settings={settings} />
            </div>
            <RightSide settings={settings} />
          </div>
        </div>
      </header>
      <MobileMenu settings={settings} />
      <div className="h-14 relative">&nbsp;</div>
    </>
  );
}
