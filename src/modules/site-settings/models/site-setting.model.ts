export interface SiteSetting {
  id: string;
  tenantId: string;
  slug: string;
  siteTitle: string;
  siteDescription: string;
  heroSectionTitle: string;
  aboutUsContent: string;
  contactUsTitle: string;
  contactUsContent: string;
  heroSectionSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  address: string;
  customerServed: number;
  yearsOfExperience: number;
  totalGuides: number;
  totalDestinations: number;
  updatedAt: Date;
}

export interface UpdateSiteSettingInput {
  siteTitle?: string;
  siteDescription?: string;
  heroSectionTitle?: string;
  aboutUsContent?: string;
  contactUsTitle?: string;
  contactUsContent?: string;
  heroSectionSubtitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  address?: string;
  customerServed?: number;
  yearsOfExperience?: number;
  totalGuides?: number;
  totalDestinations?: number;
}
