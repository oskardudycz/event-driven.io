export type ImageData = {
  layout: 'fixed' | 'fullWidth' | 'constrained';
  width: number;
  height: number;
  backgroundColor?: string;
  images: {
    fallback?: { src: string; srcSet?: string; sizes?: string };
    sources?: { type: string; srcSet: string; sizes?: string }[];
  };
  placeholder?: { fallback?: string };
};
