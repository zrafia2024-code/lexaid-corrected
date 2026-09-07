import { CATEGORIES, normalizeCategory, getQuestionsForCategory, runReasoning } from "../../base44/shared/legalReasoning";
import { retrieve } from "../../base44/shared/retrieval";

// Default seed precedents from Pakistani law and Constitution
const INITIAL_PRECEDENTS = [
  {
    id: "prec-1",
    title: "Article 9 — Security of person (Constitution of Pakistan)",
    titleUr: "آرٹیکل 9 — سلامتی شخص (آئین پاکستان 1973)",
    caseId: "CONST-ART-9",
    court: "Statute",
    date: "1973",
    category: "constitutional",
    summary: "No person shall be deprived of life or liberty save in accordance with law. Fundamental protection against illegal detention, state abuse, and unlawful eviction without due process.",
    summaryUr: "قانون کے مطابق ہونے کے سوا کسی شخص کو زندگی یا آزادی سے محروم نہیں کیا جائے گا۔ بلا جواز گرفتاری، ریاستی اختیارات کے ناجائز استعمال اور زبردستی بے دخلی کے خلاف بنیادی آئینی تحفظ۔",
    fullText: "Article 9 of the Constitution of the Islamic Republic of Pakistan guarantees that no person shall be deprived of life or liberty save in accordance with law. The Supreme Court has repeatedly affirmed that 'life' includes the right to livelihood, dignity, and shelter.",
    keywords: ["article 9", "security", "life", "liberty", "detention", "constitution", "fundamental right"],
    sourceType: "statute",
    citation: "Constitution of Pakistan 1973, Art. 9",
    isSample: false,
  },
  {
    id: "prec-2",
    title: "Punjab Rented Premises Act 2009 — Section 15 (Eviction Grounds)",
    titleUr: "پنجاب رینٹڈ پریمسز ایکٹ 2009 — دفعہ 15 (بے دخلی کی قانونی وجوہات)",
    caseId: "PRPA-2009-S15",
    court: "Statute",
    date: "2009",
    category: "tenancy",
    summary: "Landlord cannot evict a tenant arbitrarily. Eviction requires specific statutory grounds: expiry of tenancy, default in rent payment, subletting without consent, or personal bona fide need.",
    summaryUr: "مالک مکان اپنی مرضی سے کرایہ دار کو بے دخل نہیں کر سکتا۔ بے دخلی کے لیے کرایہ نامے کی مدت ختم ہونا، کرائے میں تاخیر یا ذاتی ضروری ضرورت جیسے قانونی دلائل رینٹ ٹربیونل کے سامنے ثابت کرنا لازمی ہے۔",
    fullText: "Under Section 15 of Punjab Rented Premises Act 2009, an application for eviction can only be submitted to the Rent Tribunal on verified grounds including expiry of tenancy period, failure to pay rent within 30 days of due date, or breach of written tenancy agreement.",
    keywords: ["rent", "tenancy", "eviction", "tenant", "landlord", "written agreement", "rent tribunal"],
    sourceType: "statute",
    citation: "Punjab Rented Premises Act 2009, Sec. 15",
    isSample: false,
  },
  {
    id: "prec-3",
    title: "Sindh Rented Premises Ordinance 1979 — Protection from Dispossession",
    titleUr: "سندھ رینٹڈ پریمسز آرڈیننس 1979 — غیر قانونی بے دخلی سے تحفظ",
    caseId: "SRPO-1979-S15",
    court: "Statute",
    date: "1979",
    category: "tenancy",
    summary: "Tenant cannot be forcefully dispossessed without an order of the Rent Controller. Forceful eviction or utility disconnection by landlord is a penal offence.",
    summaryUr: "رینٹ کنٹرولر کے باضابطہ حکم کے بغیر کرایہ دار کو زبردستی بے دخل نہیں کیا جا سکتا۔ بجلی، پانی یا گیس کی بندش مالک کی طرف سے قابل سزا جرم ہے۔",
    fullText: "Under Sindh Rented Premises Ordinance, a landlord is strictly prohibited from cutting off electricity, water, or gas or attempting forceful entry without a decree from the Rent Controller.",
    keywords: ["rent", "sindh", "eviction", "controller", "dispossession", "utilities", "notice"],
    sourceType: "statute",
    citation: "SRPO 1979, Sec. 15 & 17",
    isSample: false,
  },
  {
    id: "prec-4",
    title: "Family Courts Act 1964 — Maintenance & Dower (Mehar)",
    titleUr: "فیملی کورٹس ایکٹ 1964 — نفقہ اور مہر کا تحفظ",
    caseId: "FCA-1964-S5",
    court: "Statute",
    date: "1964",
    category: "family",
    summary: "Family Courts have exclusive jurisdiction over dissolution of marriage, maintenance for wife and minors, recovery of prompt/deferred dower (mehar), and custody of children.",
    summaryUr: "فیملی کورٹس کو تنسیخ نکاح، بیوی اور بچوں کے ماہانہ نفقہ، بقایا مہر اور بچوں کی حضانت کے معاملات فوری حل کرنے کے خصوصی اختیارات حاصل ہیں۔",
    fullText: "Section 5 read with Schedule of Family Courts Act 1964 empowers the Family Court to adjudicate expeditiously claims of maintenance for wife and children, recovery of dowry articles, and mehar.",
    keywords: ["family", "maintenance", "mehar", "dower", "custody", "divorce", "khula", "children"],
    sourceType: "statute",
    citation: "Family Courts Act 1964, Sec. 5",
    isSample: false,
  },
  {
    id: "prec-5",
    title: "Guardians and Wards Act 1890 — Welfare of the Minor",
    titleUr: "گارڈینز اینڈ وارڈز ایکٹ 1890 — بچے کی فلاح و بہبود",
    caseId: "GWA-1890-S17",
    court: "Statute",
    date: "1890",
    category: "family",
    summary: "In determining custody, the welfare of the minor is the supreme and paramount consideration for the court, overriding mechanical claims.",
    summaryUr: "بچوں کی حضانت اور تحویل کے فیصلے میں عدالت کے لیے بچے کی تعلیم، صحت اور فلاح و بہبود ہی سب سے بنیادی اور لازمی اصول ہے۔",
    fullText: "Section 17 of the Guardians and Wards Act establishes that the court shall be guided by what appears to be for the welfare of the minor consistent with the law to which the minor is subject.",
    keywords: ["custody", "minor", "welfare of minor", "guardian", "children", "family"],
    sourceType: "statute",
    citation: "Guardians and Wards Act 1890, Sec. 17",
    isSample: false,
  },
  {
    id: "prec-6",
    title: "Pakistan Penal Code (PPC) — Section 489-F (Dishonestly Issuing Cheque)",
    titleUr: "تعزیرات پاکستان — دفعہ 489-F (بدنیتی سے چیک جاری کرنا)",
    caseId: "PPC-1860-S489F",
    court: "Statute",
    date: "1860",
    category: "contract",
    summary: "Dishonestly issuing a cheque towards repayment of loan or fulfillment of an obligation that bounces is punishable with imprisonment up to 3 years or fine.",
    summaryUr: "قرض کی واپسی یا معاہدے کے تحت دیا گیا چیک ڈس آنر (باؤنس) ہونے پر 3 سال تک قید اور جرمانہ کی سزا کا قانون ہے۔",
    fullText: "Whoever dishonestly issues a cheque towards repayment of a loan or fulfillment of an obligation which is dishonoured on presentation shall be punished with imprisonment up to three years or with fine.",
    keywords: ["cheque", "dishonour", "bounce", "489-f", "loan", "debt", "contract", "payment"],
    sourceType: "statute",
    citation: "PPC 1860, Sec. 489-F",
    isSample: false,
  },
  {
    id: "prec-7",
    title: "West Pakistan Land Revenue Act 1967 — Title & Mutation (Intiqal)",
    titleUr: "لینڈ ریونیو ایکٹ 1967 — اراضی انتقال اور ملکیتی حقوق",
    caseId: "LRA-1967-S42",
    court: "Statute",
    date: "1967",
    category: "property",
    summary: "Mutation (intiqal) in revenue records is for fiscal purposes; substantive ownership is proven by title deeds, registered registry, or continuous peaceful possession.",
    summaryUr: "ریونیو ریکارڈ میں انتقال محض مالیاتی حساب کے لیے ہوتا ہے، حقیقی ملکیت رجسٹرڈ بیع نامہ اور ملکیتی دستاویزات سے ثابت ہوتی ہے۔",
    fullText: "Section 42 of Land Revenue Act 1967 lays down procedure for making entry in record-of-rights. The superior courts have consistently held that mutation does not confer title in itself without registered transfer deed.",
    keywords: ["property", "land", "mutation", "intiqal", "registry", "fard", "possession", "title"],
    sourceType: "statute",
    citation: "Land Revenue Act 1967, Sec. 42",
    isSample: false,
  },
  {
    id: "prec-8",
    title: "Punjab Consumer Protection Act 2005 — Defective Products & Services",
    titleUr: "پنجاب تحفظ صارف ایکٹ 2005 — ناقص اشیاء اور خدمات کا معاوضہ",
    caseId: "PCPA-2005-S13",
    court: "Statute",
    date: "2005",
    category: "consumer",
    summary: "Manufacturer and seller are liable for defective products and deficient services. Consumer Court can award refund, damages, and replacement with simple 15-day written notice.",
    summaryUr: "وارنٹی والی اشیاء یا سروس میں خرابی کی صورت میں خریدار 15 دن کے نوٹس کے بعد ڈسٹرکٹ کنزیومر کورٹ سے رقم کی واپسی اور ہرجانہ لے سکتا ہے۔",
    fullText: "Under Punjab Consumer Protection Act 2005, any buyer who purchased goods or hired services can issue a 15-day legal notice for defects and claim compensation before the District Consumer Court.",
    keywords: ["consumer", "defective", "warranty", "refund", "notice", "service", "claim"],
    sourceType: "statute",
    citation: "Punjab Consumer Protection Act 2005, Sec. 13",
    isSample: false,
  },
  {
    id: "prec-9",
    title: "Industrial and Commercial Employment (Standing Orders) Ordinance 1968",
    titleUr: "اسٹینڈنگ آرڈرز آرڈیننس 1968 — ملازمین کی برطرفی کا تحفظ",
    caseId: "SO-1968-SO12",
    court: "Statute",
    date: "1968",
    category: "employment",
    summary: "Standing Order 12 prohibits termination of permanent workmen without one month's notice or wages in lieu thereof, stating explicit reason in writing.",
    summaryUr: "مستقل ملازم کو بغیر تحریری نوٹس یا ایک ماہ کی تنخواہ اور واضح ٹھوس وجہ کے نوکری سے فارغ نہیں کیا جا سکتا۔",
    fullText: "The services of a permanent workman shall not be terminated nor shall a workman be removed, retrenched, or discharged without explicit written reason stating the grounds for termination.",
    keywords: ["employment", "labour", "termination", "wages", "gratuity", "standing order 12", "notice"],
    sourceType: "statute",
    citation: "Standing Orders Ordinance 1968, SO 12",
    isSample: false,
  },
  {
    id: "prec-10",
    title: "Article 25 — Equality of Citizens (Constitution of Pakistan)",
    titleUr: "آرٹیکل 25 — شہریوں کی برابری (آئین پاکستان 1973)",
    caseId: "CONST-ART-25",
    court: "Statute",
    date: "1973",
    category: "constitutional",
    summary: "All citizens are equal before law and are entitled to equal protection of law. There shall be no discrimination on the basis of sex alone.",
    summaryUr: "تمام شہری قانون کی نظر میں برابر ہیں اور مساوی تحفظ کے حقدار ہیں۔ جنس یا نسل کی بنیاد پر کوئی امتیازی سلوک نہیں کیا جا سکتا۔",
    fullText: "Article 25 mandates equality before the law and equal protection of law for all citizens, guaranteeing fundamental non-discrimination and constitutional remedies under Article 199/184(3).",
    keywords: ["article 25", "equality", "discrimination", "fundamental rights", "constitution"],
    sourceType: "statute",
    citation: "Constitution of Pakistan 1973, Art. 25",
    isSample: false,
  },
  {
    id: "prec-11",
    title: "Section 506 PPC & Section 20 PECA — Criminal Intimidation & Cyberbullying",
    titleUr: "دفعہ 506 تعزیرات پاکستان اور دفعہ 20 پیکا — مجرمانہ دھمکیاں اور سائبر بلینگ",
    caseId: "PPC-506-PECA-20",
    court: "Statute",
    date: "1860 / 2016",
    category: "harassment",
    summary: "Threats by classmates, physical intimidation, or abusive WhatsApp messages constitute cognizable offences under Section 506 PPC and Section 20 of PECA 2016.",
    summaryUr: "کلاس فیلوز کی جانب سے دھمکیاں، تشدد یا سوشل میڈیا/واٹس ایپ پر بلینگ اور کردار کشی تعزیرات پاکستان دفعہ 506 اور پیکا 2016 کے تحت قابل گرفت جرم ہے۔",
    fullText: "Section 506 PPC penalizes criminal intimidation by threats of injury, reputation loss, or life with imprisonment up to 7 years. Section 20 PECA 2016 penalizes online harassment, stalking, and cyber defamation with up to 3 years imprisonment via FIA Cybercrime Wing.",
    keywords: ["bullying", "classmate", "harassment", "506", "peca", "threat", "cyberbullying", "school", "college", "دھمکی", "بلینگ", "ہراسگی", "سکول"],
    sourceType: "statute",
    citation: "PPC Sec. 506 / PECA Sec. 20",
    isSample: false,
  },
  {
    id: "prec-12",
    title: "Protection Against Harassment at Educational Institutions Act (Amended 2022)",
    titleUr: "تحفظ برائے انسداد ہراسگی ایکٹ (بشمول سکول، کالج، یونیورسٹیاں اور طلبہ)",
    caseId: "HARASS-ACT-2022",
    court: "Statute",
    date: "2022",
    category: "harassment",
    summary: "The 2022 amendment strictly covers educational institutions and students, requiring mandatory inquiry committees for bullying and peer harassment.",
    summaryUr: "سال 2022 کی قانونی ترمیم کے تحت تمام تعلیمی اداروں اور طلبہ کو تحفظ حاصل ہے اور اینٹی ہراسمنٹ کمیٹی یا محتسب کو فوری کارروائی کی قانونی پابندی ہے۔",
    fullText: "Protects all students from hostile campus environments, bullying, ragging, and intimidation by classmates or faculty.",
    keywords: ["harassment act", "campus bullying", "student rights", "ragging", "ombudsperson", "طلبہ", "ہراسگی", "کالج", "محتسب"],
    sourceType: "statute",
    citation: "Harassment Act 2010 / 2022",
    isSample: false,
  }
];

