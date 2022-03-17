import * as vscode from 'vscode';

const Type = "tclsh";

// vscode.TaskProvider 工作提供者允許將工作增加到工作服務。工作提供者通過 tasks.registerTaskProvider 註冊。
export class TclTaskProvider implements vscode.TaskProvider {
	static Type = 'tclsh';
	private tclPromise: Thenable<vscode.Task[]> | undefined = undefined;	

	// 提供工作	
	public provideTasks(): Thenable<vscode.Task[]> | undefined {		
		// 取得執行 rake 的結果
		this.tclPromise = getTclTasks();
		return this.tclPromise;
	}

	// 解決沒有 execution 集合的工作。
	// 工作通常是根據 tasks.json file 中的資訊建立的。此類工作缺少有關如何執行它們的訊息，
	// 並且工作提供者必須在 resolveTask 方法 中填寫缺少的訊息。
	// _task 要解決的工作。
	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		// TaskDefinition 中的 task
		const task = _task.definition.task;
		// 一個 Rake 工作由一個工作和一個在 TclTaskDefinition 中指定的可選文件組成
		// 通過檢查是否有工作來確保它看起來像一個 Rake 工作。		
		if (task) {
			// resolveTask 要求使用相同的定義物件。			
			const definition: TclTaskDefinition = <any>_task.definition;
			// 建立新的 task										
			return new vscode.Task(definition, _task.scope ?? vscode.TaskScope.Workspace, definition.fileName, Type, new vscode.ShellExecution(`tclsh ${definition.path}`));
		}
		return undefined;
	}
}

// 定義工作種類的結構，該值必須是 JSON 可字符串化的
interface TclTaskDefinition extends vscode.TaskDefinition {
	/**
	 * tcl file
	 */
	fileName: string;
	/**
	 * tcl file path
	 */
	path: string;
}

// 取得執行 tclsh 的結果
async function getTclTasks(): Promise<vscode.Task[]> {
	const result: vscode.Task[] = [];

	const textDocuments = vscode.workspace.textDocuments;

	// 查是否有打開的檔案，沒有則回傳 result
	if (textDocuments.length === 0) {
		return result;
	}

	// 取打開的檔案
	for (const textDocument of textDocuments) {
		// 檢查檔案，語言是 plaintext
		if (textDocument.languageId == 'tcl') {
			// 處理 windows 檔案名稱
			let fileName = textDocument.fileName.split('\\').pop();
			// 沒有 windows 檔案名稱，則處理 linux 檔案名稱
			fileName = fileName?fileName:textDocument.fileName.split('/').pop();
			// 在 package.json 的 taskDefinitions 底下 type 為 tclsh 時, task 屬性為必填
			const kind: TclTaskDefinition = {
				type: Type,
				fileName: fileName ? fileName : textDocument.fileName,
				path: textDocument.uri.fsPath
			};

			// 建立新的 task			
			const task = new vscode.Task(kind, vscode.TaskScope.Workspace, kind.fileName, Type, new vscode.ShellExecution(`tclsh ${kind.path}`));
			result.push(task);
			
			// 任務為 Build 群組
			task.group = vscode.TaskGroup.Build;
		}
	}
	return result;
}