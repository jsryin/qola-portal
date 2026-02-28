export const runtime = 'edge';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <div className="text-center space-y-4">
                <h1 className="text-6xl font-bold">404</h1>
                <p className="text-xl text-muted-foreground">Page not found</p>
            </div>
        </div>
    );
}
