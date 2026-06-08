import { spawnSync } from 'child_process';

export function copyToClipboard(text: string): boolean {
  try {
    if (process.platform === 'darwin') {
      spawnSync('pbcopy', { input: text });
    } else if (process.platform === 'win32') {
      spawnSync('clip', { input: text });
    } else {
      // Linux — try xclip, fall back to xsel
      const xclip = spawnSync('xclip', ['-selection', 'clipboard'], { input: text });
      if (xclip.status !== 0) {
        spawnSync('xsel', ['--clipboard', '--input'], { input: text });
      }
    }
    return true;
  } catch {
    return false;
  }
}
