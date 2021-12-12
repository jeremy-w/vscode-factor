import {
  CancellationToken,
  Hover,
  HoverProvider,
  Position,
  ProviderResult,
  TextDocument,
} from 'vscode'

export default class FactorHoverProvider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
  ): ProviderResult<Hover> {
    console.log('hover!', document, position, token)
    const placeholder = new Hover(
      'One day, this will tell you something useful.',
    )
    return placeholder
  }
}
