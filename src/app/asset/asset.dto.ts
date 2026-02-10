import { AssetProvider } from '~/generated/prisma/enums';

export class AssetDto {
  url: string;
  key: string;
  provider: AssetProvider;
}
