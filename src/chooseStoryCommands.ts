// externals
import { window, ExtensionContext, QuickPickOptions } from "vscode";

// libraries
import type { SprintBacklogResourceItem } from "@atoll/api-types";
import { atollClient } from "@atoll/client-sdk";

// state
import { state } from "./extensionState";
import { logError, logInfo, logWarning, MessageStyle } from "./logger";

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
    await state.loadSettings(context);
    if (!atollClient.isConnected()) {
        window.showWarningMessage("You must be connected to an Atoll server instance to use this functionality.");
        return;
    }
    const currentSprintUri = state.currentSprintUrl;
    if (!currentSprintUri) {
        window.showErrorMessage(
            "Unable to load current sprint URL - it should be stored by the app after connecting to the Atoll server and " +
                "selecting a project!  Contact support."
        );
        return;
    }
    logInfo("Fetching data for current sprint from Atoll server...", MessageStyle.OutputChannelAndMessage);
    const currentSprint = await atollClient.fetchSprintByUri(currentSprintUri);
    if (currentSprint === null) {
        logInfo(
            "The last sprint is complete and there is no new sprint in the Atoll database for this project!",
            MessageStyle.OutputChannelAndMessage
        );
        return;
    }
    const backlogItemsRelativeUri = atollClient.findLinkUriByRel(currentSprint.links, "related:sprint-backlog-items");
    if (backlogItemsRelativeUri === null) {
        logInfo(
            "No link is available in current sprint for sprint backlog items - this is unexpected!  Contact support.",
            MessageStyle.OutputChannelAndMessage
        );
        return;
    }
    logInfo("Fetching data for sprint backlog items from Atoll server...", MessageStyle.OutputChannelAndMessage);
    const backlogItemsUri = atollClient.buildFullUri(backlogItemsRelativeUri);
    const sprintBacklogItems = await atollClient.fetchSprintBacklogItemsByUri(backlogItemsUri);

    if (sprintBacklogItems === null) {
        logInfo(
            "There are no sprint backlog items available - please add sprint backlog items first!",
            MessageStyle.OutputChannelAndMessage
        );
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
        logWarning("Aborted backlog item selection.", MessageStyle.OutputChannelAndMessage);
        return;
    }
    const matchingSBIs = sprintBacklogItems.filter((backlogItem) => buildUniqueBacklogItemName(backlogItem) === backlogItemName);
    if (matchingSBIs.length !== 1) {
        logError(
            `Only expected a single backlog item match, but ${matchingSBIs.length} were found!`,
            MessageStyle.OutputChannelAndMessage
        );
        return;
    }
    const matchingSBI = matchingSBIs[0];
    const id = matchingSBI.externalId || matchingSBI.friendlyId;

    state.currentBacklogItemId = matchingSBI.id;
    state.currentBacklogItemFriendlyId = id;
    state.currentBacklogItemStoryPhrase = matchingSBI.storyPhrase;

    await state.saveSettings(context);

    logInfo(`Backlog item "${id} - ${matchingSBI.storyPhrase}" selected.`, MessageStyle.OutputChannelAndMessage);
}
