import pdf from "pdf-parse";
import { readFileSync } from "fs";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { ExtractedTransaction } from "@/types";
import { generate } from "../llm";
import { extractJson } from "../utils";


// JSON Schema for validation
const transactionSchema = {
    type: "object",
    additionalProperties: false,
    required: [
        "surveyNumber",
        "documentNumber",
        "documentYear",
        "registrationDate",
        "executionDate",
        "transactionType",
        "executant",
        "claimant",
        "plotNumber",
        "propertyDescription",
        "propertyValue"
    ],
    properties: {
        surveyNumber: { type: ["string", "null"] },
        documentNumber: { type: ["string", "null"] },
        documentYear: { type: ["string", "null"] },
        registrationDate: { type: ["string", "null"] },
        executionDate: { type: ["string", "null"] },
        transactionType: { type: ["string", "null"] },
        executant: { type: ["string", "null"] },
        claimant: { type: ["string", "null"] },
        plotNumber: { type: ["string", "null"] },
        propertyDescription: { type: ["string", "null"] },
        propertyValue: { type: ["string", "null"] }
    }
};

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateTransaction = ajv.compile(transactionSchema as any);
const validateTransactionArray = ajv.compile({
    type: "array",
    items: transactionSchema
} as any);


async function _extract_pdf_text(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    return data.text;
}

export async function extract_transactions_from_pdf(buffer: Buffer): Promise<ExtractedTransaction[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY missing: extraction cannot proceed (no fallback)");
    }

    const pdfText = await _extract_pdf_text(buffer);
    const systemPath = path.join(process.cwd(), "lib", "pdf", "extraction-prompt.txt");
    const systemInstructions = readFileSync(systemPath, "utf8");

    const userContent = `$Here is the PDF content:\n################\n${pdfText.substring(0, 120000)}\n################`;
    const raw = await generate([
        { role: "system", content: systemInstructions },
        { role: "user", content: userContent }
    ], { temperature: 0.1 });

    const parsed: any[] = extractJson(raw);

    if (!Array.isArray(parsed)) {
        throw new Error("LLM response was not a top-level JSON array as expected");
    }

    if (!validateTransactionArray(parsed)) {
        throw new Error("Extraction JSON schema validation failed: " + ajv.errorsText(validateTransactionArray.errors));
    }

    return parsed as ExtractedTransaction[];
}

