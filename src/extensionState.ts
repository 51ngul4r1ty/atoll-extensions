// consts/enums
import {
    SETTING_KEY_BACKLOGITEM_FRIENDLY_ID,
    SETTING_KEY_BACKLOGITEM_ID,
    SETTING_KEY_BACKLOGITEM_STORY_PHRASE,
    SETTING_KEY_CURRENT_SPRINT_URL,
    SETTING_KEY_PROJECT_ID,
    SETTING_KEY_PROJECT_NAME,
    SETTING_KEY_REFRESH_TOKEN,
    SETTING_KEY_SERVER_URL,
    SETTING_KEY_USERNAME
} from "./settingConsts";

// utils
import { ExtensionContext } from "vscode";
import { loadSetting, saveSetting } from "./settingStore";
import { logDebug } from "./logger";

export type ExtensionState = {};

const SETTING_NAME_MAP = {
    atollRefreshToken: SETTING_KEY_REFRESH_TOKEN,
    atollServerUrl: SETTING_KEY_SERVER_URL,
    atollUserName: SETTING_KEY_USERNAME,
    currentBacklogItemFriendlyId: SETTING_KEY_BACKLOGITEM_FRIENDLY_ID,
    currentBacklogItemId: SETTING_KEY_BACKLOGITEM_ID,
    currentBacklogItemStoryPhrase: SETTING_KEY_BACKLOGITEM_STORY_PHRASE,
    currentProjectId: SETTING_KEY_PROJECT_ID,
    currentProjectName: SETTING_KEY_PROJECT_NAME,
    currentSprintUrl: SETTING_KEY_CURRENT_SPRINT_URL
};

export class ExtensionStateStore {
    constructor() {}
    private savedSettings: Record<string, string | null> = {};
    private workingSettings: Record<string, string | null> = {};
    public async loadSettings(context: ExtensionContext) {
        for (const [propName, settingName] of Object.entries(SETTING_NAME_MAP)) {
            let value: string | null;
            let loadSuccess = false;
            try {
                value = await loadSetting(context, settingName);
                logDebug(`loading setting: ${settingName} = "${value}"`);
                loadSuccess = true;
            } catch (err) {
                console.log(`An error occurred reading setting "${settingName}", in-memory value will be null`);
                value = null;
            }
            this.workingSettings[propName] = value;
            if (loadSuccess) {
                this.savedSettings[propName] = value;
            }
        }
    }
    public async saveSettings(context: ExtensionContext) {
        for (const [propName, settingName] of Object.entries(SETTING_NAME_MAP)) {
            const workingValue = this.workingSettings[propName] || null;
            const savedValue = this.savedSettings[propName];
            let saveSuccess = false;
            if (workingValue !== savedValue) {
                // only update values that have changed
                try {
                    saveSetting(context, settingName, workingValue);
                    saveSuccess = true;
                } catch (err) {
                    console.log(`An error occurred writing setting "${settingName}" - it will be out of sync now`);
                }
            }
            if (saveSuccess) {
                this.savedSettings[propName] = workingValue;
            }
        }
    }
    private setSetting(name: string, value: string | null) {
        this.workingSettings[name] = value;
    }
    private getSetting(name: string): string | null {
        return this.workingSettings[name];
    }
    //#region currentBacklogItemFriendlyId
    public get currentBacklogItemFriendlyId() {
        return this.getSetting("currentBacklogItemFriendlyId");
    }
    public set currentBacklogItemFriendlyId(value: string | null) {
        this.setSetting("currentBacklogItemFriendlyId", value);
    }
    //#endregion
    //#region currentBacklogItemId
    public get currentBacklogItemId() {
        return this.getSetting("currentBacklogItemId");
    }
    public set currentBacklogItemId(value: string | null) {
        this.setSetting("currentBacklogItemId", value);
    }
    //#endregion
    //#region currentBacklogItemStoryPhrase
    public get currentBacklogItemStoryPhrase() {
        return this.getSetting("currentBacklogItemStoryPhrase");
    }
    public set currentBacklogItemStoryPhrase(value: string | null) {
        this.setSetting("currentBacklogItemStoryPhrase", value);
    }
    //#endregion
    //#region currentSprintUrl
    public get currentSprintUrl() {
        return this.getSetting("currentSprintUrl");
    }
    public set currentSprintUrl(value: string | null) {
        this.setSetting("currentSprintUrl", value);
    }
    //#endregion
    //#region currentProjectId
    public get currentProjectId() {
        return this.getSetting("currentProjectId");
    }
    public set currentProjectId(value: string | null) {
        this.setSetting("currentProjectId", value);
    }
    //#endregion
    //#region currentProjectName
    public get currentProjectName() {
        return this.getSetting("currentProjectName");
    }
    public set currentProjectName(value: string | null) {
        this.setSetting("currentProjectName", value);
    }
    //#endregion
    //#region atollServerUrl
    public get atollServerUrl() {
        return this.getSetting("atollServerUrl");
    }
    public set atollServerUrl(value: string | null) {
        this.setSetting("atollServerUrl", value);
    }
    //#endregion
    //#region atollUserName
    public get atollUserName() {
        return this.getSetting("atollUserName");
    }
    public set atollUserName(value: string | null) {
        this.setSetting("atollUserName", value);
    }
    //#endregion
    //#region atollRefreshToken
    public get atollRefreshToken() {
        return this.getSetting("atollRefreshToken");
    }
    public set atollRefreshToken(value: string | null) {
        this.setSetting("atollRefreshToken", value);
    }
    //#endregion
}

export const state = new ExtensionStateStore();
