"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserAuthClient } from "@/lib/auth/client";

export function SignInForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        setError(null);

        startTransition(async () => {
          const authClient = getBrowserAuthClient();

          if (!otpSent) {
            const { error: signInError } = await authClient.emailOtp.sendVerificationOtp({
              email,
              type: "sign-in",
            });

            if (signInError) {
              setError(signInError.message ?? "Unable to send the verification code.");
              return;
            }

            setOtpSent(true);
            setMessage("Verification code sent. Enter it below to continue.");
            return;
          }

          const { error: verifyError } = await authClient.signIn.emailOtp({
            email,
            otp,
          });

          if (verifyError) {
            setError(verifyError.message ?? "Unable to verify the code.");
            return;
          }

          router.push(nextPath);
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="owner@subco.com"
        />
      </div>

      {otpSent ? (
        <div className="space-y-2">
          <Label htmlFor="email-otp">Verification code</Label>
          <Input
            id="email-otp"
            name="otp"
            inputMode="numeric"
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="123456"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={isPending || email.length === 0 || (otpSent && otp.length === 0)}
        >
          {isPending
            ? otpSent
              ? "Verifying..."
              : "Sending code..."
            : otpSent
              ? "Verify code"
              : "Send code"}
        </Button>
        {otpSent ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              setError(null);
              setMessage(null);
              setOtp("");
              setOtpSent(false);
            }}
          >
            Use a different email
          </Button>
        ) : null}
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
