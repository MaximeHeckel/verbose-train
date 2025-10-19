import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import {
  Erc20AssetInfo,
  getAssetErc20ByChainAndSymbol,
  getAssetPriceInfo,
  GetAssetPriceInfoResponse,
} from "@funkit/api-base";
import styles from "@/styles/Home.module.css";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { TOKEN_LIST, TokenType } from "@/components/TokenSelect";
import { IconSwap } from "@/components/Icons";
import { USDInput } from "@/components/USDInput";
import { TokenRow } from "@/components/TokenRow";
import debounce from "lodash/debounce";
import Card from "@/components/Card";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * LEARNINGS
 *
 * Chain ID "1" refers to Ethereum Mainnet - the main Ethereum blockchain network. This is the production network where real ETH and tokens have actual value.
 * Other common chain IDs include:
 * "137" = Polygon
 * "56" = Binance Smart Chain (BSC)

 *
 * The assetTokenAddress is the smart contract address of a token on the blockchain.
 * It's a unique identifier (in Ethereum's case, a 42-character hexadecimal string starting with 0x)
 * that points to where the token's smart contract is deployed on the blockchain.
 */

const API_KEY = process.env.NEXT_PUBLIC_FUNKIT_API_KEY as string;

if (!API_KEY) {
  throw new Error("NEXT_PUBLIC_FUNKIT_API_KEY is not set");
}

type State = {
  usdAmount: string;
  sourceToken: TokenType;
  targetToken: TokenType;
  sourceTokenInfo: Erc20AssetInfo | null;
  targetTokenInfo: Erc20AssetInfo | null;
  sourcePriceInfo: GetAssetPriceInfoResponse | null;
  targetPriceInfo: GetAssetPriceInfoResponse | null;
  sourceTokenAmount: number | null;
  targetTokenAmount: number | null;
  swapRatio: number | null;
  sourceLoading: boolean;
  targetLoading: boolean;
  error: string | null;
};

const initialState: State = {
  usdAmount: "100",
  sourceToken: TOKEN_LIST[0],
  targetToken: TOKEN_LIST[1],
  sourceTokenInfo: null,
  targetTokenInfo: null,
  sourcePriceInfo: null,
  targetPriceInfo: null,
  sourceTokenAmount: null,
  targetTokenAmount: null,
  swapRatio: null,
  sourceLoading: false,
  targetLoading: false,
  error: null,
};

type Action =
  | { type: "SET_USD_AMOUNT"; payload: string }
  | { type: "SET_SOURCE_TOKEN"; payload: TokenType }
  | { type: "SET_TARGET_TOKEN"; payload: TokenType }
  | { type: "FETCH_BOTH_START" }
  | {
      type: "FETCH_BOTH_SUCCESS";
      payload: {
        sourceTokenInfo: Erc20AssetInfo;
        targetTokenInfo: Erc20AssetInfo;
        sourcePriceInfo: GetAssetPriceInfoResponse;
        targetPriceInfo: GetAssetPriceInfoResponse;
      };
    }
  | { type: "FETCH_SOURCE_START" }
  | {
      type: "FETCH_SOURCE_SUCCESS";
      payload: {
        sourceTokenInfo: Erc20AssetInfo;
        sourcePriceInfo: GetAssetPriceInfoResponse;
      };
    }
  | { type: "FETCH_TARGET_START" }
  | {
      type: "FETCH_TARGET_SUCCESS";
      payload: {
        targetTokenInfo: Erc20AssetInfo;
        targetPriceInfo: GetAssetPriceInfoResponse;
      };
    }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "CLEAR_RESULT_AMOUNTS" };

