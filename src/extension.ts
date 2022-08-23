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

// utils
import * as notificationBridge from "./notificationBridge";

const STATUS_BAR_ITEM_POSITION_PRIORITY_BASE = 1000000;
const STATUS_BAR_ITEM_COUNT = 2;
const STATUS_BAR_ITEM_LEFTMOST_ITEM = STATUS_BAR_ITEM_POSITION_PRIORITY_BASE + STATUS_BAR_ITEM_COUNT - 1;

// NOTE: Ensure that STATUS_BAR_ITEM_COUNT updated to total up the number of status bar items below:
let primaryStatusBarItem: vscode.StatusBarItem; // STATUS_BAR_ITEM 1
let secondaryStatusBarItem: vscode.StatusBarItem; // STATUS_BAR_ITEM 2

async function reconnectToAtoll() {
    atollClient.refreshToken = state.atollRefreshToken;
    logDebug(`Setting up with refresh token - atoll server URL = ${state.atollServerUrl}...`);
    try {
        const result = await atollClient.reconnect(state.atollServerUrl || "", notificationBridge.handleNotification);
        if (result) {
            logInfo(`Unable to set up with refresh token: ${result}`, MessageStyle.OutputChannelAndMessage);
        }
    } catch (err) {
        logError(`Catch triggered: ${err}`);
    }
    logDebug("Set up with refresh token.");
}

let activated = false;

async function initialActivation(context: vscode.ExtensionContext) {
    activated = true;
    try {
        logInfo("Atoll extension has been activated.");
        await state.loadSettings(context);

        // reconnect to Atoll server automatically
        if (state.atollRefreshToken && !atollClient.isConnected()) {
            await reconnectToAtoll();
            updatePrimaryStatusBarItem(context);
        }

        const connectCommand = vscode.commands.registerCommand("atoll-extension.connect", async () => {
            await connect(context);
            updatePrimaryStatusBarItem(context);
        });
        context.subscriptions.push(connectCommand);

        const disconnectCommand = vscode.commands.registerCommand("atoll-extension.disconnect", async () => {
            await disconnect(context);
            updatePrimaryStatusBarItem(context);
        });
        context.subscriptions.push(disconnectCommand);

        const primaryStatusBarCommand = vscode.commands.registerCommand("atoll-extension.primary-status-bar-click", async () => {
            if (!atollClient.isConnected()) {
                await connect(context);
                updatePrimaryStatusBarItem(context);
            } else {
                await chooseStory(context);
                updatePrimaryStatusBarItem(context);
            }
        });
        context.subscriptions.push(primaryStatusBarCommand);

        const secondaryStatusBarCommand = vscode.commands.registerCommand(
            "atoll-extension.secondary-status-bar-click",
            async () => {
                updateSecondaryStatusBarItem(context);
            }
        );
        context.subscriptions.push(secondaryStatusBarCommand);

        primaryStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, STATUS_BAR_ITEM_LEFTMOST_ITEM);
        primaryStatusBarItem.command = "atoll-extension.primary-status-bar-click";
        context.subscriptions.push(primaryStatusBarItem);

        secondaryStatusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            STATUS_BAR_ITEM_LEFTMOST_ITEM + 1
        );
        secondaryStatusBarItem.command = "atoll-extension.secondary-status-bar-click";
        context.subscriptions.push(secondaryStatusBarItem);

        // update status bar item once at start
        await updatePrimaryStatusBarItem(context);
        await updateSecondaryStatusBarItem(context);
    } catch (err) {
        // NOTE: This is intentionally done directly with window.showErrorMessage just in case there's
        //   a problem with `logError` related code - it is essential that the user sees this.
        vscode.window.showErrorMessage("Unable to activate Atoll (see output log for details)");
        logError(`Unable to activate Atoll: ${err}`, MessageStyle.OutputChannel);
    }
}

export async function activate(context: vscode.ExtensionContext) {
    if (!activated) {
        await initialActivation(context);
    }
}

// Icon information can be obtained here:
// https://code.visualstudio.com/api/references/icons-in-labels

async function updatePrimaryStatusBarItem(context: vscode.ExtensionContext): Promise<void> {
    if (atollClient.isConnected()) {
        const id = await settingStore.loadSetting(context, SETTING_KEY_BACKLOGITEM_FRIENDLY_ID);
        const storyPhrase = await settingStore.loadSetting(context, SETTING_KEY_BACKLOGITEM_STORY_PHRASE);
        if (!id) {
            primaryStatusBarItem.text = `$(extensions-star-full) (choose work item)`;
        } else {
            primaryStatusBarItem.text = `$(extensions-star-full) ${id} » ${storyPhrase}`;
        }
    } else {
        primaryStatusBarItem.text = `$(extensions-star-full) (connect to Atoll)`;
    }
    primaryStatusBarItem.show();
}

async function updateSecondaryStatusBarItem(context: vscode.ExtensionContext): Promise<void> {
    secondaryStatusBarItem.text = "Busy";
    secondaryStatusBarItem.show();
}

export function deactivate() {}
