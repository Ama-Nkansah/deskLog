import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormData = {
    title: string;
    description: string;
    activity_date: string;
};

export default function CreateActivity() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        title: '',
        description: '',
        activity_date: new Date().toISOString().split('T')[0],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/activities');
    }

    return (
        <>
            <Head title="New Activity" />
            <div className="mx-auto max-w-xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">New Activity</h1>

                <form onSubmit={submit} className="flex flex-col gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Daily SMS count vs logs"
                            required
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Any extra context about this activity"
                            rows={3}
                            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="activity_date">Date</Label>
                        <Input
                            id="activity_date"
                            type="date"
                            value={data.activity_date}
                            onChange={(e) => setData('activity_date', e.target.value)}
                            required
                        />
                        <InputError message={errors.activity_date} />
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Activity'}
                        </Button>
                        <a href="/activities" className="rounded-md border px-4 py-2 text-sm hover:bg-muted">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </>
    );
}

CreateActivity.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Activities', href: '/activities' },
        { title: 'New Activity', href: '/activities/create' },
    ],
};
