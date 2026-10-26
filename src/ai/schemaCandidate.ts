import { combinePaths } from "schema-node-core"
import { getCandidateSchema, SchemaChangeCandidate } from "./schemaChatApi"

/** The result of checking a candidate before applying it to the editor. */
export interface CandidateCheckResult {
    ok: boolean
    error?: string
}

/**
 * Performs the client side structural check of a candidate. The authoritative validation is done
 * on the server; this only prevents applying an obviously malformed payload.
 */
export function checkCandidate(change?: SchemaChangeCandidate): CandidateCheckResult {
    if (!change) return { ok: false, error: "No schema change candidate was returned." }
    if (!change.isValid) {
        return { ok: false, error: change.errors?.[0]?.message || "The schema candidate did not pass server validation." }
    }

    const schema = getCandidateSchema(change)
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
        return { ok: false, error: "The schema candidate is not a JSON object." }
    }
    if (typeof schema.name !== "string" || !schema.name.trim()) {
        return { ok: false, error: "The schema candidate has no name." }
    }
    if (typeof schema.kind !== "string" || !schema.kind.trim()) {
        return { ok: false, error: "The schema candidate has no kind." }
    }
    if (schema.namespace != null && typeof schema.namespace !== "string") {
        return { ok: false, error: "The schema candidate has an invalid namespace." }
    }

    return { ok: true }
}

/** Gets the target full name of a candidate. */
export function getCandidateFullName(change?: SchemaChangeCandidate): string {
    if (!change) return ""
    const schema = getCandidateSchema(change)
    return schema ? combinePaths(schema.namespace ?? "", schema.name ?? "") : (change.targetName || "")
}

/** Formats a candidate for the preview panel. */
export function formatCandidateSchema(change?: SchemaChangeCandidate): string {
    const schema = getCandidateSchema(change)
    return schema ? JSON.stringify(schema, null, 2) : ""
}
