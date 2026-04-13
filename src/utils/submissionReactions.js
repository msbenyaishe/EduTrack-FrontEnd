const STORAGE_KEY = 'teacherSubmissionReactions';

export const REACTION_OPTIONS = ['👍', '👏', '🔥', '✅', '🎉'];

const buildReactionKeys = (submissionId) => {
  const value = String(submissionId ?? '');
  return [value].filter(Boolean);
};

export const getSubmissionReactions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const toReactionKeys = (submissionId, extraKeys = []) => {
  const baseKeys = buildReactionKeys(submissionId);
  const additional = (extraKeys || []).map((key) => String(key ?? '')).filter(Boolean);
  return [...new Set([...baseKeys, ...additional])];
};

export const saveSubmissionReaction = (submissionId, reaction, extraKeys = []) => {
  const current = getSubmissionReactions();
  const keys = toReactionKeys(submissionId, extraKeys);
  const baseKey = String(submissionId ?? '');
  
  // Toggle off if it's already the same reaction
  if (current[baseKey] === reaction) {
    keys.forEach((key) => delete current[key]);
  } else {
    keys.forEach((key) => {
      current[key] = reaction;
    });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current;
};

export const getSubmissionReaction = (submissionId, extraKeys = []) => {
  const reactions = getSubmissionReactions();
  const key = toReactionKeys(submissionId, extraKeys).find((candidate) => reactions[candidate]);
  return key ? reactions[key] : null;
};
