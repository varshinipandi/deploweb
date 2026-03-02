from typing import List, Dict

# Canonical skill categories for domain coverage calculation
DOMAIN_SKILLS = {
    "AI": ["Python", "ML", "Deep Learning", "NLP", "Computer Vision", "PyTorch", "TensorFlow", "Data Science"],
    "Cybersecurity": ["Pen Testing", "OSINT", "Malware Analysis", "Reverse Engineering", "CTF", "Network Security", "Web Security", "OWASP"],
    "Full Stack": ["React", "FastAPI", "Docker", "PostgreSQL", "Redis", "JavaScript", "Kubernetes"],
    "Data Science": ["Statistics", "Data Science", "Python", "ML", "PostgreSQL"],
}


def compute_compatibility(members: List[Dict]) -> Dict:
    """
    AI Team Compatibility Engine
    
    Algorithm:
    1. Aggregate all skills across the team
    2. Domain Coverage = |team_skills ∩ domain_skills| / |domain_skills| per domain
    3. Balance Score = 1 - (max_member_skills - avg_member_skills) / max_member_skills
    4. Diversity Score = unique_domains / total_domains
    5. Final = 0.40 * coverage_avg + 0.30 * balance + 0.30 * diversity → ×100
    """
    if len(members) < 2:
        return {"error": "Minimum 2 members required for compatibility analysis"}

    # Aggregate team skills
    all_skills = list(set(skill for m in members for skill in m.get("skills", [])))

    # Domain coverage per category
    domain_coverage = {}
    for domain, canonical_skills in DOMAIN_SKILLS.items():
        covered = [s for s in canonical_skills if s in all_skills]
        domain_coverage[domain] = round((len(covered) / len(canonical_skills)) * 100)

    coverage_avg = sum(domain_coverage.values()) / len(domain_coverage)

    # Balance: how evenly are skills distributed among members?
    skill_counts = [len(m.get("skills", [])) for m in members]
    max_skills = max(skill_counts) if skill_counts else 1
    avg_skills = sum(skill_counts) / len(skill_counts)
    balance = (1 - (max_skills - avg_skills) / max_skills) * 100

    # Diversity: how many different domains are represented?
    unique_domains = set(m.get("domain", "") for m in members if m.get("domain"))
    diversity = (len(unique_domains) / len(DOMAIN_SKILLS)) * 100

    final_score = round(0.40 * coverage_avg + 0.30 * balance + 0.30 * diversity)
    final_score = max(0, min(100, final_score))

    # Qualitative suggestion
    if final_score >= 85:
        suggestion = "Excellent team! Strong skill coverage and domain diversity. Ready for high-complexity challenges."
    elif final_score >= 70:
        suggestion = "Good compatibility. Consider adding a specialist in weaker domain areas for full coverage."
    elif final_score >= 55:
        suggestion = "Moderate team fit. Significant skill gaps exist — recruit members with complementary expertise."
    else:
        suggestion = "Low compatibility. Team lacks diversity and coverage. Significant restructuring recommended."

    return {
        "final_score": final_score,
        "domain_coverage": domain_coverage,
        "balance_score": round(balance, 1),
        "diversity_score": round(diversity, 1),
        "total_skills": len(all_skills),
        "suggestion": suggestion,
    }


def suggest_optimal_team(all_members: List[Dict], team_size: int = 4) -> List[Dict]:
    """
    Greedy algorithm to suggest best team combination from a pool.
    Returns the combination with highest compatibility score.
    """
    from itertools import combinations
    best_score = -1
    best_team = []

    for combo in combinations(all_members, min(team_size, len(all_members))):
        result = compute_compatibility(list(combo))
        if result.get("final_score", 0) > best_score:
            best_score = result["final_score"]
            best_team = list(combo)

    return best_team
