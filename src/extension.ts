import * as vscode from 'vscode';
import * as tcl from './tcl.completion';

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

const legend = (function () {
	const tokenTypesLegend = [
		'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
		'type', 'struct', 'class', 'interface', 'enum', 'typeParameter', 'function',
		'method', 'macro', 'variable', 'parameter', 'property', 'label'
	];
	tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

	const tokenModifiersLegend = [
		'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
		'modification', 'async'
	];
	tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: 'tcl'}, new DocumentSemanticTokensProvider(), legend));
	tcl.completion(context);
	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: "file", language: "tcl" }, new DocumentSymbolProvider()));
}

interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
	async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
		const allTokens = this._parseText(document.getText());
		const builder = new vscode.SemanticTokensBuilder();
		allTokens.forEach((token) => {
			builder.push(token.line, token.startCharacter, token.length, this._encodeTokenType(token.tokenType), this._encodeTokenModifiers(token.tokenModifiers));
		});
		return builder.build();
	}

	private _encodeTokenType(tokenType: string): number {
		if (tokenTypes.has(tokenType)) {
			return tokenTypes.get(tokenType)!;
		} else if (tokenType === 'notInLegend') {
			return tokenTypes.size + 2;
		}
		return 0;
	}

	private _encodeTokenModifiers(strTokenModifiers: string[]): number {
		let result = 0;
		for (let i = 0; i < strTokenModifiers.length; i++) {
			const tokenModifier = strTokenModifiers[i];
			if (tokenModifiers.has(tokenModifier)) {
				result = result | (1 << tokenModifiers.get(tokenModifier)!);
			} else if (tokenModifier === 'notInLegend') {
				result = result | (1 << tokenModifiers.size + 2);
			}
		}
		return result;
	}

	private _parseText(text: string): IParsedToken[] {
		const r: IParsedToken[] = [];
		const lines = text.split(/\r\n|\r|\n/);
		const regex_if: RegExp = /^(\s*if\s+0\s+{\s*)/g;
		const regex: RegExp = /^(\s*proc\s+#\s+args\s+{\s*})/gi;
		//const regex_semi: RegExp = /^(\s*proc\s+#\s+args\s+{\s*})/gi;
		const regex_comment_proc: RegExp = /^(\s*{#}\s*{)/gi;	
		const regex_comment_proc_semi: RegExp = /^(\s*{#}\s*\w)/gi;
		let comment_proc_mark = false;
		let comment_proc = false;	
		let comment_mark = false;
		let comment_proc_semi = false;
		let comment_proc_mark_semi = false;

		//for if 0
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			let closeOffset = -1;
			let openOffset = -1;
			
			if(comment_mark) {
				openOffset = -1;
				closeOffset = line.indexOf('}');
				if (closeOffset === -1) {
					closeOffset = line.length;
				}
				else {
					comment_mark = false;
				}
			}
			else {
				const matchObj = line.match(regex_if);
				if(matchObj === null)
				{
					continue;
				}
				openOffset = matchObj[0].length - 1;
				closeOffset = line.indexOf('}', openOffset);
				if (closeOffset === -1) {
					closeOffset = line.length;
					comment_mark = true;
				}
			}

			const tokenData = this._parseTextToken(line.substring(openOffset + 1, closeOffset));
			r.push({
				line: i,
				startCharacter: openOffset + 1,
				length: closeOffset - openOffset - 1,
				tokenType: tokenData.tokenType,
				tokenModifiers: tokenData.tokenModifiers
			});
		}
		//return r;
		//for proc {#} {}
        for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			let closeOffset = -1;
			let openOffset = -1;

			if(!comment_proc) {
				const matchObj = line.match(regex);
				if(matchObj === null)
				{
					continue;
				}
				comment_proc = true;
				continue;
				// openOffset += matchObj[0].length;
				// //closeOffset = line.indexOf('}', openOffset);
				// closeOffset = line.indexOf('}', openOffset);
				// if (closeOffset === -1) {
				// 	closeOffset = line.length;
				// 	comment_mark = true;
				// }
			}
			else {
				if(!comment_proc_mark) {
					const matchObj = line.match(regex_comment_proc);
					if(matchObj === null)
					{
						continue;
					}
					openOffset += matchObj[0].length;
					comment_proc_mark = true;
				}

				closeOffset = line.indexOf('}', openOffset);
				if (closeOffset === -1) {
					closeOffset = line.length;
				}
				else {
					comment_proc_mark = false;
				}
			}

			const tokenData = this._parseTextToken(line.substring(openOffset + 1, closeOffset));
			r.push({
				line: i,
				startCharacter: openOffset + 1,
				length: closeOffset - openOffset - 1,
				tokenType: tokenData.tokenType,
				tokenModifiers: tokenData.tokenModifiers
			});
		}

		    //for proc {#} ;
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				let closeOffset = -1;
				let openOffset = -1;
	
				if(!comment_proc_semi) {
					const matchObj = line.match(regex);
					if(matchObj === null)
					{
						continue;
					}
					comment_proc_semi = true;
					continue;
					// openOffset += matchObj[0].length;
					// //closeOffset = line.indexOf('}', openOffset);
					// closeOffset = line.indexOf('}', openOffset);
					// if (closeOffset === -1) {
					// 	closeOffset = line.length;
					// 	comment_mark = true;
					// }
				}
				else {
					if(!comment_proc_mark_semi) {
						const matchObj = line.match(regex_comment_proc_semi);
						if(matchObj === null )
						{
							continue;
						}
						openOffset += matchObj[0].length - 1;
						comment_proc_mark_semi = true;
					}
	
					closeOffset = line.indexOf(';', openOffset);
					if (closeOffset === -1) {
						closeOffset = line.length;
					}
					else {
						comment_proc_mark_semi = false;
					}
				}

			const tokenData = this._parseTextToken(line.substring(openOffset + 1, closeOffset));
			r.push({
				line: i,
				startCharacter: openOffset + 1,
				length: closeOffset - openOffset - 1,
				tokenType: tokenData.tokenType,
				tokenModifiers: tokenData.tokenModifiers
			});
		}

		return r;

	}

	private _parseTextToken(text: string): { tokenType: string; tokenModifiers: string[]; } {
		const parts = text.split('.');
		return {
			tokenType: parts[0],
			tokenModifiers: parts.slice(1)
		};
	}
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
			//let symbolkind_marker = vscode.SymbolKind.Field
			let symbolkind_marker = vscode.SymbolKind.Namespace

			for (var i = 0; i < document.lineCount; i++) {
				var line = document.lineAt(i);
				let tokens = line.text.split(" ")

				if (line.text.match(/namespace/)) {
					let marker_symbol = new vscode.DocumentSymbol(
						this.format(tokens[2]),
						this.format(tokens[1]),
						symbolkind_marker,
						line.range, line.range)
					nodes[nodes.length - 1].push(marker_symbol)
					// if (!inside_marker) {
					// 	nodes.push(marker_symbol.children)
					// 	inside_marker = true
					// }
				}
			}
			resolve(symbols);
		});
	}
}

