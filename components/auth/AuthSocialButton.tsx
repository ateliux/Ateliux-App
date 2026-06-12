import { MotionButton } from "../motion";

type AuthSocialButtonProps = {
  provider: "google" | "apple";
  label: string;
};

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 20.6c-1.32 0-2.31-.69-3.26-.69-.94 0-2.06.72-3.32.72-1.74 0-3.35-1.01-4.24-2.58-1.81-3.15-.46-7.83 1.31-10.4 .87-1.27 2.12-2.08 3.48-2.1 1.25-.02 2.43.84 3.2.84.77 0 2.2-1.02 3.69-.87 1.55.15 2.95.77 3.84 1.94-3.05 1.83-2.53 6.32.53 7.54-.73 1.84-1.6 3.9-3.24 5.6-1.12 1.16-2.23 2.3-3.69 2.3h-.3zm-1.87-18.7c.92-.12 1.94.38 2.58 1.13.62.72 1.05 1.7 1.01 2.64-.99.04-2.07-.44-2.72-1.17-.66-.75-1.13-1.81-1-2.73.01-.01.07-.01.13-.01z" />
    </svg>
  );
}

export function AuthSocialButton({
  provider,
  label,
}: AuthSocialButtonProps) {
  return (
    <MotionButton
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1A1B1E] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#25262A] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#121214]"
    >
      {provider === "google" ? <GoogleIcon /> : <AppleIcon />}
      {label}
    </MotionButton>
  );
}
