import {
  getAssetErc20ByChainAndSymbol,
  getAssetPriceInfo,
} from "@funkit/api-base";
import { TokenType } from "./components/TokenSelect";

const API_KEY = process.env.NEXT_PUBLIC_FUNKIT_API_KEY as string;

if (!API_KEY) {
  throw new Error("NEXT_PUBLIC_FUNKIT_API_KEY is not set");
}

export const getTokenData = async (token: TokenType) => {
  try {
    const tokenInfo = await getAssetErc20ByChainAndSymbol({
      chainId: token.chainId,
      symbol: token.symbol,
      apiKey: API_KEY,
    });

    const priceInfo = await getAssetPriceInfo({
      chainId: token.chainId,
      assetTokenAddress: tokenInfo.address,
      apiKey: API_KEY,
    });

    return { tokenInfo, priceInfo };
  } catch (error) {
    throw error;
  }
};
