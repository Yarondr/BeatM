export function isIntNumber(value: any) {
    return !isNaN(value) && parseInt(value) == value;
}

export function isValidDuration(duration: string): boolean {
    const regex = /^(\d+):?(\d{1,2})?:(\d{1,2})$/;
    return regex.test(duration);
}

export function formatViews(views: number): string {
    const formatter = new Intl.NumberFormat("en", {
        notation: "compact",
    });
    return formatter.format(views);
}