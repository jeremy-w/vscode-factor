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

    const usings = 'fuel io'.split(' ')
    const text = document.getText()
    // We rely on convention here in hopes of avoiding matching within a string.
    const r = /^USING:[^;]+;/gm
    let match
    while ((match = r.exec(text)) !== null) {
      const vocabs = match[0]
        .split(' ')
        .filter((it) => it !== 'USING:' && it !== ';')
      usings.push(...vocabs)
    }

    const within = /^IN: ([^\s]+)/m.exec(text)?.[1] ?? 'fuel'
    usings.push(within)
    // XXX: might need to handle within.private if it exists

    // This takes a noticeable amount of time when there are many or large vocabs, but managing a persistent listener would be more challenging.
    const result = run(
      `USING: ${usings.join(
        ' ',
      )} ; IN: ${within} "${word}" fuel-word-synopsis write`,
    ).then((str) => {
      if (str) {
        return new Hover(str, wordRange)
      }
    })
    return result
  }
}
