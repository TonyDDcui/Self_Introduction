declare module "heic2any" {
  type Heic2AnyParams = {
    blob: Blob;
    toType?: string;
    quality?: number;
  };

  export default function heic2any(params: Heic2AnyParams): Promise<Blob | Blob[]>;
}

