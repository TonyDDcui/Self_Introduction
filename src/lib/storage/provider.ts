export type PutResult = { url: string; pathname: string };

export interface StorageProvider {
  putImage(params: {
    file: Blob;
    filename: string;
    contentType: string;
  }): Promise<PutResult>;

  delImage(pathname: string): Promise<void>;
}

