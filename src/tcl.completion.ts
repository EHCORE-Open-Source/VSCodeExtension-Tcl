import * as vscode from 'vscode';
import json from './tcl.8.6a.json';
export function completion(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider(
        { language: 'tcl' },
        {
            provideCompletionItems() {
                const settingsCompletion: vscode.CompletionItem[] = [];
                for (let index in json.commands) {
                    let settingCompletionItem = new vscode.CompletionItem(json.commands[index][0]);
                    settingCompletionItem.kind = vscode.CompletionItemKind.Function;
                    settingCompletionItem.documentation = new vscode.MarkdownString(json.commands[index][1]);
                    settingsCompletion.push(settingCompletionItem);
                }
                return settingsCompletion;
            }
        },
    );
    context.subscriptions.push(provider);
}