/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// externals
import { window } from "vscode";

// libraries
import { atollClient } from "@atoll/client-sdk";

/**
 * Shows a pick list using window.showQuickPick().
 */
export async function disconnect() {
    // let i = 0;
    // const result = await window.showQuickPick(["eins", "zwei", "drei"], {
    //     placeHolder: "eins, zwei or drei",
    //     onDidSelectItem: (item) => window.showInformationMessage(`Focus ${++i}: ${item}`)
    // });
    // TODO: Check to see if user is actually connected - show message if not connected
    // TODO: If connected - clear any persisted connection data
    window.showInformationMessage("Disconnected from Atoll server.");
}

/**
 * Shows an input box using window.showInputBox().
 */
export async function connect() {
    const defaultServerUrl = "http://localhost:8500/";
    const serverUrl = await window.showInputBox({
        value: defaultServerUrl,
        valueSelection: [0, defaultServerUrl.length],
        placeHolder: "Provide an Atoll server root URL here",
        validateInput: (text) => {
            if (!text.startsWith("http://") && !text.startsWith("https://")) {
                return 'URL must start with "http://" or "https://"';
            }
            return null;
        }
    });
    const defaultUserName = "";
    const rawUserName = await window.showInputBox({
        value: defaultUserName,
        valueSelection: [0, defaultUserName.length],
        placeHolder: "Provide your username here",
        validateInput: (text) => {
            if (text.trim().length === 0) {
                return "Username is required";
            }
            return null;
        }
    });
    const userName = rawUserName?.trim() || "";
    const defaultPassword = "";
    const rawPassword = await window.showInputBox({
        value: defaultPassword,
        valueSelection: [0, defaultPassword.length],
        placeHolder: "Provide your password here (it will not be stored)",
        password: true,
        validateInput: (text) => {
            if (text.trim().length === 0) {
                return "Password is required";
            }
            return null;
        }
    });
    const password = rawPassword?.trim() || "";
    window.showInformationMessage(`Connecting to "${serverUrl}" using "${userName}"...`);
    const connectionResult = await atollClient.connect(serverUrl || "", userName, password);
    if (connectionResult === null) {
        window.showInformationMessage("Successfully connected to Atoll server!");
    } else {
        window.showErrorMessage(`Error connecting to Atoll server: ${connectionResult}`);
    }
}
