type StatisticsSummaryTotals = {
    applications: number;
    accepted: number;
    /** Optional: shown as a fourth card when a hackathon range is involved. */
    hackathons?: number;
};

export default function StatisticsSummary({
    totals,
}: {
    totals: StatisticsSummaryTotals;
}) {
    const stats = [
        { label: 'Applications', value: totals.applications.toLocaleString() },
        { label: 'Accepted', value: totals.accepted.toLocaleString() },
        {
            label: 'Acceptance rate',
            value:
                totals.applications > 0
                    ? `${((totals.accepted / totals.applications) * 100).toFixed(1)}%`
                    : '—',
        },
    ];

    if (totals.hackathons != null) {
        stats.push({
            label: 'Hackathons',
            value: totals.hackathons.toLocaleString(),
        });
    }

    return (
        <div
            className={`grid grid-cols-1 gap-3 ${
                totals.hackathons != null ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
            }`}
        >
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-xl border border-neutral-600/30 bg-neutral-900 p-4"
                >
                    <p className="text-xs font-medium tracking-wide text-white/50 uppercase">
                        {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                        {stat.value}
                    </p>
                </div>
            ))}
        </div>
    );
}
