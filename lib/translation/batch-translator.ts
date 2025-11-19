import Ajv from "ajv";
import type { ExtractedTransaction, TranslatedTransaction } from "@/types";
import { generate } from "@/lib/llm";
import { extractJson } from "../utils";

// Adaptive batch size based on data volume
const MIN_BATCH_SIZE = 5;
const MAX_BATCH_SIZE = 20;
const DEFAULT_BATCH_SIZE = 10;

const ajv = new Ajv({ allErrors: true });
const schema = {
    type: "array",
    items: {
        type: "object",
        required: [
            "surveyNumber", "documentNumber", "documentYear", "registrationDate", "executionDate", "transactionType", "executant", "claimant", "plotNumber", "propertyDescription", "propertyValue"
        ],
        additionalProperties: false,
        properties: Object.fromEntries([
            "surveyNumber", "documentNumber", "documentYear", "registrationDate", "executionDate", "transactionType", "executant", "claimant", "plotNumber", "propertyDescription", "propertyValue"
        ].map(k => [k, { type: ["string", "null"] }]))
    }
};
const validate = ajv.compile(schema as any);

function _calculate_optimal_batch_size(total_rows: number): number {
    if (total_rows <= MIN_BATCH_SIZE) return total_rows;
    if (total_rows <= 20) return Math.min(DEFAULT_BATCH_SIZE, total_rows);
    if (total_rows <= 50) return 15;
    return MAX_BATCH_SIZE;
}

function _build_batch_system_prompt(): string {
    return `You are a precise Tamil to English translation assistant for Encumbrance Certificate transactions. Translate ONLY Tamil human-readable text in these fields: executant, claimant, transactionType, plotNumber, propertyDescription. Keep other fields EXACTLY unchanged: surveyNumber, documentNumber, documentYear, registrationDate, executionDate, propertyValue. Preserve nulls, strings (including numeric/date strings) verbatim if not one of the translatable fields. Return ONLY a JSON array of objects with identical shape, preserving the exact order of input transactions.`;
}

async function _translate_batch(batch: ExtractedTransaction[]): Promise<TranslatedTransaction[]> {
    const system = _build_batch_system_prompt();
    const userContent = JSON.stringify(batch);
    
    const response = await generate(
        [
            { role: "system", content: system },
            { role: "user", content: userContent }
        ],
        { temperature: 0.1 }
    );

    const parsed: any = extractJson(response);

    if (!Array.isArray(parsed)) {
        throw new Error("Batch translation response was not an array");
    }

    const normalized = parsed.map((translatedRow: any, index: number) => {
        const original = batch[index];
        const requiredKeys = [
            "surveyNumber", "documentNumber", "documentYear", "registrationDate", "executionDate", "transactionType", "executant", "claimant", "plotNumber", "propertyDescription", "propertyValue"
        ] as const;
        
        for (const k of requiredKeys) {
            if (!(k in translatedRow)) {
                translatedRow[k] = (original as any)[k] ?? null;
            }
        }
        return translatedRow as TranslatedTransaction;
    });

    return normalized;
}

export async function translate_extracted_transactions(rows: ExtractedTransaction[]): Promise<TranslatedTransaction[]> {
    if (rows.length === 0) return [];

    const batchSize = _calculate_optimal_batch_size(rows.length);

    const batches: ExtractedTransaction[][] = [];
    for (let i = 0; i < rows.length; i += batchSize) {
        batches.push(rows.slice(i, i + batchSize));
    }

    const batchResults = await Promise.all(
        batches.map(async (batch) => {
            return await _translate_batch(batch);
        })
    );

    const translated = batchResults.flat();

    if (!validate(translated)) {
        throw new Error("Translated output failed schema validation: " + ajv.errorsText(validate.errors));
    }

    return translated;
}

