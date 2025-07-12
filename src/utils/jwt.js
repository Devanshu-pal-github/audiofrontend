// Utility to decode JWT and extract quarter IDs and latest quarter

// Decodes a JWT token (does not verify signature)
export function decodeJWT(token) {
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        console.log('Decoded JWT payload:', decoded); // For debugging
        return decoded;
    } catch (e) {
        console.error('Failed to decode JWT:', e);
        return null;
    }
}

// Extracts all quarter IDs from the decoded token (expects array or object property)
export function getQuarterIdsFromToken(token) {
    const decoded = decodeJWT(token);
    if (!decoded) return [];
    
    console.log('Full decoded token for quarter extraction:', decoded);
    
    // Based on your token structure, extract quarter IDs from assigned_rocks
    if (decoded.assigned_rocks && Array.isArray(decoded.assigned_rocks)) {
        // Extract unique quarter_ids from assigned_rocks array
        const quarterIds = [...new Set(decoded.assigned_rocks.map(rock => rock.quarter_id))];
        console.log('Extracted quarter IDs from assigned_rocks:', quarterIds);
        return quarterIds;
    }
    
    // Fallback: try other possible property names
    const possibleQuarterIds = decoded.quarter_ids || decoded.quarters || decoded.quarter_id ? [decoded.quarter_id] : [];
    console.log('Fallback quarter IDs:', possibleQuarterIds);
    return possibleQuarterIds;
}

// Helper to parse quarter string like 'Q3 2024' or 'Q4 2025'
function parseQuarterString(q) {
    // Accepts 'Q3 2024', 'Q4 2025', 'Q3Q4', etc.
    const match = /Q(\d)[^\d]*(\d{4})?/.exec(q);
    if (!match) return { quarter: 0, year: 0 };
    return {
        quarter: parseInt(match[1], 10),
        year: match[2] ? parseInt(match[2], 10) : 0
    };
}

// Returns the latest quarter ID from an array of quarter IDs
export function getLatestQuarterId(quarterIds) {
    if (!Array.isArray(quarterIds) || quarterIds.length === 0) return null;
    // Sort by year, then by quarter number
    const sorted = [...quarterIds].sort((a, b) => {
        const qa = parseQuarterString(a);
        const qb = parseQuarterString(b);
        if (qa.year !== qb.year) return qb.year - qa.year;
        return qb.quarter - qa.quarter;
    });
    return sorted[0]; // Latest
}
