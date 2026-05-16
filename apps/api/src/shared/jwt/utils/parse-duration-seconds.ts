export function parseDurationToSeconds(value: string): number {
    const match = value.trim().match(/^(\d+)([smhd])$/i);

    if (!match) {
        throw new Error(`Invalid duration format: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers: Record<string, number> = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 60 * 60 * 24,
    };

    return amount * multipliers[unit];
}