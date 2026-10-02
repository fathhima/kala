// src/modules/booking/utils/refund-policy.ts

export type RefundEligibility = {
    eligible: boolean;
    refundPercentage: number; // 0–100
    reason: string;
};

/**
 * Determines refund eligibility based on how far the cancellation
 * is from the session start time.
 *
 * Policy:
 *   ≥ 24 hours before → 100 % refund
 *   12–24 hours before → 50 % refund
 *   2–12 hours before  → 25 % refund
 *   < 2 hours before   → 0 % (no refund)
 */
export function calculateRefundEligibility(slotStartTime: Date, cancelledAt: Date = new Date(),): RefundEligibility {
    const hoursUntilSession = (slotStartTime.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession >= 24) {
        return {
            eligible: true,
            refundPercentage: 100,
            reason: 'Cancelled more than 24 hours before session',
        };
    }

    if (hoursUntilSession >= 12) {
        return {
            eligible: true,
            refundPercentage: 50,
            reason: 'Cancelled 12–24 hours before session',
        };
    }

    if (hoursUntilSession >= 2) {
        return {
            eligible: true,
            refundPercentage: 25,
            reason: 'Cancelled 2–12 hours before session',
        };
    }

    return {
        eligible: false,
        refundPercentage: 0,
        reason: 'Cancelled less than 2 hours before session — no refund',
    };
}