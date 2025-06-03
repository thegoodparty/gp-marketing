'use client';
import { useState } from 'react';
import Hamburger from 'hamburger-react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Settings } from '@/app/types/navigation';
import Link from 'next/link';
import Button from '@/app/shared/buttons/Button';
import MobileNavItems from './MobileNavItems';

interface MobileMenuProps {
  settings: Settings;
}

export default function MobileMenu({ settings }: MobileMenuProps) {
  const [isOpen, setOpen] = useState(false);
  const items = settings?.navigation?.items;
  if (!items) return null;

  const closeMenu = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <div
        className={`z-[1300] fixed top-1 right-0 flex items-center ${isOpen ? 'text-white' : ''}`}
      >
        <Hamburger
          toggled={isOpen}
          toggle={setOpen}
          hideOutline={false}
          rounded
          size={24}
        />
      </div>
      <SwipeableDrawer
        open={isOpen}
        onClose={closeMenu}
        anchor="right"
        onOpen={() => {}}
      >
        <div className="flex flex-col w-[270px] bg-primary-dark text-white h-screen relative">
          <div className="grow overflow-auto px-4 pt-24 pb-60">
            <MobileNavItems items={items} onClose={closeMenu} />
          </div>

          <div className="w-full h-auto sticky bottom-0">
            <div className="p-6 bg-primary-dark h-auto">
              <Link
                href="/login"
                onClick={closeMenu}
                className="block w-full text-white py-2 mb-2 text-center font-medium"
              >
                Login
              </Link>
              <Button
                href="/sign-up"
                onClick={closeMenu}
                size="large"
                color="success"
                className="w-full text-white text-center font-medium focus-visible:outline-white/40"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </SwipeableDrawer>
    </div>
  );
}
