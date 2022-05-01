// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { connect, disconnect } from "./basicInput";
import { multiStepInput } from "./multiStepInput";
import { quickOpen } from "./quickOpen";

let myStatusBarItem: vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log("Atoll extension has been activitated.");

    const connectCommand = vscode.commands.registerCommand("atoll-extension.connect", async () => {
        await connect();
        // const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
        //     "Connect to Atoll Server": connect,
        //     // TODO: Only show this when connected
        //     "Disconnect from Atoll Server": disconnect //,
        //     // multiStepInput,
        //     // quickOpen
        // };
        // const quickPick = vscode.window.createQuickPick();
        // quickPick.items = Object.keys(options).map((label) => ({ label }));
        // quickPick.onDidChangeSelection((selection) => {
        //     if (selection[0]) {
        //         options[selection[0].label](context).catch(console.error);
        //     }
        // });
        // quickPick.onDidHide(() => quickPick.dispose());
        // quickPick.show();
    });
    context.subscriptions.push(connectCommand);

    const disconnectCommand = vscode.commands.registerCommand("atoll-extension.disconnect", async () => {
        await disconnect();
        // const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
        //     "Connect to Atoll Server": connect,
        //     // TODO: Only show this when connected
        //     "Disconnect from Atoll Server": disconnect //,
        //     // multiStepInput,
        //     // quickOpen
        // };
        // const quickPick = vscode.window.createQuickPick();
        // quickPick.items = Object.keys(options).map((label) => ({ label }));
        // quickPick.onDidChangeSelection((selection) => {
        //     if (selection[0]) {
        //         options[selection[0].label](context).catch(console.error);
        //     }
        // });
        // quickPick.onDidHide(() => quickPick.dispose());
        // quickPick.show();
    });
    context.subscriptions.push(disconnectCommand);

    // // The command has been defined in the package.json file
    // // Now provide the implementation of the command with registerCommand
    // // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand("atoll-extension.helloWorld", () => {
    //     // The code you place here will be executed every time your command is executed
    //     // Display a message box to the user
    //     vscode.window.showInformationMessage("Hello World from Atoll Extension!");
    // });

    // context.subscriptions.push(disposable);

    // const myCommandId = "atoll-extension.showSelectionCount";
    // let disposable2 = vscode.commands.registerCommand(myCommandId, () => {
    //     // const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
    //     // vscode.window.showInformationMessage(`Yeah, ${n} line(s) selected... Keep going!`);
    //     vscode.window.showInformationMessage(
    //         "gh-401: As a developer, I can use Atoll within VS Code, so that I can be more productive"
    //     );
    // });
    // context.subscriptions.push(disposable2);

    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000000);
    // myStatusBarItem.command = myCommandId;
    context.subscriptions.push(myStatusBarItem);

    // register some listener that make sure the status bar
    // item always up-to-date
    // context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
    // context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));

    // update status bar item once at start
    updateStatusBarItem();
}

// function getNumberOfSelectedLines(editor: vscode.TextEditor | undefined): number {
//     let lines = 0;
//     if (editor) {
//         lines = editor.selections.reduce((prev, curr) => prev + (curr.end.line - curr.start.line), 0);
//     }
//     return lines;
// }

// STORING SETTING
// https://code.visualstudio.com/api/extension-capabilities/common-capabilities#data-storage

// // on activate
// const versionKey = 'shown.version';
// context.globalState.setKeysForSync([versionKey]);

// // later on show page
// const currentVersion = context.extension.packageJSON.version;
// const lastVersionShown = context.globalState.get(versionKey);
// if (!isHigher(currentVersion, lastVersionShown)) {
//     return;
// }
// context.globalState.update(versionKey, currentVersion);
// // show page

function updateStatusBarItem(): void {
    // https://code.visualstudio.com/api/references/icons-in-labels
    myStatusBarItem.text = `$(extensions-star-full) gh-401 » basic extension UI`;

    myStatusBarItem.show();
}

// this method is called when your extension is deactivated
export function deactivate() {}
