import * as vscode from 'vscode';
import json from './tcl.8.6.json';
interface ICompletionItemContent {
    name: string;
}
export function completion(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider(
        { language: 'tcl' },
        {
            provideCompletionItems() {
                const settings: ICompletionItemContent[] = json.commands;
                const settingsCompletion: vscode.CompletionItem[] = [];
                for (let index = 0; index < settings.length; index++) {
                    let settingCompletionItem = new vscode.CompletionItem(settings[index].name);
                    settingCompletionItem.kind = vscode.CompletionItemKind.Function;
                    settingsCompletion.push(settingCompletionItem);
                }
                return settingsCompletion;
            }
        },
    );
    context.subscriptions.push(provider);
}