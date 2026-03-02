import re
from typing import List, Dict

# OWASP-inspired threat patterns
THREAT_RULES = [
    {
        "pattern": re.compile(r"(['\"])\s*or\s*['\"]?\d+['\"]?\s*=\s*['\"]?\d+", re.IGNORECASE),
        "category": "SQL Injection",
        "level": "Critical",
        "score": 90,
        "mitigation": "Use parameterized queries or an ORM. Never interpolate user input directly into SQL strings.",
    },
    {
        "pattern": re.compile(r"<script[\s\S]*?>[\s\S]*?</script>", re.IGNORECASE),
        "category": "XSS (Stored/Reflected)",
        "level": "High",
        "score": 70,
        "mitigation": "Sanitize all user input. Use Content-Security-Policy headers and HTML entity encoding.",
    },
    {
        "pattern": re.compile(r"password\s*=\s*['\"][^'\"]{3,}", re.IGNORECASE),
        "category": "Hardcoded Credential",
        "level": "Critical",
        "score": 95,
        "mitigation": "Move secrets to environment variables or a secrets manager (HashiCorp Vault, AWS Secrets Manager).",
    },
    {
        "pattern": re.compile(r"eval\s*\(", re.IGNORECASE),
        "category": "Code Injection Risk",
        "level": "High",
        "score": 65,
        "mitigation": "Avoid eval(). Use JSON.parse() for data or structured alternatives.",
    },
    {
        "pattern": re.compile(r"exec\s*\(|os\.system\s*\(|subprocess\.call", re.IGNORECASE),
        "category": "Command Injection",
        "level": "Critical",
        "score": 90,
        "mitigation": "Avoid shell execution of user input. Use subprocess with argument lists, never shell=True.",
    },
    {
        "pattern": re.compile(r"ssrf|fetch.*localhost|http://169\.254", re.IGNORECASE),
        "category": "SSRF Indicator",
        "level": "High",
        "score": 70,
        "mitigation": "Validate and whitelist all external URLs. Block private IP ranges (10.x, 172.x, 192.168.x, 169.254.x).",
    },
    {
        "pattern": re.compile(r"\.\./|\.\.\\|path\s+traversal", re.IGNORECASE),
        "category": "Path Traversal",
        "level": "High",
        "score": 65,
        "mitigation": "Sanitize all file paths. Use os.path.abspath() and verify paths are within allowed directories.",
    },
    {
        "pattern": re.compile(r"md5\s*\(|sha1\s*\(", re.IGNORECASE),
        "category": "Weak Cryptography",
        "level": "Medium",
        "score": 45,
        "mitigation": "Use SHA-256+ for hashing. Use bcrypt or Argon2 for password storage. Never use MD5 or SHA-1 for security.",
    },
    {
        "pattern": re.compile(r"jwt\.decode.*verify.*false|algorithm.*none", re.IGNORECASE),
        "category": "JWT None Algorithm",
        "level": "Critical",
        "score": 95,
        "mitigation": "Always verify JWT signatures. Never allow algorithm=none. Enforce HS256/RS256 with strict validation.",
    },
    {
        "pattern": re.compile(r"cors.*\*|Access-Control-Allow-Origin.*\*", re.IGNORECASE),
        "category": "Overly Permissive CORS",
        "level": "Medium",
        "score": 40,
        "mitigation": "Restrict CORS to known, trusted origins. Never use wildcard (*) in production.",
    },
]

LEVEL_SCORE = {"Low": 20, "Medium": 40, "High": 65, "Critical": 90}


def analyze_threat(content: str) -> Dict:
    """
    Analyze text content for security threat patterns.
    Returns threat level, score, findings, and mitigation advice.
    """
    findings = []
    for rule in THREAT_RULES:
        if rule["pattern"].search(content):
            findings.append({
                "category": rule["category"],
                "level": rule["level"],
                "score": rule["score"],
                "mitigation": rule["mitigation"],
            })

    if not findings:
        return {
            "threat_level": "Clean",
            "threat_score": 0,
            "patterns_found": [],
            "mitigation": "No obvious vulnerability patterns detected. Always conduct thorough manual code review.",
        }

    max_score = max(f["score"] for f in findings)
    dominant = max(findings, key=lambda f: f["score"])

    return {
        "threat_level": dominant["level"],
        "threat_score": max_score,
        "patterns_found": [f["category"] for f in findings],
        "mitigation": dominant["mitigation"],
    }
