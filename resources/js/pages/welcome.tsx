import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props as { auth: { user: { name: string } | null } };

    return (
        <>
            <Head title="DeskLog" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
                <div className="w-full max-w-md text-center">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold tracking-tight">DeskLog</h1>
                        <p className="mt-3 text-muted-foreground">
                            Keep track of what got done, what's still pending,
                            <br />
                            and make handovers a breeze.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href="/register"
                                        className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
                                    >
                                        Create an account
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
