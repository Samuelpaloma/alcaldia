import "./Login.css";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { detectRoleByEmail, setAuth } from "./auth";
import { useNavigate, Link } from "react-router-dom";

function isCorporateEmail(email: string) {
  const publicDomains = /(gmail|yahoo|hotmail|outlook|icloud|proton)\.com$/i;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return false;
  if (publicDomains.test(domain)) return false;
  return /.+@.+/.test(email);
}

export default function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [message, setMessage] = useState<string>("");

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!isCorporateEmail(email)) {
      setMessage(t("auth.error_corporate_email"));
      return;
    }
    if (!password) {
      setMessage(t("auth.error_password_required"));
      return;
    }
    // Integration point: call backend to send a one-time code to email
    setStep("code");
    setMessage(t("auth.code_sent"));
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (code !== "123456") {
      setMessage(t("auth.error_code_incorrect"));
      return;
    }
    const role = detectRoleByEmail(email);
    setAuth({ email, role });
    setMessage(t("auth.login_success"));
    navigate(role === "admin" ? "/admin" : "/client", { replace: true });
  };

  return (
    <div className="section auth-center">
      <Card className="auth-card">
        <CardHeader>
          <CardTitle className="text-center">{t("auth.login_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "credentials" ? (
            <form className="grid gap-3" onSubmit={submitCredentials}>
              <label className="grid gap-1">
                <span className="label">{t("auth.email")}</span>
                <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder={t("auth.email_placeholder")} />
              </label>
              <label className="grid gap-1">
                <span className="label">{t("auth.password")}</span>
                <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder={t("auth.password_placeholder")} />
              </label>
              {message && <p className="hint">{message}</p>}
              <Button type="submit" className="btn-contrast w-full">{t("auth.continue")}</Button>
              <p className="auth-links"><span>{t("auth.no_account")}</span> <Link to="/register" className="underline">{t("auth.register_here")}</Link></p>
            </form>
          ) : (
            <form className="grid gap-3" onSubmit={verifyCode}>
              <label className="grid gap-1">
                <span className="label">{t("auth.code")}</span>
                <Input value={code} onChange={(e)=>setCode(e.target.value)} placeholder={t("auth.code_placeholder")} />
              </label>
              <p className="hint">{t("auth.code_hint")}</p>
              {message && <p className="hint">{message}</p>}
              <Button type="submit" className="btn-contrast w-full">{t("auth.verify_and_login")}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
