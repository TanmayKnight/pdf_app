import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
}

export function ToolCard({ title, description, icon: Icon, href }: ToolCardProps) {
    return (
        <Link
            href={href}
            className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group flex flex-col items-start gap-4 h-full"
        >
            <div className="p-3 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                <Icon className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h3 className="font-bold text-xl mb-2 text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
        </Link>
    );
}
