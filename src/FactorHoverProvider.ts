import {
  CancellationToken,
  Hover,
  HoverProvider,
  Position,
  ProviderResult,
  TextDocument,
} from 'vscode'

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
    const placeholder = new Hover(
      `One day, this will tell you something useful about \`${word}\`.`,
      wordRange,
    )
    return placeholder
  }
}
