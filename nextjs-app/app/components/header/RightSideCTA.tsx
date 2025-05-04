import Button from '../../shared/buttons/Button';

interface RightSideCTAProps {
  cta?: {
    title: string;
    url: string;
  };
}

export default function RightSideCTA({ cta }: RightSideCTAProps) {
  if (!cta) return null;

  return (
    <Button href={cta.url} target="_blank" color="secondary" className="font-semibold">
      {cta.title}
    </Button>
  );
}
