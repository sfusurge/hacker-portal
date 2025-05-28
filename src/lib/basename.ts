export function basename(path: string, ext: string = '') {
    // Get the last part of the path
    const base = path.split(/[\\/]/).pop() || '';

    // Remove extension if it matches
    if (ext && base.endsWith(ext)) {
        return base.slice(0, -ext.length);
    }

    return base;
}
