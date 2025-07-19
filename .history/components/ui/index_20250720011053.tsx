// Card Components
export const Card = ({ children, className = "", ...props }: any) => (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ children, className = "", ...props }: any) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = "", ...props }: any) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ children, className = "", ...props }: any) => (
    <div className={`p-6 pt-0 ${className}`} {...props}>
        {children}
    </div>
);

// Badge Component
export const Badge = ({ children, variant = "default", className = "", ...props }: any) => {
    const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    };

    return (
        <div className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
            {children}
        </div>
    );
};

// Dialog Components
export const Dialog = ({ open, onOpenChange, children }: any) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
                {children}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export const DialogContent = ({ children, className = "", ...props }: any) => (
    <div className={className} {...props}>
        {children}
    </div>
);

export const DialogHeader = ({ children, className = "", ...props }: any) => (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
        {children}
    </div>
);

export const DialogTitle = ({ children, className = "", ...props }: any) => (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
        {children}
    </h2>
);

// Input Component
export const Input = ({ className = "", ...props }: any) => (
    <input
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
);

// Label Component
export const Label = ({ children, className = "", ...props }: any) => (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
        {children}
    </label>
);

// Alert Components
export const Alert = ({ children, variant = "default", className = "", ...props }: any) => {
    const variants = {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    };

    return (
        <div className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`} {...props}>
            {children}
        </div>
    );
};

export const AlertDescription = ({ children, className = "", ...props }: any) => (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
        {children}
    </div>
);