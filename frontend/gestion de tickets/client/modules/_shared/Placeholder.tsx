import { useI18n } from "@/i18n";

export default function Placeholder({ titleKey, descKey }: { titleKey?: string; descKey?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-semibold">{t(titleKey ?? "placeholder.title")}</h2>
      <p className="text-muted-foreground mt-2 max-w-xl">{t(descKey ?? "placeholder.desc")}</p>
    </div>
  );
}
