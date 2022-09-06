export function isIntNumber(value: any) {
    return !isNaN(value) && parseInt(value) == value;
}

export function isValidDuration(duration: string): boolean {
    const regex = /^(\d+):?(\d{1,2})?:(\d{1,2})$/;
    return regex.test(duration);
}