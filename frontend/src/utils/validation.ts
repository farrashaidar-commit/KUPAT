export type ValidationErrors = Record<string, string[]>;

export function normalizeValidationErrors(payload: unknown): ValidationErrors | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const entries = Object.entries(payload as Record<string, unknown>);
  if (!entries.length) {
    return null;
  }

  return Object.fromEntries(
    entries.map(([field, messages]) => {
      if (Array.isArray(messages)) {
        return [field, messages.filter((message): message is string => typeof message === 'string')];
      }

      if (typeof messages === 'string') {
        return [field, [messages]];
      }

      return [field, []];
    })
  );
}

export function getFriendlyValidationMessages(errors: ValidationErrors | null | undefined): string[] {
  const messages = Object.entries(errors ?? {}).flatMap(([field, fieldErrors]) =>
    fieldErrors
      .map((message) => getFriendlyValidationMessage(field, message))
      .filter((message): message is string => Boolean(message))
  );

  return Array.from(new Set(messages));
}

function getFriendlyValidationMessage(field: string, message: string): string | null {
  const normalized = message.toLowerCase();

  if (field === 'email' && /already been taken|sudah terdaftar/.test(normalized)) {
    return 'Email sudah terdaftar.';
  }

  if (field === 'password' && /confirmation.*match|tidak cocok/.test(normalized)) {
    return 'Konfirmasi password tidak cocok.';
  }

  if (field === 'password' && /(must be at least|at least|minimal|characters|karakter)/.test(normalized)) {
    return 'Password minimal 8 karakter.';
  }

  if (field === 'password' && /required|wajib/.test(normalized)) {
    return 'Password wajib diisi.';
  }

  if (field === 'name' && /required|wajib/.test(normalized)) {
    return 'Nama wajib diisi.';
  }

  if (field === 'email' && /required|wajib/.test(normalized)) {
    return 'Email wajib diisi.';
  }

  if (field === 'email' && /email/.test(normalized) && !/required|wajib|already been taken|sudah terdaftar/.test(normalized)) {
    return 'Email tidak valid.';
  }

  return message;
}
