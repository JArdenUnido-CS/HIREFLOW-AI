"""
HIREFLOW-AI ML Training Dataset Generation
Generates synthetic training data for candidate-job matching model
"""

import json
import random
from datetime import datetime, timedelta

# Sample skills pool
TECHNICAL_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Express",
    "MySQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS",
    "Machine Learning", "TensorFlow", "PyTorch", "Scikit-learn",
    "Git", "REST API", "GraphQL", "Microservices", "SQL"
]

SOFT_SKILLS = [
    "Communication", "Leadership", "Problem-solving", "Teamwork",
    "Project Management", "Time Management", "Adaptability",
    "Critical Thinking", "Creativity", "Analytical Skills"
]

EXPERIENCE_LEVELS = ["Junior", "Mid-level", "Senior", "Expert"]

CERTIFICATIONS = [
    "AWS Solutions Architect", "Google Cloud Associate", "Azure Administrator",
    "Certified Kubernetes Administrator", "AWS Developer Associate",
    "HashiCorp Certified: Terraform Associate", "CompTIA Security+"
]

LOCATIONS = ["Manila", "Makati", "BGC", "Cebu", "Davao", "Remote"]

JOB_TITLES = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "ML Engineer", "Data Scientist", "DevOps Engineer", "QA Engineer"
]

DEPARTMENTS = ["Engineering", "Data Science", "DevOps", "QA"]


def generate_candidate_features(candidate_id):
    """Generate feature vector for a candidate"""
    skills = random.sample(TECHNICAL_SKILLS, k=random.randint(3, 8))
    soft_skills = random.sample(SOFT_SKILLS, k=random.randint(2, 5))
    years_experience = random.randint(0, 20)
    has_certification = random.choice([0, 1])
    location = random.choice(LOCATIONS)
    
    # Encode features
    features = {
        "candidate_id": candidate_id,
        "years_experience": years_experience,
        "skill_count": len(skills),
        "soft_skill_count": len(soft_skills),
        "has_certification": has_certification,
        "is_remote": 1 if location == "Remote" else 0,
        "technical_skill_score": len(skills) / len(TECHNICAL_SKILLS),
        "soft_skill_score": len(soft_skills) / len(SOFT_SKILLS),
    }
    
    # Add individual skill indicators
    for i, skill in enumerate(TECHNICAL_SKILLS):
        features[f"skill_{skill.lower().replace(' ', '_')}"] = 1 if skill in skills else 0
    
    # Store metadata
    metadata = {
        "skills": skills,
        "soft_skills": soft_skills,
        "location": location,
        "certifications": [random.choice(CERTIFICATIONS)] if has_certification else []
    }
    
    return features, metadata


def generate_job_features(job_id):
    """Generate feature vector for a job"""
    required_skills = random.sample(TECHNICAL_SKILLS, k=random.randint(3, 6))
    preferred_skills = random.sample(TECHNICAL_SKILLS, k=random.randint(1, 3))
    required_experience = random.randint(0, 10)
    requires_remote = random.choice([0, 1])
    
    features = {
        "job_id": job_id,
        "required_experience": required_experience,
        "required_skill_count": len(required_skills),
        "preferred_skill_count": len(preferred_skills),
        "requires_remote": requires_remote,
        "required_skill_score": len(required_skills) / len(TECHNICAL_SKILLS),
        "preferred_skill_score": len(preferred_skills) / len(TECHNICAL_SKILLS),
    }
    
    # Add individual skill requirements
    for i, skill in enumerate(TECHNICAL_SKILLS):
        features[f"requires_skill_{skill.lower().replace(' ', '_')}"] = 1 if skill in required_skills else 0
    
    metadata = {
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "title": random.choice(JOB_TITLES),
        "department": random.choice(DEPARTMENTS)
    }
    
    return features, metadata


def calculate_match_label(candidate_features, job_features, candidate_meta, job_meta):
    """
    Calculate if candidate is good match for job (0 or 1)
    Match criteria:
    - Has most required skills (>70%)
    - Experience >= required
    - Remote preference matches
    """
    required_skills = set(job_meta["required_skills"])
    candidate_skills = set(candidate_meta["skills"])
    
    # Skill match percentage
    matching_skills = len(required_skills & candidate_skills)
    skill_match_ratio = matching_skills / len(required_skills) if required_skills else 0
    
    # Experience requirement met
    experience_met = candidate_features["years_experience"] >= job_features["required_experience"]
    
    # Remote preference match
    remote_match = (candidate_features["is_remote"] >= job_features["requires_remote"])
    
    # Overall match: 70%+ skill match + experience requirement
    is_match = (skill_match_ratio >= 0.7) and experience_met and remote_match
    
    return 1 if is_match else 0


def generate_training_data(num_samples=500):
    """Generate training dataset with features and labels"""
    training_data = []
    
    for sample_idx in range(num_samples):
        candidate_id = f"cand_{sample_idx}"
        job_id = f"job_{sample_idx % 50}"  # Reuse jobs
        
        # Generate features
        cand_features, cand_meta = generate_candidate_features(candidate_id)
        job_features, job_meta = generate_job_features(job_id)
        
        # Calculate match label
        label = calculate_match_label(cand_features, job_features, cand_meta, job_meta)
        
        # Combine features
        combined_features = {**cand_features, **job_features}
        combined_features["label"] = label
        combined_features["candidate_metadata"] = cand_meta
        combined_features["job_metadata"] = job_meta
        
        training_data.append(combined_features)
    
    return training_data


def save_training_data(training_data, filename="training_data.json"):
    """Save training data to JSON"""
    with open(filename, 'w') as f:
        json.dump(training_data, f, indent=2)
    print(f"✓ Saved {len(training_data)} samples to {filename}")
    return training_data


if __name__ == "__main__":
    print("🔄 Generating ML training dataset...")
    training_data = generate_training_data(num_samples=500)
    
    # Save to file
    save_training_data(training_data, "ml/training_data.json")
    
    # Print statistics
    labels = [d["label"] for d in training_data]
    matches = sum(labels)
    non_matches = len(labels) - matches
    
    print(f"\n📊 Dataset Statistics:")
    print(f"  Total samples: {len(training_data)}")
    print(f"  Good matches: {matches} ({100*matches/len(labels):.1f}%)")
    print(f"  Non-matches: {non_matches} ({100*non_matches/len(labels):.1f}%)")
    print(f"  Class balance: {matches/non_matches:.2f}:1")
