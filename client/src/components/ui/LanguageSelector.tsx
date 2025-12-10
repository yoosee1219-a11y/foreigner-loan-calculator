import { Languages } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES, type LanguageCode } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSelector() {
  const { currentLanguage, setLanguage, getLanguageInfo } = useLanguage();
  const currentLangInfo = getLanguageInfo(currentLanguage);

  return (
    <div className="flex items-center gap-2">
      <Select value={currentLanguage} onValueChange={(value) => setLanguage(value as LanguageCode)}>
        <SelectTrigger className="w-[140px] h-9 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent transition-colors">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <SelectValue>
              {currentLangInfo?.nativeName || 'Select'}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">({lang.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
