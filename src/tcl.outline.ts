import * as vscode from 'vscode';

export function exec(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: "file", language: "tcl" }, new DocumentSymbolProvider()));
}

class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	public provideDocumentSymbols(
		document: vscode.TextDocument,
		token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
			return new Promise((resolve, reject) => {
				let symbols: vscode.DocumentSymbol[] = [];
				let nodes = [symbols];
				let marker_symbol: vscode.DocumentSymbol | undefined;

				for (let i = 0; i < document.lineCount; i++) {
					let line = document.lineAt(i);
					let tokens = line.text.replace(/[[{()]/, ' ').split(' ');

					if (line.text.match(/^\s*set\s+\w+/)) {
						marker_symbol = new vscode.DocumentSymbol(
							tokens[1] + ' ',
							'',
							vscode.SymbolKind.Variable,
							line.range, line.range);
						nodes[nodes.length - 1].push(marker_symbol);
					}
					else if (line.text.match(/^\s*list\s+\w+/)) {
						marker_symbol = new vscode.DocumentSymbol(
							tokens[1] + ' ',
							'',
							vscode.SymbolKind.Array,
							line.range, line.range);
						nodes[nodes.length - 1].push(marker_symbol);
					}
					else if (line.text.match(/^\s*dict\s+\w+/)) {
						marker_symbol = new vscode.DocumentSymbol(
							tokens[2] + ' ',
							'',
							vscode.SymbolKind.Field,
							line.range, line.range);
						nodes[nodes.length - 1].push(marker_symbol);
					}
					else if (line.text.match(/^\s*namespace\s+\w+\s+\w+/)) {
						marker_symbol = new vscode.DocumentSymbol(
							tokens[2] + ' ',
							'',
							vscode.SymbolKind.Namespace,
							line.range, line.range);
						nodes[nodes.length - 1].push(marker_symbol);
					}
					else if (line.text.match(/^\s*proc\s+\w+/)) {
						marker_symbol = new vscode.DocumentSymbol(
							tokens[1] + ' ',
							'',
							vscode.SymbolKind.Function,
							line.range, line.range);
						nodes[nodes.length - 1].push(marker_symbol);
					}

					if (marker_symbol == undefined) continue;
					if (line.text.indexOf('{') < line.text.indexOf('}')) continue;
					
					if (line.text.match(/{/)) {
						nodes.push(marker_symbol.children);
					}
				}
				resolve(symbols);
			}
		);
	}
}
