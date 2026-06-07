const DATE_PARTS = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function calculateAge(dateOfBirth?: string, today = new Date()) {
  if (!dateOfBirth) {
    return undefined;
  }

  const match = DATE_PARTS.exec(dateOfBirth);
  if (!match) {
    return undefined;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const birthDate = new Date(year, month - 1, day);

  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
    return undefined;
  }

  let age = today.getFullYear() - year;
  const hasHadBirthdayThisYear =
    today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() >= day);

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age >= 0 ? age : undefined;
}

export function withCalculatedAge<T extends { dateOfBirth?: string; age?: number }>(profile: T): T {
  return {
    ...profile,
    age: calculateAge(profile.dateOfBirth)
  };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ordinalSuffix(day: number) {
  if (day >= 11 && day <= 13) {
    return 'ᵗʰ';
  }

  if (day % 10 === 1) {
    return 'ˢᵗ';
  }
  if (day % 10 === 2) {
    return 'ⁿᵈ';
  }
  if (day % 10 === 3) {
    return 'ʳᵈ';
  }
  return 'ᵗʰ';
}

export function formatDateOfBirth(dateOfBirth?: string) {
  if (!dateOfBirth) {
    return 'Not set';
  }

  const match = DATE_PARTS.exec(dateOfBirth);
  if (!match) {
    return dateOfBirth;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return dateOfBirth;
  }

  return `${day}${ordinalSuffix(day)} ${MONTH_NAMES[month - 1]} ${year}`;
}
