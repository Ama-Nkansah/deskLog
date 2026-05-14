import { Head, router } from '@inertiajs/react';

type ActivityLog = {
    id: number;
    status: 'done' | 'pending';
    remark: string;
    user: {
        name: string;
        department: string;
        role: string;
    };
    created_at: string;
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
    date: string;
};

function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function latestStatus(logs: ActivityLog[]): 'done' | 'pending' | null {
    if (logs.length === 0) return null;
    return logs[logs.length - 1].status;
}

export default function DailyView({ activities, date }: Props) {
    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        router.get('/daily-view', { date: e.target.value }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Daily View" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Daily View</h1>
                        <p className="text-sm text-muted-foreground">Shift handover summary</p>
                    </div>
                    <input
                        type="date"
                        defaultValue={date}
                        onChange={handleDateChange}
                        className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {activities.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                        No activities for this date.
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {activities.map((activity) => {
                            const status = latestStatus(activity.logs);
                            return (
                                <div key={activity.id} className="rounded-xl border">
                                    {/* Activity header */}
                                    <div className="flex items-center justify-between border-b p-4">
                                        <div>
                                            <p className="font-semibold">{activity.title}</p>
                                            {activity.description && (
                                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Created by {activity.creator.name}
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
                                    </div>

                                    {/* Update timeline */}
                                    {activity.logs.length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground">No updates recorded.</p>
                                    ) : (
                                        <div className="divide-y">
                                            {activity.logs.map((log) => (
                                                <div key={log.id} className="flex gap-4 p-4">
                                                    <div className="mt-1 flex-shrink-0">
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                log.status === 'done'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                            }`}
                                                        >
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm">{log.remark}</p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {log.user.name} &middot; {log.user.department} &middot; {log.user.role}
                                                        </p>
                                                    </div>
                                                    <p className="flex-shrink-0 text-xs text-muted-foreground">
                                                        {formatTime(log.created_at)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

DailyView.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Daily View', href: '/daily-view' },
    ],
};
