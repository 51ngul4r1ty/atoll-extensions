/**
 * Purpose: Handle messages from client SDK that need to be shown to the user of the VS Code extension.
 */

// utils
import { logError, logInfo, logWarning, MessageStyle } from "./logger";

export const handleNotification = async (message: string, level: string) => {
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