// Helper to get current authenticated user or persistent guest user
export function getCurrentUser() {
  // Check lexaid_local_user first
  try {
    const raw = localStorage.getItem("lexaid_local_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed;
    }
  } catch (e) {}

  // Check Supabase session token in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const item = JSON.parse(localStorage.getItem(key) || "{}");
        if (item?.user?.id) {
          return {
            id: item.user.id,
            email: item.user.email,
            token: item.access_token,
          };
        }
      }
    }
  } catch (e) {}

  // Safe device-persistent guest identity so case assessments are always saved
  try {
    let guestId = localStorage.getItem("lexaid_guest_id");
    if (!guestId) {
      guestId = "guest_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
      localStorage.setItem("lexaid_guest_id", guestId);
    }
    return {
      id: guestId,
      isGuest: true,
      email: "guest@lexaid.local",
      full_name: "Guest Citizen",
    };
  } catch (e) {}

  return { id: "guest_session", isGuest: true };
}

export function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  const user = getCurrentUser();
  if (user?.id) {
    headers["x-user-id"] = user.id;
  }
  if (user?.token) {
    headers["Authorization"] = `Bearer ${user.token}`;
  }
  return headers;
}

// User-scoped local storage helpers (keyed by user ID)
function getUserStoreKey(type) {
  const user = getCurrentUser();
  const uid = user?.id || "guest";
  return `lexaid_user_${uid}_${type}`;
}

