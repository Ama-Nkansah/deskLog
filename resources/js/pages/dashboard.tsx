import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import type { Auth } from '@/types';

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

function latestStatus(logs: ActivityLog[]): 'done' | 'pending' | null {
    if (logs.length === 0) return null;
    return logs[logs.length - 1].status;
}

export default function Dashboard({ activities, date }: Props) {
    const { auth } = usePage().props as { auth: Auth };
    const isAdmin = auth.user.role === 'admin';
    const done = activities.filter((a) => latestStatus(a.logs) === 'done').length;
    const pending = activities.filter((a) => latestStatus(a.logs) === 'pending').length;
    const noUpdate = activities.filter((a) => latestStatus(a.logs) === null).length;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Activities for {date}</p>
                    </div>
                    {isAdmin && (
                        <Link
                            href="/activities/create"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            + New Activity
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border p-4">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="mt-1 text-3xl font-bold">{activities.length}</p>
                    </div>
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                        <p className="text-sm text-green-700 dark:text-green-400">Done</p>
                        <p className="mt-1 text-3xl font-bold text-green-700 dark:text-green-400">{done}</p>
                    </div>
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">Pending</p>
                        <p className="mt-1 text-3xl font-bold text-yellow-700 dark:text-yellow-400">{pending + noUpdate}</p>
                    </div>
                </div>

                {activities.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                        No activities for today yet.{' '}
                        <Link href="/activities/create" className="underline">
                            Add one
                        </Link>
                        .
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
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
