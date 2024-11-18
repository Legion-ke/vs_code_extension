import * as vscode from 'vscode';

let themeTimer: NodeJS.Timeout;

export function activate(context: vscode.ExtensionContext) {
    console.log('Auto Theme Switcher is now active');

    // Initial theme set
    updateTheme();

    // Set up timer to check every minute
    themeTimer = setInterval(updateTheme, 60000);

    // Register command to manually toggle theme
    let disposable = vscode.commands.registerCommand('autoTheme.toggle', () => {
        updateTheme(true);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (themeTimer) {
        clearInterval(themeTimer);
    }
}

function updateTheme(force: boolean = false) {
    const config = vscode.workspace.getConfiguration('autoTheme');
    const lightTheme = config.get<string>('lightTheme', 'Default Light+');
    const darkTheme = config.get<string>('darkTheme', 'Default Dark+');
    const dayStartTime = config.get<string>('dayStartTime', '08:00');
    const dayEndTime = config.get<string>('dayEndTime', '18:00');

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const isDaytime = isTimeInRange(currentTime, dayStartTime, dayEndTime);
    const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
    const targetTheme = isDaytime ? lightTheme : darkTheme;

    if (force || currentTheme !== targetTheme) {
        vscode.workspace.getConfiguration('workbench').update('colorTheme', targetTheme, true);
    }
}

function isTimeInRange(current: string, start: string, end: string): boolean {
    const [currentHour, currentMinute] = current.split(':').map(Number);
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}