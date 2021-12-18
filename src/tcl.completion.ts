import * as vscode from 'vscode';
import json from './tcl.8.6.json';
import json_ns = require("./tcl.8.6.namespace.json");

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
                    if (linePrefix.match(json.commands[i].name + json.trigger.trigger_word)) {
                        for (let j = 0; j < json.commands[i].items.length; j++) {
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
        json.trigger.trigger_word[json.trigger.trigger_word.length-1] // triggered whenever a ' ' is being typed
    );
    const provider3 = vscode.languages.registerCompletionItemProvider(
        { language: 'tcl' },
        {
            provideCompletionItems() {
                const settings: ICompletionItemContent[] = json_ns.commands;
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
    const provider4 = vscode.languages.registerCompletionItemProvider(
        { language: 'tcl' },
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const line = document.lineAt(position).text;
                const linePrefix = line.substr(0, position.character);
                let sections = linePrefix.trim().split(' ');
                for (let i = 0; i < json_ns.commands.length; i++) {
                    if (!json_ns.commands[i].hasOwnProperty('items')) continue;
                    if (linePrefix.match(json_ns.commands[i].name) && sections.length == 1) {
                        for (let j = 0; j < json_ns.commands[i].items.length; j++) {
                            const settings: ICompletionItemContent[] = json_ns.commands[i].items;
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
        ' ' // triggered whenever a ' ' is being typed
    );
    context.subscriptions.push(provider1, provider2, provider3, provider4);
}