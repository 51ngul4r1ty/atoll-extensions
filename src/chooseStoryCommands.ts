// externals
import { window, ExtensionContext, QuickPickOptions } from "vscode";

// libraries
import type { SprintBacklogResourceItem } from "@atoll/api-types";
import { atollClient } from "@atoll/client-sdk";

// consts/enums
import {
    SETTING_KEY_BACKLOGITEM_FRIENDLY_ID,
    SETTING_KEY_BACKLOGITEM_ID,
    SETTING_KEY_BACKLOGITEM_STORY_PHRASE,
    SETTING_KEY_CURRENT_SPRINT_URL
} from "./settingConsts";

// utils
import * as settingStore from "./settingStore";

const buildUniqueBacklogItemName = (backlogItem: SprintBacklogResourceItem) => {
    const parts: string[] = [];
    if (backlogItem.rolePhrase) {
        parts.push(backlogItem.rolePhrase);
    }
    parts.push(backlogItem.storyPhrase);
    if (backlogItem.reasonPhrase) {
        parts.push(backlogItem.reasonPhrase);
    }
    const id = backlogItem.externalId || backlogItem.friendlyId;
    return `${id} - ${parts.join(", ")}`;
};

export async function chooseStory(context: ExtensionContext) {
    if (!atollClient.isConnected()) {
        window.showWarningMessage("You must be connected to an Atoll server instance to use this functionality.");
        return;
    }
    const currentSprintUri = (await settingStore.loadSetting(context, SETTING_KEY_CURRENT_SPRINT_URL)) || "";
    if (!currentSprintUri) {
        window.showErrorMessage(
            "Unable to load current sprint URL - it should be stored by the app after connecting to the Atoll server and " +
                "selecting a project!  Contact support."
        );
        return;
    }
    window.showInformationMessage("Fetching data for current sprint from Atoll server...");
    const currentSprint = await atollClient.fetchSprintByUri(currentSprintUri);
    if (currentSprint === null) {
        window.showInformationMessage(
            "The last sprint is complete and there is no new sprint in the Atoll database for this project!"
        );
        return;
    }
    const backlogItemsUri = atollClient.findLinkUriByRel(currentSprint.links, "related:sprint-backlog-items");
    if (backlogItemsUri === null) {
        window.showErrorMessage(
            "No link is available in current sprint for sprint backlog items - this is unexpected!  Contact support."
        );
        return;
    }
    window.showInformationMessage("Fetching data for sprint backlog items from Atoll server...");
    const sprintBacklogItems = await atollClient.fetchSprintBacklogItemsByUri(backlogItemsUri);

    if (sprintBacklogItems === null) {
        window.showInformationMessage("There are no sprint backlog items available - please add sprint backlog items first!");
        return;
    }
    const backlogItems = sprintBacklogItems.map((sprintBacklogItem) => buildUniqueBacklogItemName(sprintBacklogItem));
    const backlogItemsSorted = backlogItems.sort((a, b) => (a < b ? -1 : 1));
    const quickPickOptions: QuickPickOptions = {
        title: "Choose a Sprint Backlog Item",
        matchOnDescription: true,
        ignoreFocusOut: true
        // onDidSelectItem: (item: QuickPickItem) => {}
    };
    const backlogItemName = await window.showQuickPick(backlogItemsSorted, quickPickOptions);
    if (!backlogItemName) {
        window.showWarningMessage("Aborted backlog item selection.");
        return;
    }
    const matchingSBIs = sprintBacklogItems.filter((backlogItem) => buildUniqueBacklogItemName(backlogItem) === backlogItemName);
    if (matchingSBIs.length !== 1) {
        window.showErrorMessage(`Only expected a single backlog item match, but ${matchingSBIs.length} were found!`);
        return;
    }
    const matchingSBI = matchingSBIs[0];
    const backlogItemId = matchingSBI.id;
    const id = matchingSBI.externalId || matchingSBI.friendlyId;
    settingStore.saveSetting(context, SETTING_KEY_BACKLOGITEM_ID, backlogItemId);
    settingStore.saveSetting(context, SETTING_KEY_BACKLOGITEM_FRIENDLY_ID, id);
    settingStore.saveSetting(context, SETTING_KEY_BACKLOGITEM_STORY_PHRASE, matchingSBI.storyPhrase);
    window.showInformationMessage(`Backlog item "${id} - ${matchingSBI.storyPhrase}" selected.`);
}
