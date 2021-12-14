import * as vscode from 'vscode';
import * as tcl_semantic from './tcl.semantic';
import * as tcl_completion from './tcl.completion';
import * as tcl_outline from './tcl.outline';

export function activate(context: vscode.ExtensionContext) {
	tcl_semantic.exec(context);
	tcl_completion.exec(context);
	tcl_outline.exec(context);
}
