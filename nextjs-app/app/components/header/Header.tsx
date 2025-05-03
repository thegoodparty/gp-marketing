import HeaderLogo from "./HeaderLogo";

export default function Header({ settings }: { settings: any }) {
  return (
    <>
      <header className="fixed w-screen h-14 z-50">
        <div className="relative bg-white lg:block  px-5 lg:px-8 z-50 h-14">
          <div
            className="flex justify-between items-center h-14"
            data-testid="navbar"
          >
            <div className="flex items-center">
              <HeaderLogo logo={settings?.logo} />
              {/* <LeftSide /> */}
            </div>
            {/* <RightSide /> */}
          </div>
        </div>
      </header>
      {/* <RightSideMobile /> */}
      <div className="h-14 relative">&nbsp;</div>
    </>
  );
}
