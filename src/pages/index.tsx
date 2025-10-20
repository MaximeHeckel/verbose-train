import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";

import styles from "@/styles/Home.module.css";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import { IconSwap } from "@/components/Icons";
import { USDInput } from "@/components/USDInput";
import { TokenRow } from "@/components/TokenRow";
import debounce from "lodash/debounce";
import Card from "@/components/Card";
import { initialState, reducer } from "@/state";
import { getTokenData } from "@/api";
import { TokenType } from "@/types";

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

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchSourceToken = useCallback(async (token: TokenType) => {
    dispatch({ type: "FETCH_SOURCE_START" });

    try {
      const { tokenInfo, priceInfo } = await getTokenData(token);

      dispatch({
        type: "FETCH_SOURCE_SUCCESS",
        payload: {
          tokenInfo,
          priceInfo,
        },
      });
    } catch (error) {
      dispatch({
        type: "ERROR",
        payload: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }, []);

  const fetchTargetToken = useCallback(async (token: TokenType) => {
    dispatch({ type: "FETCH_TARGET_START" });

    try {
      const { tokenInfo, priceInfo } = await getTokenData(token);

      dispatch({
        type: "FETCH_TARGET_SUCCESS",
        payload: {
          tokenInfo,
          priceInfo,
        },
      });
    } catch (error) {
      dispatch({
        type: "ERROR",
        payload: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }, []);

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

  const debouncedFetchBothTokens = useMemo(
    () =>
      debounce((sourceToken: TokenType, targetToken: TokenType) => {
        fetchSourceToken(sourceToken);
        fetchTargetToken(targetToken);
      }, 400),
    [fetchSourceToken, fetchTargetToken]
  );

  const handleUsdAmountChange = useCallback(
    (value: string) => {
      dispatch({ type: "SET_USD_AMOUNT", payload: value });

      if (parseFloat(value) === 0) {
        return;
      }

      debouncedFetchBothTokens(state.source.token, state.target.token);
    },
    [debouncedFetchBothTokens, state.source?.token, state.target?.token]
  );

  useEffect(() => {
    fetchSourceToken(initialState.source.token);
    fetchTargetToken(initialState.target.token);
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
          <Card title="Token Price Explorer">
            <USDInput
              value={state.usdAmount}
              onChange={handleUsdAmountChange}
            />
            <TokenRow
              ariaLabel="Source token"
              placeholder="Source token"
              selectedToken={state.source.token}
              tokenAmount={state.source.amount}
              unitPrice={state.source.priceInfo?.unitPrice}
              isLoading={state.source.loading}
              onTokenChange={handleSourceTokenChange}
            />
            <div className={styles.separator}>
              <div className={styles.separatorIcon}>
                <IconSwap />
              </div>
            </div>
            <TokenRow
              ariaLabel="Target token"
              placeholder="Target token"
              selectedToken={state.target.token}
              tokenAmount={state.target.amount}
              unitPrice={state.target.priceInfo?.unitPrice}
              isLoading={state.target.loading}
              onTokenChange={handleTargetTokenChange}
            />
          </Card>
          {state.error && <p className={styles.error}>{state.error}</p>}
        </main>
      </div>
    </>
  );
}
