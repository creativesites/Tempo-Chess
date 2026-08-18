import { useEffect } from 'react';
import { useStockfish } from '@udaychauhan/react-native-stockfish';

import { StockfishEngine } from './StockfishEngine';

/**
 * The npm package only exposes Stockfish through a React hook, so this
 * invisible component mounts it once at the app root and forwards
 * everything into the StockfishEngine singleton, which is what the rest
 * of the app (a plain NativeChessEngine implementation) actually talks
 * to. Native-only — see index.web.ts, which never imports this file.
 */
export function StockfishRuntime() {
  const { stockfishLoop, stopStockfish, sendCommandToStockfish } = useStockfish({
    onOutput: (line) => StockfishEngine.handleOutput(line),
    onError: (message) => StockfishEngine.handleError(message),
  });

  useEffect(() => {
    StockfishEngine.attachBridge({ stockfishLoop, stopStockfish, sendCommandToStockfish });
    return () => {
      StockfishEngine.detachBridge();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