function getUserStore(type, defaultValue = []) {
  const key = getUserStoreKey(type);
  if (!key) return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return defaultValue;
}

function setUserStore(type, data) {
  const key = getUserStoreKey(type);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage write error", e);
  }
}

// Purge any old unscoped global store keys to prevent data leaking
try {
  localStorage.removeItem("lexaid_cases");
  localStorage.removeItem("lexaid_documents");
} catch (e) {}

// Helper to format issues into natural, clear declarative sentences without "Whether"
function formatIssueSentence(text, isUr) {
  if (!text || typeof text !== "string") return "";
  let s = text.trim();
  if (isUr) {
    s = s.replace(/^کیا\s+/, "");
    s = s.replace(/\?+$/, "");
    if (!s.endsWith("۔") && !s.endsWith(".")) s += "۔";
    return s;
  }
  s = s.replace(/^whether\s+(or\s+not\s+)?/i, "");
  s = s.charAt(0).toUpperCase() + s.slice(1);
  s = s.replace(/\?+$/, "");
  if (!s.endsWith(".")) s += ".";
  return s;
}

// Derive clarifying questions directly from missing information points
function deriveQuestionsFromMissing(missingList, isUrdu, category) {
  if (!Array.isArray(missingList) || missingList.length === 0) {
    return getQuestionsForCategory(category, isUrdu ? "ur" : "en");
  }

  return missingList.map((item, index) => {
    let cleanText = String(item).trim();
    let qEn = cleanText;
    let qUr = cleanText;

    if (isUrdu) {
      qUr = cleanText.startsWith("کیا") ? cleanText : `کیا ${cleanText}`;
      if (!qUr.endsWith("؟") && !qUr.endsWith("?")) qUr += "؟";
      qEn = `Regarding factor: ${cleanText}`;
    } else {
      qEn = cleanText.endsWith("?") ? cleanText : `${cleanText}?`;
      if (!/^(is|are|do|does|did|have|has|was|were|can|could|will|would)/i.test(qEn)) {
        qEn = `Do you have or can you confirm: ${cleanText.replace(/\?$/, "")}?`;
      }
      qUr = `کیا اس بارے میں معلومات یا ثبوت موجود ہیں: ${cleanText}`;
    }

    return {
      key: `missing_factor_${index + 1}`,
      label: cleanText.replace(/\?|؟$/, "").slice(0, 75),
      urduLabel: cleanText.replace(/\?|؟$/, "").slice(0, 75),
      question: qEn,
      urduQuestion: qUr,
      type: "boolean",
      defaultWeight: index === 0 ? 30 : index === 1 ? 25 : 20,
      direction: "positive",
      options: [
        { value: "yes", label: "Yes", urduLabel: "ہاں", scoreDelta: 20 },
        { value: "no", label: "No", urduLabel: "نہیں", scoreDelta: -10 },
      ],
    };
  });
}

