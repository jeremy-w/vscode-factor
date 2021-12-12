import {
  CancellationToken,
  Hover,
  HoverProvider,
  Position,
  ProviderResult,
  TextDocument,
} from "vscode";

export default class FactorHoverProvider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): ProviderResult<Hover> {
    throw new Error("Method not implemented.");
  }
}
