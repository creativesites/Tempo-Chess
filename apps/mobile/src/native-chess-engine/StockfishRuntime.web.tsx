/**
 * Web has no native Stockfish module to mount — this stub exists so the
 * root layout can unconditionally render <StockfishRuntime /> and
 * Metro's platform-specific resolution picks this file on web instead
 * of the real one, without ever touching the native-only import chain.
 */
export function StockfishRuntime() {
  return null;
}
