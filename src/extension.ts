// externals
import * as vscode from "vscode";

// libraries
import { atollClient } from "@atoll/client-sdk";

// utils
import { connect, disconnect } from "./connectCommands";
import { chooseStory } from "./chooseStoryCommands";
import * as settingStore from "./settingStore";
import { SETTING_KEY_BACKLOGITEM_FRIENDLY_ID, SETTING_KEY_BACKLOGITEM_STORY_PHRASE } from "./settingConsts";

let myStatusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
    console.log("Atoll extension has been activitated.");

    const connectCommand = vscode.commands.registerCommand("atoll-extension.connect", async () => {
        await connect(context);
        updateStatusBarItem(context);
    });
    context.subscriptions.push(connectCommand);

    const disconnectCommand = vscode.commands.registerCommand("atoll-extension.disconnect", async () => {
        await disconnect(context);
        updateStatusBarItem(context);
    });
    context.subscriptions.push(disconnectCommand);

    const statusBarCommand = vscode.commands.registerCommand("atoll-extension.status-bar-click", async () => {
        if (!atollClient.isConnected()) {
            await connect(context);
            updateStatusBarItem(context);
        } else {
            await chooseStory(context);
            updateStatusBarItem(context);
        }
    });
    context.subscriptions.push(statusBarCommand);

    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000000);
    myStatusBarItem.command = "atoll-extension.status-bar-click";
    context.subscriptions.push(myStatusBarItem);

    // update status bar item once at start
    await updateStatusBarItem(context);
}

async function updateStatusBarItem(context: vscode.ExtensionContext): Promise<void> {
    // https://code.visualstudio.com/api/references/icons-in-labels
    if (atollClient.isConnected()) {
        const id = await settingStore.loadSetting(context, SETTING_KEY_BACKLOGITEM_FRIENDLY_ID);
        const storyPhrase = await settingStore.loadSetting(context, SETTING_KEY_BACKLOGITEM_STORY_PHRASE);
        if (!id) {
            myStatusBarItem.text = `$(extensions-star-full) (choose work item)`;
        } else {
            myStatusBarItem.text = `$(extensions-star-full) ${id} » ${storyPhrase}`;
        }
    } else {
        myStatusBarItem.text = `$(extensions-star-full) (connect to Atoll)`;
    }
    myStatusBarItem.show();
}

export function deactivate() {}
