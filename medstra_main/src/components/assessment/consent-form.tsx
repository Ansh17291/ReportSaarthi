import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./LanguageSelector";
import { Language } from "./video/InteractiveAvatar";
import translations from "./translations";

export function ConsentForm({ onNext }: { onNext: (language: Language) => void }) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.English);
  
  const t = translations[selectedLanguage];

  const handleContinue = () => {
    if (isAgreed) {
      onNext(selectedLanguage);
    } else {
      alert("You must agree to the terms to proceed.");
    }
  };

  return (
    <div className="space-y-6">
      <LanguageSelector 
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />
      
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p>{t.description}</p>
      <h3 className="font-semibold">{t.termsTitle}</h3>
      <ul className="list-disc pl-5">
        {t.terms.map((term, index) => (
          <li key={index}>{term}</li>
        ))}
      </ul>
      <h3 className="font-semibold">{t.privacyTitle}</h3>
      <ul className="list-disc pl-5">
        {t.privacyPoints.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="consent"
          checked={isAgreed}
          onChange={(e) => setIsAgreed(e.target.checked)}
          required
        />
        <label htmlFor="consent" className="ml-2">
          {t.agreeText}
        </label>
      </div>
      <Button onClick={handleContinue} className="w-full">
        {t.continueButton}
      </Button>
    </div>
  );
}