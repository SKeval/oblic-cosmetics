import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { resetPassword } from "../api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.detail || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container py-20 text-center" data-testid="reset-password-no-token">
        <p className="text-ink-soft">This reset link is missing a token. Please request a new one from the account page.</p>
        <Link to="/account" className="inline-block mt-6 text-[13px] underline underline-offset-4">Back to Account</Link>
      </div>
    );
  }

  return (
    <div className="container py-20 flex justify-center" data-testid="reset-password-page">
      <div className="w-full max-w-sm bg-paper border border-line rounded-[4px] p-8">
        <div className="w-12 h-12 rounded-full bg-plum text-cream flex items-center justify-center mb-6"><Lock size={20} strokeWidth={1.6} /></div>
        <p className="text-[12px] tracking-[0.22em] uppercase text-muted mb-2">Oblic Account</p>
        <h1 className="font-display text-3xl mb-6">Set a new password</h1>

        {done ? (
          <div>
            <p className="text-ink-soft text-[14.5px] mb-6">Your password has been reset. You can now sign in with your new password.</p>
            <button onClick={() => navigate("/account")} data-testid="reset-password-done-btn"
              className="w-full bg-plum text-cream py-3.5 rounded-full text-[13px] tracking-[0.14em] uppercase hover:bg-ink transition-colors">
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password"
              data-testid="reset-password-new" className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password"
              data-testid="reset-password-confirm" className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            {error && <p className="text-red-600 text-[13px]" data-testid="reset-password-error">{error}</p>}
            <button type="submit" disabled={loading} data-testid="reset-password-submit"
              className="w-full bg-plum text-cream py-3.5 rounded-full text-[13px] tracking-[0.14em] uppercase hover:bg-ink transition-colors disabled:opacity-50">
              {loading ? "Please wait…" : "Reset Password"}
            </button>
          </form>
        )}
        <Link to="/account" className="block text-center text-[13px] text-muted hover:text-ink mt-6 underline underline-offset-4">Back to Account</Link>
      </div>
    </div>
  );
}
