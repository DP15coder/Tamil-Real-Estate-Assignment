import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null): string {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    } catch {
        return dateString;
    }
}

export function formatCurrency(value: string | null): string {
    if (!value) return "N/A";

    try {
        const numValue = parseFloat(value);
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(numValue);
    } catch {
        return value;
    }
}

export function extractJson(raw: string): any {
    // Try to grab code blocks first
    const blockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = blockMatch ? blockMatch[1] : raw;

    // Now find the first {...} or [...]
    const jsonMatch = candidate.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!jsonMatch) {
        throw new Error("No JSON object or array found.");
    }

    const jsonText = jsonMatch[1];

    try {
        return JSON.parse(jsonText);
    } catch (err) {
        throw new Error("Invalid JSON detected: " + (err as Error).message);
    }
}