// Client object mirroring Base44 SDK and providing instant local reasoning
export const base44 = {
  auth: {
    me: async () => {
      const stored = localStorage.getItem("lexaid_local_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.email && !parsed.email.includes("lexaid.pk")) return parsed;
        } catch {}
      }
      return null;
    },
    logout: async (redirectUrl) => {
      localStorage.removeItem("lexaid_local_user");
      if (redirectUrl) window.location.href = redirectUrl;
    },
    loginViaEmailPassword: async (email, password) => {
      const user = { id: "user-" + Date.now(), email, full_name: email.split("@")[0], role: "user" };
      localStorage.setItem("lexaid_local_user", JSON.stringify(user));
      return user;
    },
    register: async ({ email, password }) => {
      return { ok: true };
    },
    verifyOtp: async ({ email, otpCode }) => {
      const user = { id: "user-" + Date.now(), email, full_name: email.split("@")[0], role: "user" };
      localStorage.setItem("lexaid_local_user", JSON.stringify(user));
      return { access_token: "token-" + Date.now() };
    },
    setToken: (token) => {},
    loginWithProvider: (provider, returnTo) => {
      window.location.href = returnTo || "/login";
    },
    resetPasswordRequest: async (email) => {
      return { ok: true };
    },
    resetPassword: async ({ resetToken, newPassword }) => {
      return { ok: true };
    },
    redirectToLogin: (returnTo) => {
      window.location.href = "/login?returnTo=" + encodeURIComponent(returnTo || "/");
    }
  },

  entities: {
    LegalCase: {
      list: async (sortBy = "-created_date", limit = 100) => {
        let remoteCases = null;
        try {
          const res = await fetch("/api/cases", {
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.cases && Array.isArray(data.cases)) {
              remoteCases = data.cases;
            }
          }
        } catch (err) {
          console.warn("Could not fetch remote cases, using local store:", err);
        }

        const localCases = getUserStore("cases", []);
        const mergedMap = new Map();
        localCases.forEach((c) => mergedMap.set(c.id, c));
        if (Array.isArray(remoteCases)) {
          remoteCases.forEach((c) => mergedMap.set(c.id, c));
        }

        const mergedList = Array.from(mergedMap.values()).sort((a, b) => {
          return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
        });

        setUserStore("cases", mergedList);
        return mergedList.slice(0, limit);
      },

      get: async (id) => {
        try {
          const res = await fetch(`/api/cases/${encodeURIComponent(id)}`, {
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.case) return data.case;
          }
        } catch (err) {
          console.warn("Could not fetch remote case by ID:", err);
        }

        const localCases = getUserStore("cases", []);
        const found = localCases.find((c) => c.id === id);
        if (found) return found;
        throw new Error("Case not found or unauthorized");
      },

      create: async (payload) => {
        const user = getCurrentUser();
        const userId = user?.id || "guest";

        const newCase = {
          id: payload.id || "case-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
          user_id: userId,
          created_date: payload.created_date || new Date().toISOString(),
          updated_date: new Date().toISOString(),
          ...payload,
        };

        let createdCase = null;
        try {
          const res = await fetch("/api/cases", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(newCase),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.case) createdCase = data.case;
          }
        } catch (err) {
          console.warn("Remote case create failed, falling back to local:", err);
        }

        const finalCase = createdCase || newCase;
        const currentLocal = getUserStore("cases", []);
        const updated = [finalCase, ...currentLocal.filter((c) => c.id !== finalCase.id)];
        setUserStore("cases", updated);
        return finalCase;
      },

      update: async (id, payload) => {
        let updatedCase = null;
        try {
          const res = await fetch(`/api/cases/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.case) updatedCase = data.case;
          }
        } catch (err) {
          console.warn("Remote case update failed:", err);
        }

        const currentLocal = getUserStore("cases", []);
        const idx = currentLocal.findIndex((c) => c.id === id);
        if (idx !== -1) {
          currentLocal[idx] = {
            ...currentLocal[idx],
            ...payload,
            updated_date: new Date().toISOString(),
          };
          setUserStore("cases", currentLocal);
          if (!updatedCase) updatedCase = currentLocal[idx];
        }

        return updatedCase || { id, ...payload };
      },

      delete: async (id) => {
        try {
          await fetch(`/api/cases/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
        } catch (err) {
          console.warn("Remote case delete failed:", err);
        }

        const currentLocal = getUserStore("cases", []);
        const remaining = currentLocal.filter((c) => c.id !== id);
        setUserStore("cases", remaining);
        return { ok: true };
      },
    },

    LegalDocument: {
      list: async (sortBy = "-created_date", limit = 50) => {
        let remoteDocs = null;
        try {
          const res = await fetch("/api/documents", {
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.documents && Array.isArray(data.documents)) {
              remoteDocs = data.documents;
            }
          }
        } catch (err) {
          console.warn("Could not fetch remote documents:", err);
        }

        const localDocs = getUserStore("documents", []);
        const mergedMap = new Map();
        localDocs.forEach((d) => mergedMap.set(d.id, d));
        if (Array.isArray(remoteDocs)) {
          remoteDocs.forEach((d) => mergedMap.set(d.id, d));
        }

        const mergedList = Array.from(mergedMap.values()).sort((a, b) => {
          return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
        });

        setUserStore("documents", mergedList);
        return mergedList.slice(0, limit);
      },

      create: async (payload) => {
        const user = getCurrentUser();
        const userId = user?.id || "guest";

        const newDoc = {
          id: payload.id || "doc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
          user_id: userId,
          created_date: payload.created_date || new Date().toISOString(),
          ...payload,
        };

        let createdDoc = null;
        try {
          const res = await fetch("/api/documents", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(newDoc),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.document) createdDoc = data.document;
          }
        } catch (err) {
          console.warn("Remote document create failed:", err);
        }

        const finalDoc = createdDoc || newDoc;
        const currentLocal = getUserStore("documents", []);
        const updated = [finalDoc, ...currentLocal.filter((d) => d.id !== finalDoc.id)];
        setUserStore("documents", updated);
        return finalDoc;
      },

      delete: async (id) => {
        try {
          await fetch(`/api/documents/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
        } catch (err) {
          console.warn("Remote document delete failed:", err);
        }

        const currentLocal = getUserStore("documents", []);
        const remaining = currentLocal.filter((d) => d.id !== id);
        setUserStore("documents", remaining);
        return { ok: true };
      },
    },

    LegalPrecedent: {
      list: async (sortBy = "-updated_date", limit = 500) => {
        const custom = getStore("custom_precedents", []);
        return [...INITIAL_PRECEDENTS, ...custom].slice(0, limit);
      },
    },
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const fakeUrl = URL.createObjectURL(file);
        return { file_url: fakeUrl, file_name: file.name };
      },
    },
  },

  functions: {
    invoke: async (functionName, args = {}) => {
      // 1. analyzeCase
      if (functionName === "analyzeCase") {
        const description = (args.description || "").trim();
        const language = args.language === "ur" ? "ur" : "en";
        const isUrdu = language === "ur";

        let catId = normalizeCategory(description);
        let understanding = null;
        let dynamicQuestions = null;

        // Try backend AI analysis endpoint
        try {
          const res = await fetch("/api/analyze-case", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description, language }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json?.analysis) {
              const a = json.analysis;
              if (a.category) {
                catId = normalizeCategory(a.category);
              }
              const rawIssues = Array.isArray(a.issues) && a.issues.length > 0 ? a.issues : [];
              const cleanIssues = rawIssues.map((iss) => formatIssueSentence(iss, isUrdu));

              understanding = {
                category: catId,
                title: a.title || description.slice(0, 50),
                summary: a.summary || "",
                issues: cleanIssues.length > 0 ? cleanIssues : [
                  isUrdu ? "فوجداری اور تادیبی قوانین کے تحت متعلقہ حقوق کا جائزہ۔" : "Evaluation of statutory protections and actionable remedies under Pakistani law.",
                ],
                extractedFacts: Array.isArray(a.extractedFacts) && a.extractedFacts.length > 0 ? a.extractedFacts : [
                  isUrdu ? "صارف کی جانب سے واقعہ کی بنیادی تفصیلات درج کر لی گئی ہیں۔" : "User provided core factual statements of the grievance.",
                ],
                missingInfo: Array.isArray(a.missingInfo) && a.missingInfo.length > 0 ? a.missingInfo : [],
                entities: a.entities || (isUrdu ? ["سائل (شہری)", "فریق مخالف"] : ["Complainant", "Opposing Party"]),
                confidence: a.confidence || 88,
              };

              if (Array.isArray(json.questions) && json.questions.length > 0) {
                dynamicQuestions = json.questions;
              } else if (Array.isArray(a.questions) && a.questions.length > 0) {
                dynamicQuestions = a.questions;
              }
            }
          }
        } catch (fetchErr) {
          console.warn("Backend /api/analyze-case call failed:", fetchErr);
        }

        // Deterministic fallback if backend did not return
        if (!understanding) {
          const descLower = description.toLowerCase();
          const isTeacherBeating =
            descLower.includes("teacher") ||
            descLower.includes("beat") ||
            descLower.includes("beaten") ||
            descLower.includes("hit") ||
            descLower.includes("corporal") ||
            descLower.includes("punish") ||
            description.includes("استاد") ||
            description.includes("مارا") ||
            description.includes("تشدد") ||
            description.includes("سزا");

          if (isTeacherBeating) {
            catId = "harassment";
            understanding = {
              category: "harassment",
              title: isUrdu ? "استاد کی جانب سے طالب علم پر جسمانی تشدد" : "Corporal Punishment & Assault by Teacher",
              summary: isUrdu
                ? "سکول میں استاد کے ہاتھوں طالب علم پر جسمانی تشدد اور کارپورل پنشمنٹ کا معاملہ تعزیرات پاکستان اور انسدادِ کارپورل پنشمنٹ قوانین کے تحت جانچا جا رہا ہے۔"
                : "Corporal punishment, physical assault, and hurt inflicted by a school teacher under the Prohibition of Corporal Punishment Act 2021 and the Pakistan Penal Code.",
              issues: isUrdu
                ? [
                    "استاد کی جانب سے طالب علم پر تشدد پروہبیشن آف کارپورل پنشمنٹ ایکٹ 2021 کے تحت سختی سے ممنوع اور غیر قانونی ہے۔",
                    "سکول میں جسمانی چوٹ پہنچانا مجموعہ تعزیرات پاکستان (PPC) کی دفعات 337 اور 352 کے تحت قابل دست اندازی پولیس جرم ہے۔",
                    "سکول انتظامیہ اور ضلعی تعلیمی افسر (DEO) مجاز اتھارٹی کے طور پر استاد کے خلاف فوری تادیبی کارروائی کے پابند ہیں۔",
                  ]
                : [
                    "Corporal punishment and physical beating by a teacher is strictly prohibited under the Prohibition of Corporal Punishment Act 2021.",
                    "Physical assault and bodily injury constitute cognizable criminal offences under Sections 337 and 352 of the Pakistan Penal Code.",
                    "The school administration and District Education Officer (DEO) are legally obligated to initiate immediate disciplinary and protective actions.",
                  ],
              extractedFacts: isUrdu
                ? ["طالب علم کو استاد کی جانب سے بلا جواز اور شدید جسمانی تشدد کا نشانہ بنایا گیا۔"]
                : ["The student was subjected to unfair and severe physical beating by a teacher without fault."],
              missingInfo: isUrdu
                ? [
                    "کیا جسمانی تشدد سے چوٹوں کے نشانات موجود ہیں یا ہسپتال کی میڈیکل/ایم ایل سی رپورٹ حاصل کی گئی ہے؟",
                    "کیا واقعے کے وقت ہم جماعت طلبہ، دیگر اساتذہ یا سی سی ٹی وی کیمروں کے شواہد موجود ہیں؟",
                    "کیا سکول پرنسپل، مینجمنٹ یا ڈسٹرکٹ ایجوکیشن آفیسر کو باضابطہ تحریری شکایت دی گئی ہے؟",
                    "کیا متعلقہ تھانے میں درخواست یا چائلڈ پروٹیکشن بیورو ہیلپ لائن (1121) پر اطلاع دی گئی ہے؟",
                  ]
                : [
                    "Are there visible physical injuries, bruises, or an official Medico-Legal Certificate (MLC) from a hospital?",
                    "Were there student classmates, other staff members, or CCTV footage that witnessed the incident?",
                    "Has a formal written complaint been submitted to the school principal or the District Education Officer?",
                    "Was an application submitted to the local police station or Child Protection Bureau helpline (1121)?",
                  ],
              entities: isUrdu ? ["متاثرہ طالب علم", "متعلقہ استاد", "سکول انتظامیہ"] : ["Aggrieved Student", "Teacher", "School Administration"],
              confidence: 90,
            };
          } else if (
            descLower.includes("bully") ||
            descLower.includes("classmate") ||
            descLower.includes("harass") ||
            descLower.includes("threat") ||
            descLower.includes("school") ||
            descLower.includes("college") ||
            descLower.includes("student") ||
            description.includes("بلینگ") ||
            description.includes("ہم جماعت") ||
            description.includes("ہراسگی") ||
            description.includes("دھمکی")
          ) {
            catId = "harassment";
            understanding = {
              category: "harassment",
              title: isUrdu ? "ہم جماعتوں کی جانب سے ہراسگی اور بلینگ" : "Bullying & Harassment by Classmates",
              summary: isUrdu
                ? "ہم جماعتوں کی جانب سے ہراسگی اور بلینگ کا معاملہ انسداد ہراسگی ایکٹ اور تعزیرات پاکستان کے تحت جانچا جا رہا ہے۔"
                : "Bullying and peer harassment by classmates under educational anti-harassment and criminal laws.",
              issues: isUrdu
                ? [
                    "ہم جماعتوں کی ناپسندیدہ کارروائیاں تحفظ برائے انسداد ہراسگی ایکٹ 2010 (تعلیمی اداروں کے لیے 2022 کی ترمیم شدہ) کے تحت ہراسگی کے زمرے میں آتی ہیں۔",
                    "بلینگ میں مجموعہ تعزیرات پاکستان (PPC) کی دفعات 503، 506، یا 509 کے تحت مجرمانہ دھمکیاں اور ہراسانی شامل ہیں۔",
                    "پریوینشن آف الیکٹرانک کرائمز ایکٹ (PECA) 2016 کی دفعہ 20 کے تحت آن لائن یا ڈیجیٹل بلینگ کا تدارک لازم ہے۔",
                  ]
                : [
                    "Classmates' hostile actions constitute statutory harassment under the Protection Against Harassment Act (amended 2022 for educational institutions).",
                    "Intimidation, abusive conduct, or threats constitute actionable offences under Pakistan Penal Code (PPC) Sections 503, 506, and 509.",
                    "Online or messaging-based harassment is punishable under Section 20 of the Prevention of Electronic Crimes Act (PECA) 2016.",
                  ],
              extractedFacts: isUrdu
                ? ["صارف کو ہم جماعتوں کی جانب سے ہراسگی یا بلینگ کا سامنا ہے۔"]
                : ["The user is experiencing hostile bullying and intimidation from classmates."],
              missingInfo: isUrdu
                ? [
                    "کیا بلینگ کے مخصوص افعال کے تحریری یا ڈیجیٹل ثبوت (میسجز، تصاویر، ویڈیوز) موجود ہیں؟",
                    "کیا یہ واقعہ سکول کے احاطے میں پیش آیا یا سوشل میڈیا کے ذریعے آن لائن؟",
                    "کیا سکول پرنسپل، انتظامیہ یا انسداد ہراسگی کمیٹی کو تحریری شکایت دی گئی ہے؟",
                    "کیا ملوث طلبہ نابالغ ہیں یا کالج/یونیورسٹی کے بالغ طلبہ؟",
                  ]
                : [
                    "Are there preserved digital records, screenshots, or recordings documenting the harassment?",
                    "Did the harassment occur inside the educational premises or digitally on social media platforms?",
                    "Has a formal complaint been lodged with the principal or statutory anti-harassment committee?",
                    "Are the individuals involved minor school students or adult university students?",
                  ],
              entities: isUrdu ? ["طالب علم", "ہم جماعت"] : ["Student", "Classmates"],
              confidence: 90,
            };
          } else {
            const cat = CATEGORIES[catId] || CATEGORIES.other;
            understanding = {
              category: catId,
              title: description.slice(0, 50) + (description.length > 50 ? "..." : ""),
              summary: isUrdu
                ? `آپ کا کیس پاکستانی ${cat.urduLabel} کے قوانین کے دائرہ اختیار میں جانچا جا رہا ہے۔`
                : `Your matter is being evaluated under Pakistani ${cat.label} jurisprudence.`,
              issues: isUrdu
                ? [
                    `مسئلہ پاکستانی ${cat.urduLabel} کے قوانین اور متعلقہ ضوابط کے تحت آتا ہے۔`,
                    "متعلقہ عدالتی فورم یا ٹربیونل سے فوری قانونی چارہ جوئی کا استحقاق حاصل ہے۔",
                  ]
                : [
                    `The matter falls within the statutory scope of Pakistani ${cat.label} legislation.`,
                    "Statutory remedies and designated judicial or administrative forums are available to seek relief.",
                  ],
              extractedFacts: isUrdu
                ? ["صارف کی طرف سے بیان کردہ بنیادی مسئلہ درج ہو گیا ہے۔"]
                : ["User stated preliminary factual background."],
              missingInfo: isUrdu
                ? [
                    "کیا اس معاملے سے متعلق کوئی باقاعدہ معاہدہ، رسید یا دستاویزی نوٹس موجود ہے؟",
                    "کیا تنازعے کے گواہان یا متعلقہ تاریخوں کا تحریری ریکارڈ دستیاب ہے؟",
                  ]
                : [
                    "Are relevant written contracts, payment receipts, or official notices available?",
                    "Can you confirm the specific incident dates and availability of corroborating witnesses?",
                  ],
              entities: isUrdu ? ["سائل (شہری)", "فریق مخالف"] : ["Complainant/Citizen", "Opposing Party"],
              confidence: 85,
            };
          }
        }

        // Connect questions directly to missingInfo so questions are truly relevant
        let questions = dynamicQuestions;
        if (!questions || questions.length === 0) {
          if (understanding?.missingInfo?.length > 0) {
            questions = deriveQuestionsFromMissing(understanding.missingInfo, isUrdu, catId);
          } else {
            questions = getQuestionsForCategory(catId, language);
          }
        }

        return { data: { understanding, questions } };
      }

      // 2. assessCase
      if (functionName === "assessCase") {
        const {
          category = "tenancy",
          answers = {},
          questions = [],
          language = "en",
          description = "",
          caseId = null,
          reassessNote = "",
        } = args;
        const normCat = normalizeCategory(category);
        const reasoning = runReasoning(normCat, answers, questions);

        // Precedents retrieval
        const allPrecedents = INITIAL_PRECEDENTS;
        const hits = retrieve(allPrecedents, description + " " + normCat, normCat, 4);

        const isUr = language === "ur";
        const catObj = CATEGORIES[normCat] || CATEGORIES.other;

        let explanationEn = `Based on evaluation under Pakistani ${catObj.label} laws, your position demonstrates a ${reasoning.level.toLowerCase()} (Score: ${reasoning.score}/100). The presence of ${reasoning.supporting.length > 0 ? reasoning.supporting.map((s) => s.label).join(", ") : "applicable statutory grounds"} materially strengthens your claim before the designated court or tribunal.`;
        let explanationUr = `پاکستانی ${catObj.urduLabel} کے قوانین کے تحت جانچ کے مطابق، آپ کے مقدمے کی ابتدائی حیثیت ${reasoning.urduLevel} ہے (اسکور: ${reasoning.score}/100)۔ ${reasoning.supporting.length > 0 ? reasoning.supporting.map((s) => s.urduLabel).join("، ") : "قانونی بنیادیں"} آپ کے مؤقف کو متعلقہ عدالت یا ٹربیونل میں تقویت بخشتی ہیں۔`;
        let nextStepsEn = [
          "Organize and preserve all original documents, agreements, and receipts in chronological order.",
          "Avoid signing any new deeds or compromise papers without prior legal review.",
          "If an adverse action or eviction notice is issued, prepare a formal response within the prescribed statutory time.",
          "Consult an advocate of the High Court or local Bar Association for representation."
        ];
        let nextStepsUr = [
          "تمام اصل دستاویزات، معاہدات اور رسیدوں کو تاریخ وار ترتیب دے کر محفوظ رکھیں۔",
          "قانونی مشورے کے بغیر کسی بھی نئے اقرار نامے یا سمجھوتے پر دستخط نہ کریں۔",
          "اگر فریق مخالف نے کوئی نوٹس دیا ہو تو قانونی مدت کے اندر اس کا تحریری جواب دیں۔",
          "عدالتی چارہ جوئی کے لیے مقامی بار ایسوسی ایشن یا مستند وکیل سے رجوع کریں۔"
        ];
        let whatChanged = reassessNote ? (isUr ? `نئی معلومات کا اثر: ${reassessNote}` : `Updated based on new information: ${reassessNote}`) : null;

        // Try backend AI assessment endpoint for rich statutory context
        try {
          const res = await fetch("/api/assess-case", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category: normCat,
              answers,
              questions,
              language,
              description,
              caseId,
              reassessNote,
            }),
          });
          if (res.ok) {
            const j = await res.json();
            if (j?.assessmentText) {
              if (j.assessmentText.explanation_ur) explanationUr = j.assessmentText.explanation_ur;
              if (j.assessmentText.explanation_en) explanationEn = j.assessmentText.explanation_en;
              if (j.assessmentText.nextSteps_ur?.length) nextStepsUr = j.assessmentText.nextSteps_ur;
              if (j.assessmentText.nextSteps_en?.length) nextStepsEn = j.assessmentText.nextSteps_en;
              if (j.assessmentText.whatChanged) whatChanged = j.assessmentText.whatChanged;
            }
          }
        } catch (fetchErr) {
          console.warn("Backend /api/assess-case call failed:", fetchErr);
        }

        const assessment = {
          ...reasoning,
          explanation_en: explanationEn,
          explanation_ur: explanationUr,
          nextSteps_en: nextStepsEn,
          nextSteps_ur: nextStepsUr,
          whatChanged,
          reassessNote: reassessNote || null,
        };

        const references = hits.map((h) => ({
          id: h.id,
          title: h.title,
          titleUr: h.titleUr || "",
          caseId: h.caseId,
          court: h.court,
          date: h.date,
          category: h.category,
          excerpt: h.excerpt || h.summary,
          summary: h.summary,
          summaryUr: h.summaryUr || "",
          fullText: h.fullText,
          sourceType: h.sourceType,
          citation: h.citation,
          isSample: h.isSample,
          score: h.score,
          matchedTerms: h.matchedTerms,
        }));

        // Persist to user's saved cases
        let savedCaseId = caseId;
        const payload = {
          title: description.slice(0, 60),
          description,
          language,
          category: normCat,
          answers: JSON.stringify(answers),
          assessment: JSON.stringify(assessment),
          references: JSON.stringify(references),
          status: reassessNote ? "reassessed" : "assessed",
          reassessmentNote: reassessNote || "",
        };

        if (caseId) {
          try {
            const updated = await base44.entities.LegalCase.update(caseId, payload);
            if (updated?.id) savedCaseId = updated.id;
          } catch (e) {
            console.warn("assessCase: failed updating case", e);
          }
        } else {
          try {
            const created = await base44.entities.LegalCase.create(payload);
            if (created?.id) savedCaseId = created.id;
          } catch (e) {
            console.warn("assessCase: failed creating case", e);
          }
        }

        return { data: { assessment, references, caseId: savedCaseId } };
      }

      // 3. searchPrecedents
      if (functionName === "searchPrecedents") {
        const query = (args.query || "").trim();
        const category = (args.category || "").trim();
        const limit = args.limit || 12;
        const all = INITIAL_PRECEDENTS;

        let results = [];
        if (query) {
          results = retrieve(all, query, category, limit);
        } else if (category) {
          results = all
            .filter((p) => p.category === category)
            .slice(0, limit)
            .map((r) => ({
              ...r,
              excerpt: r.summary,
              matchedTerms: [],
              score: 10,
            }));
        } else {
          results = all.slice(0, limit).map((r) => ({
            ...r,
            excerpt: r.summary,
            matchedTerms: [],
            score: 5,
          }));
        }

        return { data: { results } };
      }

      // 4. simplifyDocument
      if (functionName === "simplifyDocument") {
        const fileName = args.fileName || "Legal Document";
        const language = args.language === "ur" ? "ur" : "en";
        const fileContent = args.fileContent || "";
        const fileDataUrl = args.fileDataUrl || "";
        const isUr = language === "ur";

        // Call backend /api/analyze-document with document content & language
        try {
          const res = await fetch("/api/analyze-document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName,
              fileContent,
              fileDataUrl,
              language,
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json?.analysis) {
              return { data: { analysis: json.analysis } };
            }
          }
        } catch (fetchErr) {
          console.warn("Backend /api/analyze-document failed, using heuristic:", fetchErr);
        }

        // Context-aware heuristic fallback in plain everyday language (as if sitting beside the user)
        const fLower = (fileName + " " + fileContent).toLowerCase();
        let documentType = isUr ? "قانونی دستاویز" : "Legal Document";
        let simpleExplanation = isUr
          ? `ہم نے یہ کاغذ (${fileName}) آپ کے ساتھ مل کر دیکھا ہے۔ آسان الفاظ میں: اس میں فریقین کے حقوق، ذمہ داریاں اور اصول لکھے ہیں تاکہ ہر کسی کو معلوم ہو کہ کیا کرنا جائز ہے اور کس چیز سے روکا گیا ہے۔`
          : `We looked over this document (${fileName}) with you. In plain words: it explains what was agreed or decided, what rules each person must follow, and what will happen if someone does not keep their word.`;
        let importantPoints = isUr
          ? ["دستاویز میں شامل افراد کے نام، دستخط اور ان کے کیے گئے وعدے درج ہیں۔", "اس میں طے شدہ شرائط اور رقم یا جائیداد سے متعلق اصول لکھے ہیں۔"]
          : ["It lists the people involved and the promises each person made.", "It explains what money, property, or rules everyone agreed to follow."];
        let importantDates = isUr ? ["معاہدے پر دستخط کا دن یا نوٹس کا جواب دینے کی آخری تاریخ"] : ["The date this starts, payment due dates, or the deadline to answer a notice"];
        let termsNeedingAttention = isUr
          ? ["اگر کوئی شخص ان اصولوں پر عمل نہیں کرے گا تو اسے ہرجانہ دینا پڑ سکتا ہے یا قانونی کارروائی کا سامنا ہوگا۔"]
          : ["If someone fails to follow the rules in this paper, they may face the financial penalties or legal consequences mentioned in it."];
        let nextSteps = isUr
          ? ["اس کاغذ کی اصل کاپی محفوظ جگہ پر رکھیں اور ایک صاف تصویر اپنے پاس رکھیں۔", "کوئی بڑا قدم اٹھانے سے پہلے کسی بااعتماد وکیل سے اس کے تمام نکات اچھی طرح سمجھ لیں۔"]
          : ["Keep the original document in a safe place and save a clear photo or copy.", "Talk with a qualified legal advisor to make sure you feel completely comfortable with every detail."];
        let questionsForProfessional = isUr
          ? ["اس دستاویز کے تحت ہمارے حقوق محفوظ رکھنے کے لیے فوری طور پر کیا کرنا ضروری ہے؟"]
          : ["What practical steps should we take right now to make sure our rights are completely protected under this paper?"];

        if (fLower.includes("supreme") || fLower.includes("scmr") || fLower.includes("cpla")) {
          documentType = isUr ? "سپریم کورٹ آف پاکستان کا حتمی فیصلہ" : "Supreme Court of Pakistan Final Decision";
          simpleExplanation = isUr
            ? "یہ سپریم کورٹ آف پاکستان (ملک کی سب سے بڑی عدالت) کا حتمی فیصلہ ہے۔ جج صاحبان نے نچلی عدالت کے فیصلے کا جائزہ لے کر آخری فیصلہ سنایا ہے۔ پاکستان میں سپریم کورٹ کا فیصلہ ملک کی تمام عدالتوں اور تمام شہریوں پر لازمی لاگو ہوتا ہے۔"
            : "This is a final ruling from the Supreme Court of Pakistan—the highest court in the country. In simple terms: the judges reviewed the case and made a final decision that must be followed by every court and person across Pakistan.";
          importantPoints = isUr
            ? ["سپریم کورٹ نے پورے معاملے کا جائزہ لے کر اپنا حتمی اور پکا فیصلہ سنا دیا ہے۔", "اس فیصلے نے اس جیسے تمام دیگر مقدمات کے لیے بھی ایک پکا اصول طے کر دیا ہے۔"]
            : ["The highest court gave its final ruling after carefully reviewing the case.", "This ruling sets the standard rule that all other courts in Pakistan must now follow."];
          importantDates = isUr ? ["وہ تاریخ جس دن سپریم کورٹ کے جج صاحب نے یہ حتمی فیصلہ سنایا"] : ["The date when the judges officially announced this final decision"];
          termsNeedingAttention = isUr
            ? ["اگر کوئی فریق اس فیصلے پر دوبارہ غور کی درخواست (Review) دینا چاہے تو عام طور پر صرف 30 دن کی مہلت ہوتی ہے۔"]
            : ["If anyone wants to ask the judges to take another look at the ruling (a Review), they usually only have 30 days to apply."];
          nextSteps = isUr
            ? ["اپنے وکیل کے ذریعے سپریم کورٹ کے دفتر سے اس فیصلے کی مہر لگی کاپی حاصل کریں۔", "اپنے وکیل سے سمجھیں کہ اس فیصلے پر عمل درآمد کے لیے فوری طور پر کیا کرنا ہے۔"]
            : ["Ask your lawyer to get an official stamped copy of the decision from the court registry.", "Talk to your advocate about what needs to happen to put the judges' decision into practice."];
          questionsForProfessional = isUr
            ? ["کیا یہ فیصلہ بالکل حتمی ہو چکا ہے یا کسی فریق نے اس پر نظر ثانی کی درخواست دی ہے؟"]
            : ["Is this ruling completely final, or has any review request been submitted?"];
        }

        const analysis = {
          documentType,
          simpleExplanation,
          importantPoints,
          importantDates,
          termsNeedingAttention,
          nextSteps,
          questionsForProfessional,
          urduExplanation: isUr ? simpleExplanation : "یہ دستاویز پاکستان کے قانونی فریم ورک کے تحت جانچی گئی ہے۔",
        };

        return { data: { analysis } };
      }

      return { data: {} };
    },
  },
};
