import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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

type Filters = {
    from?: string;
    to?: string;
    status?: string;
};

type Props = {
    activities: Activity[];
    filters: Filters;
};

type FormData = {
    from: string;
    to: string;
    status: string;
};

function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Reports({ activities, filters }: Props) {
    const { data, setData, get, processing } = useForm<FormData>({
        from: filters.from ?? '',
        to: filters.to ?? '',
        status: filters.status ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        get('/reports');
    }

    const hasSearched = !!(filters.from || filters.to);

    return (
        <>
            <Head title="Reports" />
            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold">Reports</h1>

                {/* Filter form */}
                <form onSubmit={submit} className="rounded-xl border p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="from">From</Label>
                            <Input
                                id="from"
                                type="date"
                                value={data.from}
                                onChange={(e) => setData('from', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="to">To</Label>
                            <Input
                                id="to"
                                type="date"
                                value={data.to}
                                onChange={(e) => setData('to', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status (optional)</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>
                    <Button type="submit" disabled={processing} className="mt-4">
                        {processing ? 'Searching...' : 'Search'}
                    </Button>
                </form>

                {/* Results */}
                {!hasSearched ? (
                    <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                        Select a date range above to view activity history.
                    </div>
                ) : activities.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                        No activities found for the selected range.
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {activities.map((activity) => (
                            <div key={activity.id} className="rounded-xl border">
                                <div className="border-b p-4">
                                    <p className="font-semibold">{activity.title}</p>
                                    {activity.description && (
                                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                                    )}
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {activity.activity_date} &middot; {activity.creator.name}
                                    </p>
                                </div>

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
                                                    {formatDate(log.created_at)} {formatTime(log.created_at)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Reports.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reports', href: '/reports' },
    ],
};
