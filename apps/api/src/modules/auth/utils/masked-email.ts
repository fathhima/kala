
export function maskEmail(email: string): string {
    return email.replace(/^(.{2})(.*)(@.*)$/, (_, start, middle, end) => {
        return `${start}${"*".repeat(middle.length)}${end}`;
    });
}
