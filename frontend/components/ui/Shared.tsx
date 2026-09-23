import { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
    title,
    subtitle,
    action
}: {
    title: string;
    subtitle?: string;
    action?: ReactNode
}) {
    return (
        <div className="flex items-start justify-between mb-8">
            <div>
                <h1 className="text-2xl font-semibold text-brand-text-primary tracking-tight mb-1">{title}</h1>
                {subtitle && <p className="text-brand-text-secondary text-sm">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

export function SectionHeader({ title }: { title: string }) {
    return (
        <h2 className="text-sm font-medium text-brand-text-secondary uppercase tracking-widest mb-4">
            {title}
        </h2>
    );
}

export function KpiCard({
    title,
    value,
    subtitle,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
}) {
    return (
        <div className="bg-brand-card border border-brand-border rounded-lg p-5 flex flex-col justify-between">
            <h3 className="text-sm font-medium text-brand-text-secondary mb-2">{title}</h3>
            <div className="text-3xl font-light text-brand-text-primary">{value}</div>
            {subtitle && <p className="text-xs text-brand-text-secondary mt-2 opacity-80">{subtitle}</p>}
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const isNormal = status.toLowerCase() === "normal" || status.toLowerCase() === "low";
    const isWarning = status.toLowerCase().includes("possible") || status.toLowerCase() === "moderate";

    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
            isNormal && "bg-status-normal/10 text-status-normal border-status-normal/20",
            isWarning && "bg-status-warning/10 text-status-warning border-status-warning/20",
            !isNormal && !isWarning && "bg-status-danger/10 text-status-danger border-status-danger/20"
        )}>
            <span className={cn(
                "w-1.5 h-1.5 rounded-full mr-1.5",
                isNormal && "bg-status-normal",
                isWarning && "bg-status-warning",
                !isNormal && !isWarning && "bg-status-danger"
            )} />
            {status}
        </span>
    );
}

export function Button({
    children,
    variant = 'primary',
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }) {
    return (
        <button
            className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none flex items-center justify-center gap-2",
                variant === 'primary' && "bg-brand-accent text-brand-bg hover:bg-brand-accent/90",
                variant === 'secondary' && "bg-brand-sidebar text-brand-text-primary hover:bg-brand-border",
                variant === 'outline' && "border border-brand-border text-brand-text-primary hover:bg-brand-sidebar",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("bg-brand-card border border-brand-border rounded-lg", className)} {...props}>
            {children}
        </div>
    );
}
