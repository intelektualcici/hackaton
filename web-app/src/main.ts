import "./style.css";
import { listenToAuth, signInAnonymousUser } from "./auth";
import { createUserProfileIfMissing, saveDisplayName, subscribeToUserProfile } from "./db";
import { generateAiText } from "./functions";

const loginButton = getElement<HTMLButtonElement>("loginButton");
const authStatus = getElement<HTMLParagraphElement>("authStatus");
const uidOutput = getElement<HTMLInputElement>("uidOutput");
const displayNameInput = getElement<HTMLInputElement>("displayNameInput");
const saveProfileButton = getElement<HTMLButtonElement>("saveProfileButton");
const profileStatus = getElement<HTMLParagraphElement>("profileStatus");
const promptInput = getElement<HTMLTextAreaElement>("promptInput");
const generateButton = getElement<HTMLButtonElement>("generateButton");
const aiStatus = getElement<HTMLParagraphElement>("aiStatus");
const aiResponse = getElement<HTMLPreElement>("aiResponse");

let currentUid: string | null = null;
let unsubscribeProfile: (() => void) | null = null;

loginButton.addEventListener("click", async () => {
  setBusy(loginButton, true);
  authStatus.textContent = "Signing in...";
  try {
    const user = await signInAnonymousUser();
    await createUserProfileIfMissing(user.uid);
  } catch (error) {
    authStatus.textContent = getErrorMessage(error);
  } finally {
    setBusy(loginButton, false);
  }
});

saveProfileButton.addEventListener("click", async () => {
  if (!currentUid) {
    profileStatus.textContent = "Sign in first.";
    return;
  }

  setBusy(saveProfileButton, true);
  profileStatus.textContent = "Saving...";
  try {
    await saveDisplayName(currentUid, displayNameInput.value);
    profileStatus.textContent = "Saved.";
  } catch (error) {
    profileStatus.textContent = getErrorMessage(error);
  } finally {
    setBusy(saveProfileButton, false);
  }
});

generateButton.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    aiStatus.textContent = "Enter a prompt.";
    return;
  }

  setBusy(generateButton, true);
  aiStatus.textContent = "Generating...";
  aiResponse.textContent = "";
  try {
    const response = await generateAiText(prompt);
    aiStatus.textContent = new Date(response.createdAt).toLocaleString();
    aiResponse.textContent = response.text;
  } catch (error) {
    aiStatus.textContent = getErrorMessage(error);
  } finally {
    setBusy(generateButton, false);
  }
});

listenToAuth(async (user) => {
  unsubscribeProfile?.();
  currentUid = user?.uid ?? null;
  uidOutput.value = currentUid ?? "";
  authStatus.textContent = currentUid ? "Signed in anonymously." : "You are not signed in.";

  if (!currentUid) {
    displayNameInput.value = "";
    return;
  }

  try {
    await createUserProfileIfMissing(currentUid);
    unsubscribeProfile = subscribeToUserProfile(currentUid, (profile) => {
      if (profile && document.activeElement !== displayNameInput) {
        displayNameInput.value = profile.displayName;
      }
    });
  } catch (error) {
    authStatus.textContent = getErrorMessage(error);
  }
});

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element: ${id}`);
  }
  return element as T;
}

function setBusy(button: HTMLButtonElement, busy: boolean): void {
  button.disabled = busy;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error.";
}
