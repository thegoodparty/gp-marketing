import { urlForImage } from '@/sanity/lib/utils';
import CustomPortableText from '@/app/components/PortableText';
import ResolvedLink from '@/app/components/ResolvedLink';
import Image from 'next/image';

interface HeroCta {
  label: string;
  url: string;
}

interface PageHeroProps {
  block: {
    color: 'dark' | 'light';
    backgroundImage?: any;
    mainImage?: any;
    heading: string;
    subheading?: any;
    mainCta?: HeroCta;
    secondaryCta?: HeroCta;
  };
}

export default function PageHero({ block }: PageHeroProps) {
  const isDark = block.color === 'dark';
  const bgImageUrl = block.backgroundImage ? urlForImage(block.backgroundImage)?.url() : undefined;
  const mainImageUrl = block.mainImage ? urlForImage(block.mainImage)?.url() : undefined;

  return (
    <section
      className={`relative w-full overflow-hidden ${
        isDark ? 'bg-[#10182B] text-white' : 'bg-[#FFFBEF] text-[#10182B]'
      }`}
      style={
        bgImageUrl
          ? {
              backgroundImage: `url(${bgImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center py-12 md:py-24 px-4 md:px-12 gap-8 md:gap-16">
        {/* Left: Text & CTAs */}
        <div className="flex-1 flex flex-col items-start justify-center max-w-xl">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            {block.heading}
          </h1>
          {block.subheading && (
            <div className="mb-6 text-lg md:text-xl font-medium opacity-90">
              <CustomPortableText value={block.subheading} />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            {block.mainCta && block.mainCta.label && block.mainCta.url && (
              <ResolvedLink
                link={{ href: block.mainCta.url }}
                className={`rounded-full flex gap-2 items-center justify-center font-semibold py-3 px-6 text-lg transition-colors duration-200 w-full sm:w-auto ${
                  isDark
                    ? 'bg-[#FFD95A] text-[#10182B] hover:bg-[#FFC300]' // yellow on dark
                    : 'bg-[#FFD95A] text-[#10182B] hover:bg-[#FFC300]'
                }`}
              >
                {block.mainCta.label}
              </ResolvedLink>
            )}
            {block.secondaryCta && block.secondaryCta.label && block.secondaryCta.url && (
              <ResolvedLink
                link={{ href: block.secondaryCta.url }}
                className={`rounded-full flex gap-2 items-center justify-center font-semibold py-3 px-6 text-lg border transition-colors duration-200 w-full sm:w-auto ${
                  isDark
                    ? 'border-white text-white hover:bg-white hover:text-[#10182B]'
                    : 'border-[#10182B] text-[#10182B] hover:bg-[#10182B] hover:text-white'
                }`}
              >
                {block.secondaryCta.label}
              </ResolvedLink>
            )}
          </div>
        </div>
        {/* Right: Main Image - Only render if image exists and URL is valid */}
        {mainImageUrl && typeof mainImageUrl === 'string' && mainImageUrl.length > 0 && (
          <div className="flex-1 flex items-center justify-center mb-8 md:mb-0">
            <Image
              priority
              src={mainImageUrl}
              alt={block.heading}
              className="w-full object-contain"
              width={1000}
              height={1000}
            />
          </div>
        )}
      </div>
      {/* Optional overlay for dark mode background image */}
      {isDark && bgImageUrl && (
        <div className="absolute inset-0 bg-black opacity-40 pointer-events-none" />
      )}
    </section>
  );
}
