// externals
import * as vscode from "vscode";

export async function saveSetting(context: vscode.ExtensionContext, key: string, value: string | null): Promise<void> {
    await context.globalState.update(key, value);
}

export async function loadSetting(context: vscode.ExtensionContext, key: string, fallback?: string): Promise<string | null> {
    const rawResult = await context.globalState.get(key);
    return (rawResult as string) || fallback || null;
}

export async function loadSettingWithFallback(context: vscode.ExtensionContext, key: string, fallback: string): Promise<string> {
    if (!fallback && fallback !== "") {
        throw new Error(`Fallback provided for setting "${key}" should not be null/undefined`);
    }
    const rawResult = await loadSetting(context, key, fallback);
    return rawResult || "";
}

export async function clearSetting(context: vscode.ExtensionContext, key: string): Promise<void> {
    await saveSetting(context, key, null);
}
