/**
 * CV Data Validation Rules
 */

export interface ValidationError {
  field: string;
  message: string;
}

export function validateExperience(exp: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!exp.title?.trim()) {
    errors.push({ field: 'title', message: 'Position title is required' });
  }

  if (!exp.company?.trim()) {
    errors.push({ field: 'company', message: 'Company name is required' });
  }

  if (!exp.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  }

  if (!exp.isCurrent && !exp.endDate) {
    errors.push({ field: 'endDate', message: 'End date is required or mark as current' });
  }

  if (exp.startDate && exp.endDate && exp.startDate > exp.endDate) {
    errors.push({ field: 'endDate', message: 'End date cannot be before start date' });
  }

  return errors;
}

export function validateEducation(edu: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!edu.degree?.trim()) {
    errors.push({ field: 'degree', message: 'Degree/Program is required' });
  }

  if (!edu.field?.trim()) {
    errors.push({ field: 'field', message: 'Field of study is required' });
  }

  if (!edu.institution?.trim()) {
    errors.push({ field: 'institution', message: 'School/Institution is required' });
  }

  if (!edu.year) {
    errors.push({ field: 'year', message: 'Graduation year is required' });
  } else if (edu.year < 1900 || edu.year > 2100) {
    errors.push({ field: 'year', message: 'Please enter a valid year' });
  }

  if (edu.startYear && edu.startYear > edu.year) {
    errors.push({ field: 'startYear', message: 'Start year cannot be after graduation year' });
  }

  if (edu.gpa && (edu.gpa < 0 || edu.gpa > 4)) {
    errors.push({ field: 'gpa', message: 'GPA must be between 0 and 4' });
  }

  return errors;
}

export function validateSkill(skill: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!skill.category?.trim()) {
    errors.push({ field: 'category', message: 'Skill category is required' });
  }

  if (!skill.skills || skill.skills.length === 0) {
    errors.push({ field: 'skills', message: 'At least one skill is required' });
  } else {
    skill.skills.forEach((s: string, idx: number) => {
      if (!s?.trim()) {
        errors.push({ field: `skills.${idx}`, message: 'Skill cannot be empty' });
      }
    });
  }

  return errors;
}

export function validateLanguage(lang: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!lang.language?.trim()) {
    errors.push({ field: 'language', message: 'Language is required' });
  }

  if (!lang.proficiency) {
    errors.push({ field: 'proficiency', message: 'Proficiency level is required' });
  }

  return errors;
}

export function validateCertification(cert: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!cert.name?.trim()) {
    errors.push({ field: 'name', message: 'Certification name is required' });
  }

  if (cert.dateIssued && cert.expiryDate && cert.dateIssued > cert.expiryDate) {
    errors.push({ field: 'expiryDate', message: 'Expiry date cannot be before issue date' });
  }

  return errors;
}

export function validateProject(proj: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!proj.name?.trim()) {
    errors.push({ field: 'name', message: 'Project name is required' });
  }

  if (!proj.description?.trim()) {
    errors.push({ field: 'description', message: 'Project description is required' });
  }

  if (!proj.technologies || proj.technologies.length === 0) {
    errors.push({ field: 'technologies', message: 'At least one technology is required' });
  } else {
    proj.technologies.forEach((t: string, idx: number) => {
      if (!t?.trim()) {
        errors.push({ field: `technologies.${idx}`, message: 'Technology cannot be empty' });
      }
    });
  }

  if (proj.url && !isValidUrl(proj.url)) {
    errors.push({ field: 'url', message: 'Please enter a valid URL' });
  }

  if (proj.startDate && proj.endDate && proj.startDate > proj.endDate) {
    errors.push({ field: 'endDate', message: 'End date cannot be before start date' });
  }

  return errors;
}

function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}
