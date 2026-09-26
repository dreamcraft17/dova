export type PortalKind = 'admin' | 'supplier' | 'logistics';

export type Product = {
  name: string;
  category: string;
  price?: number;
  status: string;
};
