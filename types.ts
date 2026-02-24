import React from 'react';

export interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
  subItems?: NavItem[];
}

export interface SplashConfig {
  backgroundColor: string;
  logoUrl: string;
  duration: number;
  tagline: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  icon?: string;
  order: number;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
}

export interface Category {
  id: string;
  title: string;
  iconName: string;
  webIcon?: string;
  description: string;
  order: number;
  isActive: boolean;
  pagePlans?: PagePlan[];
}

export interface SubCategory {
  id: string;
  categoryId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  pageDesign?: string;
  order: number;
  isActive: boolean;
  pagePlans?: PagePlan[];
}

export interface PopularItem {
  id: string;
  title: string;
  imageUrl: string;
  address: string;
  rating: number;
  description: string;
  order: number;
  isActive: boolean;
}

export interface DashboardStat {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

/* --- DATABASE DEFINITION TYPES --- */
export type FieldType = 'text' | 'long-text' | 'number' | 'date' | 'time' | 'boolean';

export interface DbField {
  id: string;
  name: string; // Alan Adı (Görünen Ad)
  key: string;  // Database Adı (Sütun Adı)
  type: FieldType;
}

export interface DbDefinition {
  id: string;
  title: string;
  description: string;
  fields: DbField[];
}

/* --- PAGE DEFINITION TYPES (Maps to Database) --- */
export interface PageDefField {
  id: string;
  label: string; // Sayfa Tanımındaki Alan Adı
  dbFieldId: string; // Seçilen Database Alanının ID'si
}

export interface PageDefinition {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  dbId: string; // Bağlı olduğu Database Tanımı ID'si
  fields: PageDefField[];
}

/* --- PAGE PLANNER TYPES (Assignment) --- */
export interface PagePlan {
  id: string;
  categoryId: number;
  subCategoryId: number;
  pageDefinitionId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category; // Nested relation
  subCategory?: SubCategory; // Nested relation
}

/* --- PAGE CONTENT TYPES (Actual Data) --- */
export interface PageContent {
  id: string;
  categoryId: string;
  subCategoryId: string;
  pageDefinitionId: string;
  ownerId?: string; // ID of the User (Customer) assigned to this page
  status?: 'draft' | 'published'; // Content status
  data: Record<string, any>; // Key-Value pair based on DbField keys
  createdAt: string;
}

/* --- USER TYPES --- */
export interface UserRole {
  id: string;
  title: string;
  description: string;
  isSystem: boolean; // True if it's a default role like Admin, User
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
}

export interface Place {
  id: string;
  title: string;
  slug?: string;
  pic_url?: string;
  back_pic_url?: string;
  icon1?: string;
  title1?: string;
  info1?: string;
  icon2?: string;
  title2?: string;
  info2?: string;
  icon3?: string;
  title3?: string;
  info3?: string;
  icon4?: string;
  title4?: string;
  info4?: string;
  description?: string;
  rating?: number;
  order?: number;
  panel1_title?: string;
  panel1?: string;
  panel2_title?: string;
  panel2?: string;
  panel_col_title?: string;
  panel_col?: string;
  panel3_title?: string;
  panel3?: string;
  panel4_title?: string;
  panel4?: string;
  panel_col_title2?: string;
  panel_col2?: string;
  panel5_title?: string;
  area1?: string;
  area2?: string;
  area3?: string;
  area4?: string;
  area5?: string;
  area6?: string;
  area7?: string;
  area8?: string;
  area9?: string;
  area10?: string;
  source?: string;
  isActive: boolean;
  createdById?: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodPlace {
  id: number;
  title: string;
  subtitle?: string;
  mainColor?: string;
  imageUrl?: string;
  backImageUrl?: string;
  campaignUrl?: string;
  badge?: string;
  rating?: number;
  storyTitle?: string;
  frontContent?: string;
  backContent?: string;
  phone?: string;
  hoursMon?: string;
  hoursTue?: string;
  hoursWed?: string;
  hoursThu?: string;
  hoursFri?: string;
  hoursSat?: string;
  hoursSun?: string;
  menuItem1?: string;
  menuDesc1?: string;
  menuPrice1?: string;
  menuItem2?: string;
  menuDesc2?: string;
  menuPrice2?: string;
  menuItem3?: string;
  menuDesc3?: string;
  menuPrice3?: string;
  menuItem4?: string;
  menuDesc4?: string;
  menuPrice4?: string;
  menuItem5?: string;
  menuDesc5?: string;
  menuPrice5?: string;
  menuItem6?: string;
  menuDesc6?: string;
  menuPrice6?: string;
  menuItem7?: string;
  menuDesc7?: string;
  menuPrice7?: string;
  menuItem8?: string;
  menuDesc8?: string;
  menuPrice8?: string;
  menuItem9?: string;
  menuDesc9?: string;
  menuPrice9?: string;
  menuItem10?: string;
  menuDesc10?: string;
  menuPrice10?: string;
  features?: string;
  address?: string;
  website?: string;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
  isActive: boolean;
  subCategoryId: number;
  hoursEveryday?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageLink {
  id: number;
  title: string;
  description: string;
  slug: string;
  targetTable: string;
  createdAt: string;
  updatedAt: string;
}
