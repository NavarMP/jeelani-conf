export type RulesLanguage = "ml" | "en" | "ar";

export interface BurdaRules {
  heading: string;
  rules: string[];
  helpHeading: string;
  helpText: string;
  or: string;
}

export const RULES_LANGUAGES: { code: RulesLanguage; label: string }[] = [
  { code: "ml", label: "മലയാളം" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

export const BURDA_RULES_DATA: Record<RulesLanguage, BurdaRules> = {
  ml: {
    heading: "നിയമങ്ങളും ചട്ടങ്ങളും",
    rules: [
      "സമസ്തയുടെ ആശയ തത്വങ്ങളും പ്രബോധനങ്ങളും അംഗീകരിക്കുന്ന ടീമുകൾക്ക് പങ്കെടുക്കാം.",
      "മത്സരം രണ്ട് റൗണ്ടുകളിലായി നടത്തും.",
      "ഓൺലൈനായി നടത്തുന്ന ഒന്നാം റൗണ്ടിൽ നിന്ന് തിരഞ്ഞെടുക്കുന്ന ഏഴ് ടീമുകൾ ഗ്രാൻഡ് ഫൈനലിൽ (സെപ്റ്റംബർ 27) മത്സരിക്കും.",
      "രജിസ്‌ട്രേഷൻ ഫീസ് ₹300. Google Pay വഴി 7034585359 നമ്പറിലേക്ക് പേയ്‌മെന്റ് നടത്തിയ ശേഷം, പേയ്‌മെന്റ് സ്‌ക്രീൻഷോട്ടും കുറഞ്ഞത് 6 മിനിറ്റ് ദൈർഘ്യമുള്ള പ്രസന്റേഷൻ വീഡിയോയും 21/09/25 തിങ്കൾ രാത്രി 11:00 ന് മുമ്പ് ടെലിഗ്രാമിലേക്ക് (@adsadars) അയയ്ക്കണം.",
      "ഓരോ ടീമിലും ലീഡർ ഉൾപ്പെടെ 5 മുതൽ 7 വരെ അംഗങ്ങൾ ഉണ്ടായിരിക്കണം. അംഗങ്ങളുടെ എണ്ണം കൂട്ടുകയോ കുറയ്ക്കുകയോ ചെയ്യാൻ കഴിയില്ല.",
      "മത്സര ദൈർഘ്യം 12 മിനിറ്റ്.",
      "ഖസീദത്തുൽ ബുർദയിലെ ബൈത്തുകൾ അനുചിതമല്ലാത്ത മെലഡിയിൽ അവതരിപ്പിക്കണം.",
      "ബുർദയിലെ ആരംഭ ബൈത്തുകളിൽ ചിലതും ദുആയും സ്വലാത്തും ഉൾക്കൊള്ളുന്ന സമാപന ബൈത്തുകളും അവതരണത്തിൽ ഉൾപ്പെടുത്തണം.",
      "ഒരു മിനിറ്റിൽ കൂടാത്ത ആമുഖം അനുവദനീയമാണ്. ആമുഖത്തിന്റെ ഭാഷ നിയന്ത്രിച്ചിട്ടില്ല.",
      "ജവാബ് 'മൗലായ' മാത്രമായിരിക്കണം.",
      "സ്വരത്തിന് പശ്ചാത്തലമായി ചിലങ്ക ഇല്ലാത്ത ദഫ് അല്ലെങ്കിൽ അർബാന ഉപയോഗിക്കാം.",
      "ഒന്നാം, രണ്ടാം, മൂന്നാം സ്ഥാനങ്ങൾ നേടുന്ന ടീമുകൾക്ക് യഥാക്രമം ₹15,001, ₹10,001, ₹7,001 ക്യാഷ് പ്രൈസുകളും ഉപഹാരങ്ങളും ലഭിക്കും.",
      "മികച്ച ഗായകനും മികച്ച താളവാദ്യക്കാരനും പ്രത്യേക ഉപഹാരങ്ങൾ നൽകും.",
      "ജൂറിയുടെയും കമ്മിറ്റിയുടെയും തീരുമാനം അന്തിമമായിരിക്കും."
    ],
    helpHeading: "സഹായം വേണോ അല്ലെങ്കിൽ ചോദ്യങ്ങൾ ഉണ്ടോ?",
    helpText: "കൂടുതൽ വിവരങ്ങൾക്ക്, സംഘാടക സമിതിയുമായി ബന്ധപ്പെടുക",
    or: "അല്ലെങ്കിൽ"
  },
  en: {
    heading: "Rules & Regulations",
    rules: [
      "Participation is open to teams that accept the ideological principles and teachings of Samastha.",
      "The competition will be conducted in two rounds.",
      "Seven teams selected from the first round, which will be conducted online, will compete in the Grand Finale (September 27).",
      "The registration fee is ₹300. After making the payment via Google Pay to 7034585359, participants must send the payment screenshot and a presentation video of at least 6 minutes to Telegram (@adsadars) before 11:00 PM on Monday, 21/09/25.",
      "Each team must consist of 5 to 7 members, including the leader. The number of members cannot be increased or decreased.",
      "The competition duration will be 12 minutes.",
      "The verses of Qasīdat al-Burdah must be presented in a melody that is not indecent/improper.",
      "The presentation must include some of the opening verses of the Burdah, as well as the concluding verses containing du'ā and ṣalāh.",
      "An introduction of no more than one minute is permitted. The language of the introduction is not restricted.",
      "The response (jawāb) must be only \"Mawlaya.\"",
      "For the vocal background, a daf or arbana without jingles (cilanka) may be used.",
      "The teams securing the first, second, and third positions will receive cash prizes of ₹15,001, ₹10,001, and ₹7,001, respectively, along with mementos.",
      "Special mementos will be awarded to the Best Singer and Best Rhythmist.",
      "The decision of the jury and the committee shall be final."
    ],
    helpHeading: "Need help or have questions?",
    helpText: "For further information, please contact the organizing committee at",
    or: "or"
  },
  ar: {
    heading: "القواعد والأنظمة",
    rules: [
      "المشاركة مفتوحة للفرق التي تقبل المبادئ الفكرية وتعاليم سمسته.",
      "ستُجرى المسابقة على جولتين.",
      "سبعة فرق مختارة من الجولة الأولى التي ستُجرى عبر الإنترنت ستتنافس في النهائي الكبير (٢٧ سبتمبر).",
      "رسوم التسجيل ₹٣٠٠. بعد الدفع عبر Google Pay إلى 7034585359، يجب إرسال لقطة شاشة الدفع وفيديو عرض لا يقل عن ٦ دقائق إلى تيليجرام (@adsadars) قبل الساعة ١١:٠٠ مساءً يوم الاثنين ٢١/٠٩/٢٥.",
      "يجب أن يتكون كل فريق من ٥ إلى ٧ أعضاء بما في ذلك القائد. لا يمكن زيادة أو تقليل عدد الأعضاء.",
      "مدة المسابقة ١٢ دقيقة.",
      "يجب تقديم أبيات قصيدة البردة بلحن غير مخل.",
      "يجب أن يتضمن العرض بعض الأبيات الافتتاحية للبردة وكذلك الأبيات الختامية المتضمنة الدعاء والصلاة.",
      "يُسمح بمقدمة لا تزيد عن دقيقة واحدة. لا يوجد قيد على لغة المقدمة.",
      "يجب أن يكون الجواب 'مولاي' فقط.",
      "للخلفية الصوتية، يمكن استخدام الدف أو الأربانة بدون صنجات.",
      "ستحصل الفرق في المراكز الأول والثاني والثالث على جوائز نقدية قدرها ₹١٥,٠٠١ و₹١٠,٠٠١ و₹٧,٠٠١ على التوالي مع تذكارات.",
      "ستُمنح تذكارات خاصة لأفضل مغنٍ وأفضل إيقاعي.",
      "قرار لجنة التحكيم واللجنة نهائي."
    ],
    helpHeading: "هل تحتاج مساعدة أو لديك أسئلة؟",
    helpText: "لمزيد من المعلومات، يرجى التواصل مع اللجنة المنظمة على",
    or: "أو"
  }
};
