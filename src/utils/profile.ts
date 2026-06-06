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
