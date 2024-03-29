// externals
import * as vscode from "vscode";

// libraries
import { atollClient } from "@atoll/client-sdk";

// utils
import { logDebug, logError, logInfo, logWarning, MessageStyle } from "./logger";
import { connect, disconnect } from "./connectCommands";
import { chooseStory } from "./chooseStoryCommands";
import * as settingStore from "./settingStore";

// consts/enums
import { SETTING_KEY_BACKLOGITEM_FRIENDLY_ID, SETTING_KEY_BACKLOGITEM_STORY_PHRASE } from "./settingConsts";

// state
import { state } from "./extensionState";

let myStatusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
    logInfo("Atoll extension has been activated.");
    await state.loadSettings(context);
    if (state.atollRefreshToken) {
        atollClient.refreshToken = state.atollRefreshToken;
        const handleNotification = async (message: string, level: string) => {
            switch (level) {
                case "info": {
                    logInfo(message, MessageStyle.OutputChannelAndMessage);
                    break;
                }
                case "warn": {
                    logWarning(message, MessageStyle.OutputChannelAndMessage);
                    break;
                }
                case "error": {
                    logError(message, MessageStyle.OutputChannelAndMessage);
                    break;
                }
                default: {
                    throw new Error(`Unexpected level "${level}" with message "${message}"`);
                }
            }
        };
        logDebug(`Setting up with refresh token - atoll server URL = ${state.atollServerUrl}...`);
        try {
            const result = await atollClient.setupWithRefreshToken(state.atollServerUrl || "", handleNotification);
            if (result) {
                logInfo(`Unable to set up with refresh token: ${result}`, MessageStyle.OutputChannelAndMessage);
            }
        } catch (err) {
            logError(`Catch triggered: ${err}`);
        }
        logDebug("Set up with refresh token.");
        updateStatusBarItem(context);
    }

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
