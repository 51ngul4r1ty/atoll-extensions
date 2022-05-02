// externals
import * as vscode from "vscode";

// libraries
import { atollClient } from "@atoll/client-sdk";

// utils
import { connect, disconnect } from "./connectCommands";

let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log("Atoll extension has been activitated.");

    const connectCommand = vscode.commands.registerCommand("atoll-extension.connect", async () => {
        await connect(context);
        updateStatusBarItem();
    });
    context.subscriptions.push(connectCommand);

    const disconnectCommand = vscode.commands.registerCommand("atoll-extension.disconnect", async () => {
        await disconnect(context);
        updateStatusBarItem();
    });
    context.subscriptions.push(disconnectCommand);

    const statusBarCommand = vscode.commands.registerCommand("atoll-extension.status-bar-click", async () => {
        if (!atollClient.isConnected()) {
            await connect(context);
            updateStatusBarItem();
        }
    });
    context.subscriptions.push(statusBarCommand);

    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000000);
    myStatusBarItem.command = "atoll-extension.status-bar-click";
    context.subscriptions.push(myStatusBarItem);

    // update status bar item once at start
    updateStatusBarItem();
}

function updateStatusBarItem(): void {
    if (atollClient.isConnected()) {
        // https://code.visualstudio.com/api/references/icons-in-labels
        myStatusBarItem.text = `$(extensions-star-full) gh-401 » basic extension UI`;
    } else {
        myStatusBarItem.text = `$(extensions-star-full) (connect to Atoll)`;
    }
    myStatusBarItem.show();
}

export function deactivate() {}
