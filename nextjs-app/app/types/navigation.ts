export interface NavigationLink {
  title: string;
  icon: string;
  type: 'internal' | 'external';
  page?: {
    _type: 'reference';
    _ref: string;
    slug: string;
  };
  url?: string;
}

export interface NavigationCategory {
  _type: 'category';
  _key: string;
  title: string;
  links: NavigationLink[];
}

export interface NavigationSingleLink {
  _type: 'link';
  _key: string;
  title: string;
  icon?: string;
  type: 'internal' | 'external';
  page?: {
    _type: 'reference';
    _ref: string;
    slug: string;
  };
  url?: string;
}

export type NavigationItem = NavigationCategory | NavigationSingleLink;

export interface NavigationSettings {
  logo: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt: string;
  };
  items: NavigationItem[];
  rightSideCTA?: {
    title: string;
    url: string;
  };
  rightSideSecondaryLink?: {
    title: string;
    url: string;
  };
}

export interface Settings {
  navigation: NavigationSettings;
}
