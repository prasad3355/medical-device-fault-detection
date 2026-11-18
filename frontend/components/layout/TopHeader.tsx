"use client";

import { Bell, Search, User } from "lucide-react";

export function TopHeader() {
    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center text-brand-text-secondary w-64 bg-brand-sidebar rounded-md px-3 py-1.5 border border-brand-border">
                <Search size={16} className="mr-2 opacity-50" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm w-full text-brand-text-primary"
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-status-normal text-sm font-medium mr-4">
                    <span className="w-2 h-2 rounded-full bg-status-normal animate-pulse"></span>
                    System Ready
                </div>

                <button className="text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                    <Bell size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-brand-sidebar border border-brand-border flex items-center justify-center text-brand-text-secondary">
                    <User size={16} />
                </div>
            </div>
        </header>
    );
}
