import { Erc20AssetInfo, GetAssetPriceInfoResponse } from "@funkit/api-base";
import { TOKEN_LIST } from "@/constants";
import { TokenType } from "@/types";

// New structured types
export type TokenState = {
  token: TokenType;
  tokenInfo: Erc20AssetInfo | null;
  priceInfo: GetAssetPriceInfoResponse | null;
  amount: number | null;
  loading: boolean;
};

type State = {
  usdAmount: string;
  source: TokenState;
  target: TokenState;
  swapRatio: number | null;
  error: string | null;
};

export const initialState: State = {
  usdAmount: "100",
  source: {
    token: TOKEN_LIST[0],
    tokenInfo: null,
    priceInfo: null,
    amount: null,
    loading: false,
  },
  target: {
    token: TOKEN_LIST[1],
    tokenInfo: null,
    priceInfo: null,
    amount: null,
    loading: false,
  },
  swapRatio: null,
  error: null,
};

export type Action =
  | { type: "SET_USD_AMOUNT"; payload: string }
  | { type: "SET_SOURCE_TOKEN"; payload: TokenType }
  | { type: "SET_TARGET_TOKEN"; payload: TokenType }
  | { type: "FETCH_SOURCE_START" }
  | {
      type: "FETCH_SOURCE_SUCCESS";
      payload: {
        tokenInfo: Erc20AssetInfo;
        priceInfo: GetAssetPriceInfoResponse;
      };
    }
  | { type: "FETCH_TARGET_START" }
  | {
      type: "FETCH_TARGET_SUCCESS";
      payload: {
        tokenInfo: Erc20AssetInfo;
        priceInfo: GetAssetPriceInfoResponse;
      };
    }
  | { type: "ERROR"; payload: string }
  | { type: "CLEAR_RESULT_AMOUNTS" };

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_USD_AMOUNT":
      return { ...state, usdAmount: action.payload };
    case "SET_SOURCE_TOKEN":
      return {
        ...state,
        source: { ...state.source, token: action.payload },
      };
    case "SET_TARGET_TOKEN":
      return {
        ...state,
        target: { ...state.target, token: action.payload },
      };

    case "FETCH_SOURCE_START":
      return {
        ...state,
        source: { ...state.source, loading: true },
        error: null,
      };

    case "FETCH_SOURCE_SUCCESS":
      const usdValueSource = parseFloat(state.usdAmount) || 0;
      const newSourceAmount =
        usdValueSource / action.payload.priceInfo.unitPrice;
      const newSwapRatio = state.target.priceInfo
        ? action.payload.priceInfo.unitPrice / state.target.priceInfo.unitPrice
        : null;

      return {
        ...state,
        source: {
          ...state.source,
          tokenInfo: action.payload.tokenInfo,
          priceInfo: action.payload.priceInfo,
          amount: newSourceAmount,
          loading: false,
        },
        swapRatio: newSwapRatio,
        error: null,
      };

    case "FETCH_TARGET_START":
      return {
        ...state,
        target: { ...state.target, loading: true },
        error: null,
      };

    case "FETCH_TARGET_SUCCESS":
      const usdValueTarget = parseFloat(state.usdAmount) || 0;
      const newTargetAmount =
        usdValueTarget / action.payload.priceInfo.unitPrice;
      const newSwapRatioTarget = state.source.priceInfo
        ? state.source.priceInfo.unitPrice / action.payload.priceInfo.unitPrice
        : null;

      return {
        ...state,
        target: {
          ...state.target,
          tokenInfo: action.payload.tokenInfo,
          priceInfo: action.payload.priceInfo,
          amount: newTargetAmount,
          loading: false,
        },
        swapRatio: newSwapRatioTarget,
        error: null,
      };

    case "ERROR":
      return {
        ...state,
        source: { ...state.source, loading: false },
        target: { ...state.target, loading: false },
        error: action.payload,
      };

    case "CLEAR_RESULT_AMOUNTS":
      return {
        ...state,
        source: { ...state.source, amount: null },
        target: { ...state.target, amount: null },
      };

    default:
      return state;
  }
};
