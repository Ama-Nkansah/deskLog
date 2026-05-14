import { Head, Link, router } from '@inertiajs/react';

type ActivityLog = {
    id: number;
    status: 'done' | 'pending';
};

type Activity = {
    id: number;
    title: string;
    description: string | null;
    activity_date: string;
    logs: ActivityLog[];
    creator: {
        name: string;
    };
};

type Props = {
    activities: Activity[];
    filters: { date?: string };
};

function latestStatus(logs: ActivityLog[]): 'done' | 'pending' | null {
    if (logs.length === 0) return null;
    return logs[logs.length - 1].status;
}

export default function ActivitiesIndex({ activities, filters }: Props) {
    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        router.get('/activities', { date: e.target.value }, { preserveState: true, replace: true });
    }

    function clearFilter() {
        router.get('/activities', {}, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Activities" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Activities</h1>
                    <Link
                        href="/activities/create"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        + New Activity
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        defaultValue={filters.date ?? ''}
                        onChange={handleDateChange}
                        className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {filters.date && (
                        <button
                            onClick={clearFilter}
                            className="text-sm text-muted-foreground underline"
                        >
                            Clear filter
                        </button>
                    )}
                </div>

                {activities.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                        No activities found.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {activities.map((activity) => {
                            const status = latestStatus(activity.logs);
                            return (
                                <Link
                                    key={activity.id}
                                    href={`/activities/${activity.id}`}
                                    className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">{activity.title}</p>
                                        {activity.description && (
                                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                                        )}
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {activity.activity_date} &middot; {activity.creator.name}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            status === 'done'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                        }`}
                                    >
                                        {status ?? 'no update'}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

ActivitiesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Activities', href: '/activities' },
    ],
};
