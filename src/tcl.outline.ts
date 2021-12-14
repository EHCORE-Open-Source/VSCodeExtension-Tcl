import * as vscode from 'vscode';

export function exec(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: "file", language: "tcl" }, new DocumentSymbolProvider()));
}

class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	private format(cmd: string): string {
		return cmd.toLowerCase().replace(/^\w/, c => c.toUpperCase())
	}
	public provideDocumentSymbols(
		document: vscode.TextDocument,
		token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
		return new Promise((resolve, reject) => {
			let symbols: vscode.DocumentSymbol[] = [];
			let nodes = [symbols]
			let inside_marker = false
			let symbolkind_marker = vscode.SymbolKind.Field

			for (var i = 0; i < document.lineCount; i++) {
				var line = document.lineAt(i);
				let tokens = line.text.split(" ")

				if (line.text.match(/^p/)) {
					let marker_symbol = new vscode.DocumentSymbol(
						this.format(tokens[0]) + " " + tokens[1],
						'Keywords',
						symbolkind_marker,
						line.range, line.range)
					nodes[nodes.length - 1].push(marker_symbol)
					if (!inside_marker) {
						nodes.push(marker_symbol.children)
						inside_marker = true
					}
				}
			}
			resolve(symbols);
		});
	}
}
