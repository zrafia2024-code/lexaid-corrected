import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Settings as SettingsIcon, Languages, Mic, Info, ShieldCheck, User, LogIn, LogOut, CheckCircle2, HardDrive } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import VoiceInput from "@/components/VoiceInput";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { t, lang } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const [testTranscript, setTestTranscript] = useState("");
  const isUr = lang === "ur";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight text-foreground ${isUr ? "font-urdu text-3xl" : ""}`}>
              {t("settings.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isUr ? "زبان، صوتی معاون اور ایپ ترتیبات" : "Language, voice support and application settings"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5">
        {/* Language Selection */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-accent" />
              <div>
                <h3 className={`text-base font-bold text-foreground ${isUr ? "font-urdu text-lg" : ""}`}>
                  {t("settings.language")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isUr ? "ایپ کے تمام متن اور قانونی تجزیے کی زبان منتخب کریں" : "Select language for analysis and UI"}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </Card>

        {/* Voice Assistant */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <Mic className="h-5 w-5 text-accent" />
            <div>
              <h3 className={`text-base font-bold text-foreground ${isUr ? "font-urdu text-lg" : ""}`}>
                {t("settings.voice")}
              </h3>
              <p className={`text-xs text-muted-foreground ${isUr ? "font-urdu" : ""}`}>
                {t("settings.voiceDesc")}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            {isUr
              ? "اردو اور انگریزی دونوں میں مائیکروفون کے ذریعے بول کر مسئلہ بیان کرنے کی سہولت دستیاب ہے۔ نیچے مائیکروفون ٹیسٹ کریں:"
              : "Supports speech-to-text in both Urdu (ur-PK) and English (en-PK). Test your microphone live below:"}
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <VoiceInput
              onTranscript={(txt) => setTestTranscript((prev) => (prev ? `${prev} ${txt}` : txt))}
            />
            {testTranscript && (
              <div className="p-2.5 bg-white border border-slate-200 rounded text-xs">
                <span className="font-semibold text-slate-500 block mb-1">
                  {isUr ? "پہچانا گیا متن:" : "Detected text:"}
                </span>
                <p className={`text-slate-800 ${isUr ? "font-urdu text-sm" : ""}`}>{testTranscript}</p>
                <button
                  type="button"
                  onClick={() => setTestTranscript("")}
                  className="mt-2 text-[11px] text-red-600 hover:underline"
                >
                  {isUr ? "صاف کریں" : "Clear"}
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Account & Storage Overview */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-accent" />
              <div>
                <h3 className={`text-base font-bold text-foreground ${isUr ? "font-urdu text-lg" : ""}`}>
                  {isUr ? "اکاؤنٹ اور ڈیٹا" : "Account & Data"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isUr
                    ? "آپ کے محفوظ کردہ مقدمات اور قانونی دستاویزات کی حالت"
                    : "Status of your saved cases and legal documents"}
                </p>
              </div>
            </div>
            <Badge
              variant={isAuthenticated ? "default" : "secondary"}
              className={isAuthenticated ? "bg-emerald-600 text-white gap-1" : "gap-1"}
            >
              {isAuthenticated ? <CheckCircle2 className="h-3 w-3" /> : <HardDrive className="h-3 w-3" />}
              {isAuthenticated
                ? (isUr ? "لاگ ان شدہ" : "Connected Account")
                : (isUr ? "مقامی ڈیوائس اسٹوریج" : "Local Device Storage")}
            </Badge>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3 text-xs">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isUr ? "ای میل:" : "Email:"}</span>
                  <span className="font-semibold text-slate-800">{user.email || user.full_name}</span>
                </div>
                {user.full_name && user.full_name !== user.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{isUr ? "نام:" : "Name:"}</span>
                    <span className="font-semibold text-slate-800">{user.full_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">{isUr ? "کلاؤڈ سنک:" : "Cloud Sync:"}</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isUr ? "فعال (کیسز تمام آلات پر محفوظ ہیں)" : "Enabled (Cases synced across devices)"}
                  </span>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t("common.logout")}</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <p className={`font-semibold text-slate-800 ${isUr ? "font-urdu text-sm" : ""}`}>
                    {isUr ? "آپ بطور مہمان استعمال کر رہے ہیں" : "You are currently in Guest Mode"}
                  </p>
                  <p className={`text-slate-600 text-[11px] leading-relaxed ${isUr ? "font-urdu" : ""}`}>
                    {isUr
                      ? "آپ کے تمام تجزیے اور مقدمات اس ڈیوائس پر محفوظ رہتے ہیں۔ اگر آپ اپنے مقدمات دوسرے کمپیوٹر یا موبائل پر بھی دیکھنا چاہتے ہیں تو لاگ ان کریں۔"
                      : "Your analyzed cases and documents are saved safely on this device. Sign in or create a free account if you would like to access them across multiple devices."}
                  </p>
                </div>
                <div className="pt-1">
                  <Button asChild size="sm" className="gap-2 text-xs">
                    <Link to="/login">
                      <LogIn className="h-3.5 w-3.5" />
                      <span>{isUr ? "اکاؤنٹ میں داخل ہوں یا رجسٹر کریں" : "Sign In or Register"}</span>
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* About LEXAID */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-accent" />
            <h3 className={`text-base font-bold text-foreground ${isUr ? "font-urdu text-lg" : ""}`}>
              {t("settings.about")}
            </h3>
          </div>
          <p className={`text-xs leading-relaxed text-slate-600 ${isUr ? "font-urdu text-sm" : ""}`}>
            {t("settings.aboutText")}
          </p>
          <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground border-t border-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Based on Constitution of Pakistan 1973 &amp; Statutory Laws</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
