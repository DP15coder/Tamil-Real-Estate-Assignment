import OpenAI from "openai";

// Singleton OpenAI client for reuse across requests
let _openai_client: OpenAI | null = null;

function _get_openai_client(): OpenAI {
    if (!_openai_client) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error("OPENAI_API_KEY missing: cannot call LLM");
        _openai_client = new OpenAI({ apiKey });
    }
    return _openai_client;
}

export async function generate(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options?: {
        temperature?: number;
        max_tokens?: number;
    }
): Promise<string> {
    const openai = _get_openai_client();

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.max_tokens,
    });

    return completion.choices[0].message.content?.trim() || "";
}

