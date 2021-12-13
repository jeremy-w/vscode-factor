import {
  CancellationToken,
  Hover,
  HoverProvider,
  Position,
  ProviderResult,
  TextDocument,
} from 'vscode'
import { run } from './FuelListener'

const factorWordRegex = /\S+/

export default class FactorHoverProvider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
  ): ProviderResult<Hover> {
    // Need to look up the definition in the context of the vocab and its usings.
    // A FIXME to updating the usings if it's outside the current ones would be great.
    const wordRange = document.getWordRangeAtPosition(position, factorWordRegex)
    if (!wordRange) {
      return
    }

    const word = document.getText(wordRange)
    const result = run(
      `USING: fuel io ; "${word}" fuel-word-synopsis write`,
    ).then((str) => {
      if (str) {
        return new Hover(str, wordRange)
      }
    })
    return result
  }
}
