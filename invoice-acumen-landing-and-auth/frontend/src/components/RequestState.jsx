import React from 'react';

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (data.message) return data.message;
  if (data.error) return data.error;
  const fieldMessage = Object.values(data).find((value) => typeof value === 'string');
  return fieldMessage || fallback;
}

export function LoadingSpinner({ label = 'Loading…' }) {
  return <p className="text-sm text-evo-muted" role="status">{label}</p>;
}

export function ErrorMessage({ title = 'Unable to load data', message }) {
  return (
    <div className="evo-card border border-red-500/30 bg-red-500/5 p-5" role="alert">
      <p className="font-medium text-red-400">{title}</p>
      {message && <p className="mt-1 text-sm text-evo-muted">{message}</p>}
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="evo-card p-6 text-center">
      <p className="font-medium text-white">{title}</p>
      {message && <p className="mt-1 text-sm text-evo-muted">{message}</p>}
    </div>
  );
}
