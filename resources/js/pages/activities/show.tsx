import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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
        department: string;
    };
};

type Props = {
    activity: Activity;
};

type FormData = {
    status: 'done' | 'pending' | '';
    remark: string;
};

function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ShowActivity({ activity }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        status: '',
        remark: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/activities/${activity.id}/logs`, { onSuccess: () => reset() });
    }

    return (
        <>
            <Head title={activity.title} />
            <div className="mx-auto max-w-2xl p-6 flex flex-col gap-8">

                {/* Activity header */}
                <div className="rounded-xl border p-5">
                    <h1 className="text-xl font-semibold">{activity.title}</h1>
                    {activity.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                        Date: {activity.activity_date} &middot; Created by {activity.creator.name} ({activity.creator.department})
                    </p>
                </div>

                {/* Update history */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Update History
                    </h2>
                    {activity.logs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No updates yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {activity.logs.map((log) => (
                                <div key={log.id} className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                log.status === 'done'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                            }`}
                                        >
                                            {log.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(log.created_at)} at {formatTime(log.created_at)}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm">{log.remark}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {log.user.name} &middot; {log.user.department} &middot; {log.user.role}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add update form */}
                <div className="rounded-xl border p-5">
                    <h2 className="mb-4 font-semibold">Add Status Update</h2>
                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'done' | 'pending')}
                                required
                                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select status</option>
                                <option value="pending">Pending</option>
                                <option value="done">Done</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="remark">Remark</Label>
                            <textarea
                                id="remark"
                                value={data.remark}
                                onChange={(e) => setData('remark', e.target.value)}
                                placeholder="Describe what was done or why it is pending"
                                rows={3}
                                required
                                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <InputError message={errors.remark} />
                        </div>

                        <Button type="submit" disabled={processing} className="self-start">
                            {processing ? 'Saving...' : 'Submit Update'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}

ShowActivity.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Activities', href: '/activities' },
        { title: 'Activity Detail', href: '#' },
    ],
};
