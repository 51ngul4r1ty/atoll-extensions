// externals
import { window, ExtensionContext, QuickPickOptions } from "vscode";

// libraries
import { atollClient } from "@atoll/client-sdk";
import type { ProjectResourceItem } from "@atoll/api-types";

// consts/enums
import {
    SETTING_KEY_CURRENT_SPRINT_URL,
    SETTING_KEY_PROJECT_ID,
    SETTING_KEY_PROJECT_NAME,
    SETTING_KEY_SERVER_URL,
    SETTING_KEY_USERNAME
} from "./settingConsts";

// utils
import * as settingStore from "./settingStore";

export async function disconnect(context: ExtensionContext) {
    if (!atollClient.isConnected()) {
        window.showWarningMessage("No need to disconnect- currently not connected to Atoll server.");
    } else {
        atollClient.disconnect();
        settingStore.clearSetting(context, SETTING_KEY_SERVER_URL);
        settingStore.clearSetting(context, SETTING_KEY_USERNAME);
        window.showInformationMessage("Disconnected from Atoll server.");
    }
}

export async function connect(context: ExtensionContext) {
    const defaultServerUrl = await settingStore.loadSettingWithFallback(context, SETTING_KEY_SERVER_URL, "http://localhost:8500/");
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
    if (!serverUrl) {
        window.showWarningMessage("Aborted connection.");
        return;
    }
    const defaultUserName = await settingStore.loadSettingWithFallback(context, SETTING_KEY_USERNAME, "");
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
    if (!rawUserName) {
        window.showWarningMessage("Aborted connection.");
        return;
    }
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
    if (!rawPassword) {
        window.showWarningMessage("Aborted connection.");
        return;
    }
    const password = rawPassword?.trim() || "";
    window.showInformationMessage(`Connecting to "${serverUrl}" using "${userName}"...`);
    const connectionResult = await atollClient.connect(serverUrl || "", userName, password);
    if (connectionResult === null) {
        window.showInformationMessage("Successfully connected to Atoll server - loading projects...");
        settingStore.saveSetting(context, SETTING_KEY_SERVER_URL, serverUrl);
        settingStore.saveSetting(context, SETTING_KEY_USERNAME, userName);
        const projects: ProjectResourceItem[] = await atollClient.fetchProjects();
        const projectItems = projects.map((project) => project.name);
        const projectItemsSorted = projectItems.sort((a, b) => (a < b ? -1 : 1));
        const quickPickOptions: QuickPickOptions = {
            title: "Choose an Atoll Project",
            matchOnDescription: true,
            ignoreFocusOut: true
            // onDidSelectItem: (item: QuickPickItem) => {}
        };
        const projectName = await window.showQuickPick(projectItemsSorted, quickPickOptions);
        if (!projectName) {
            window.showWarningMessage("Aborted project selection.");
            return;
        }
        const matchingProjects = projects.filter((project) => project.name === projectName);
        if (matchingProjects.length !== 1) {
            window.showErrorMessage(`Only expected a single project match, but ${matchingProjects.length} were found!`);
            return;
        }
        const project = matchingProjects[0];
        const projectId = project.id;
        const links = project.links;
        settingStore.saveSetting(context, SETTING_KEY_PROJECT_ID, projectId);
        settingStore.saveSetting(context, SETTING_KEY_PROJECT_NAME, projectName);
        const currentSprintUri = atollClient.findLinkUriByRel(links, "related:sprint/current");
        if (!currentSprintUri) {
            window.showErrorMessage("Unable to find current sprint link in project returned by Atoll server!  Contact support.");
        }
        settingStore.saveSetting(context, SETTING_KEY_CURRENT_SPRINT_URL, currentSprintUri);
        window.showInformationMessage(`Project "${projectName}" selected.`);
    } else {
        window.showErrorMessage(`Error connecting to Atoll server: ${connectionResult}`);
    }
}