export default function Home() {
  const reducer = (state: State, action: Action) => {
    switch (action.type) {
      case "SET_USD_AMOUNT":
        return { ...state, usdAmount: action.payload };
      case "SET_SOURCE_TOKEN":
        return { ...state, sourceToken: action.payload };
      case "SET_TARGET_TOKEN":
        return { ...state, targetToken: action.payload };

      case "FETCH_BOTH_START":
        return {
          ...state,
          sourceLoading: true,
          targetLoading: true,
          error: null,
        };

      case "FETCH_BOTH_SUCCESS":
        const usdValue = parseFloat(state.usdAmount) || 0;
        const sourceTokenAmount =
          usdValue / action.payload.sourcePriceInfo.unitPrice;
        const targetTokenAmount =
          usdValue / action.payload.targetPriceInfo.unitPrice;
        const swapRatio =
          action.payload.sourcePriceInfo.unitPrice /
          action.payload.targetPriceInfo.unitPrice;

        return {
          ...state,
          sourceTokenInfo: action.payload.sourceTokenInfo,
          targetTokenInfo: action.payload.targetTokenInfo,
          sourcePriceInfo: action.payload.sourcePriceInfo,
          targetPriceInfo: action.payload.targetPriceInfo,
          sourceTokenAmount,
          targetTokenAmount,
          swapRatio,
          sourceLoading: false,
          targetLoading: false,
          error: null,
        };

      case "FETCH_SOURCE_START":
        return { ...state, sourceLoading: true, error: null };

      case "FETCH_SOURCE_SUCCESS":
        const usdValueSource = parseFloat(state.usdAmount) || 0;
        const newSourceTokenAmount =
          usdValueSource / action.payload.sourcePriceInfo.unitPrice;
        const newSwapRatio = state.targetPriceInfo
          ? action.payload.sourcePriceInfo.unitPrice /
            state.targetPriceInfo.unitPrice
          : null;

        return {
          ...state,
          sourceTokenInfo: action.payload.sourceTokenInfo,
          sourcePriceInfo: action.payload.sourcePriceInfo,
          sourceTokenAmount: newSourceTokenAmount,
          swapRatio: newSwapRatio,
          sourceLoading: false,
          error: null,
        };

      case "FETCH_TARGET_START":
        return { ...state, targetLoading: true, error: null };

      case "FETCH_TARGET_SUCCESS":
        const usdValueTarget = parseFloat(state.usdAmount) || 0;
        const newTargetTokenAmount =
          usdValueTarget / action.payload.targetPriceInfo.unitPrice;
        const newSwapRatioTarget = state.sourcePriceInfo
          ? state.sourcePriceInfo.unitPrice /
            action.payload.targetPriceInfo.unitPrice
          : null;

        return {
          ...state,
          targetTokenInfo: action.payload.targetTokenInfo,
          targetPriceInfo: action.payload.targetPriceInfo,
          targetTokenAmount: newTargetTokenAmount,
          swapRatio: newSwapRatioTarget,
          targetLoading: false,
          error: null,
        };

      case "FETCH_ERROR":
        return {
          ...state,
          sourceLoading: false,
          targetLoading: false,
          error: action.payload,
        };

      case "CLEAR_RESULT_AMOUNTS":
        return {
          ...state,
          sourceTokenAmount: null,
          targetTokenAmount: null,
        };

      default:
        return state;
    }
  };

  /**
   * TODO:
   * - better select
   * - better loading state UI
   * - error handling UI
   *
   */

  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchSourceToken = useCallback(async (token: TokenType) => {
    dispatch({ type: "FETCH_SOURCE_START" });

    try {
      const sourceTokenInfo = await getAssetErc20ByChainAndSymbol({
        chainId: token.chainId,
        symbol: token.symbol,
        apiKey: API_KEY,
      });

      const sourcePriceInfo = await getAssetPriceInfo({
        chainId: token.chainId,
        assetTokenAddress: sourceTokenInfo.address,
        apiKey: API_KEY,
      });

      dispatch({
        type: "FETCH_SOURCE_SUCCESS",
        payload: {
          sourceTokenInfo,
          sourcePriceInfo,
        },
      });
    } catch (error) {
      dispatch({
        type: "FETCH_ERROR",
        payload: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }, []);

  const fetchTargetToken = useCallback(async (token: TokenType) => {
    dispatch({ type: "FETCH_TARGET_START" });

    try {
      const targetTokenInfo = await getAssetErc20ByChainAndSymbol({
        chainId: token.chainId,
        symbol: token.symbol,
        apiKey: API_KEY,
      });

      const targetPriceInfo = await getAssetPriceInfo({
        chainId: token.chainId,
        assetTokenAddress: targetTokenInfo.address,
        apiKey: API_KEY,
      });

      dispatch({
        type: "FETCH_TARGET_SUCCESS",
        payload: {
          targetTokenInfo,
          targetPriceInfo,
        },
      });
    } catch (error) {
      dispatch({
        type: "FETCH_ERROR",
        payload: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }, []);

  // Create a single debounced function that fetches both tokens
  const debouncedFetchBothTokens = useMemo(
    () =>
      debounce((sourceToken: TokenType, targetToken: TokenType) => {
        fetchSourceToken(sourceToken);
        fetchTargetToken(targetToken);
      }, 320),
    [fetchSourceToken, fetchTargetToken]
  );

  const handleSourceTokenChange = useCallback(
    (token: TokenType) => {
      dispatch({ type: "SET_SOURCE_TOKEN", payload: token });
      fetchSourceToken(token);
    },
    [fetchSourceToken]
  );

  const handleTargetTokenChange = useCallback(
    (token: TokenType) => {
      dispatch({ type: "SET_TARGET_TOKEN", payload: token });
      fetchTargetToken(token);
    },
    [fetchTargetToken]
  );

  const handleUsdAmountChange = useCallback(
    (value: string) => {
      dispatch({ type: "SET_USD_AMOUNT", payload: value });
      debouncedFetchBothTokens(state.sourceToken, state.targetToken);
    },
    [debouncedFetchBothTokens, state.sourceToken, state.targetToken]
  );

  useEffect(() => {
    fetchSourceToken(initialState.sourceToken);
    fetchTargetToken(initialState.targetToken);
  }, [fetchSourceToken, fetchTargetToken]);

  return (
    <>
      <Head>
        <title>USD to Token Swap Explorer</title>
        <meta
          name="description"
          content="Explore token swap equivalents in USD"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.main}>
          <Card>
            <USDInput
              value={state.usdAmount}
              onChange={handleUsdAmountChange}
            />
            <TokenRow
              selectedToken={state.sourceToken}
              tokenAmount={state.sourceTokenAmount}
              unitPrice={state.sourcePriceInfo?.unitPrice}
              isLoading={state.sourceLoading}
              usdAmount={state.usdAmount}
              onTokenChange={handleSourceTokenChange}
              ariaLabel="Source token"
              placeholder="Source token"
            />
            <div className={styles.separator}>
              <div className={styles.separatorIcon}>
                <IconSwap />
              </div>
            </div>
            <TokenRow
              selectedToken={state.targetToken}
              tokenAmount={state.targetTokenAmount}
              unitPrice={state.targetPriceInfo?.unitPrice}
              isLoading={state.targetLoading}
              usdAmount={state.usdAmount}
              onTokenChange={handleTargetTokenChange}
              ariaLabel="Target token"
              placeholder="Target token"
            />
          </Card>
        </main>
      </div>
    </>
  );
}
