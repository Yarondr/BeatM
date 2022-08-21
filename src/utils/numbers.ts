export function isIntNumber(value: any) {
    return !isNaN(value) && parseInt(value) == value;
}