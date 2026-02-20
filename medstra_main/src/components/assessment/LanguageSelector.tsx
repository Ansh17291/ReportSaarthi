import {Language} from './video/InteractiveAvatar';

const languages = [
  { code: Language.English, label: 'English', flag: '🇬🇧' },
  { code: Language.Bulgarian, label: 'Български', flag: '🇧🇬' },
  { code: Language.Chinese, label: '中文', flag: '🇨🇳' },
  { code: Language.Czech, label: 'Čeština', flag: '🇨🇿' },
  { code: Language.Danish, label: 'Dansk', flag: '🇩🇰' },
  { code: Language.Dutch, label: 'Nederlands', flag: '🇳🇱' },
  { code: Language.Finnish, label: 'Suomi', flag: '🇫🇮' },
  { code: Language.French, label: 'Français', flag: '🇫🇷' },
  { code: Language.German, label: 'Deutsch', flag: '🇩🇪' },
  { code: Language.Greek, label: 'Ελληνικά', flag: '🇬🇷' },
  { code: Language.Hindi, label: 'हिंदी', flag: '🇮🇳' },
  { code: Language.Hungarian, label: 'Magyar', flag: '🇭🇺' },
  { code: Language.Indonesian, label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: Language.Italian, label: 'Italiano', flag: '🇮🇹' },
  { code: Language.Japanese, label: '日本語', flag: '🇯🇵' },
  { code: Language.Korean, label: '한국어', flag: '🇰🇷' },
  { code: Language.Malay, label: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: Language.Norwegian, label: 'Norsk', flag: '🇳🇴' },
  { code: Language.Polish, label: 'Polski', flag: '🇵🇱' },
  { code: Language.Portuguese, label: 'Português', flag: '🇵🇹' },
  { code: Language.Romanian, label: 'Română', flag: '🇷🇴' },
  { code: Language.Russian, label: 'Русский', flag: '🇷🇺' },
  { code: Language.Slovak, label: 'Slovenčina', flag: '🇸🇰' },
  { code: Language.Spanish, label: 'Español', flag: '🇪🇸' },
  { code: Language.Swedish, label: 'Svenska', flag: '🇸🇪' },
  { code: Language.Turkish, label: 'Türkçe', flag: '🇹🇷' },
  { code: Language.Ukrainian, label: 'Українська', flag: '🇺🇦' },
  { code: Language.Vietnamese, label: 'Tiếng Việt', flag: '🇻🇳' },
];

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
            ${selectedLanguage === lang.code 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
            }`}
        >
          <span className="text-lg">{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
} 