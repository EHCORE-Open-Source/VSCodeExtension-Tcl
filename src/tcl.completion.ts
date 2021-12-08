import * as vscode from 'vscode';
//import json from './tcl.8.6.json';
const json = require("./tcl.8.6.json");
interface ICompletionItemContent {
    name: string;
}
export function completion(context: vscode.ExtensionContext) {
    const provider1 = vscode.languages.registerCompletionItemProvider(
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
    const provider2 = vscode.languages.registerCompletionItemProvider(
        { language: 'tcl' },
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const line = document.lineAt(position).text;
                const linePrefix = line.substr(0, position.character);
                for (let i = 0; i < json.commands.length; i++) {
                    if (!json.commands[i].hasOwnProperty('items')) continue;
                    if (linePrefix.match(json.commands[i].name)) {
                        for (var j = 0; j < json.commands[i].items.length; j++) {
                            const settings: ICompletionItemContent[] = json.commands[i].items;
                            const settingsCompletion: vscode.CompletionItem[] = [];
                            for (let index = 0; index < settings.length; index++) {
                                let settingCompletionItem = new vscode.CompletionItem(settings[index].name);
                                settingCompletionItem.kind = vscode.CompletionItemKind.Field;
                                settingsCompletion.push(settingCompletionItem);
                            }
                            return settingsCompletion;
                        }
                    }
                }
                return undefined;
            }
        },
        ':' // triggered whenever a ' ' is being typed
    );
    context.subscriptions.push(provider1, provider2);
}