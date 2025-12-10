import { TOCItem } from "@/lib/schemaUtils";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  if (items.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // 헤더 높이 고려
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-secondary/50 to-secondary/20 border-2 border-border rounded-xl p-6 mb-8",
        className
      )}
    >
      <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
        <span className="text-2xl">📋</span>
        목차
      </h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className={cn(
              "transition-colors hover:text-primary",
              item.level === 2 && "pl-0 font-semibold",
              item.level === 3 && "pl-4 text-sm",
              item.level === 4 && "pl-8 text-xs text-muted-foreground"
            )}
          >
            <button
              onClick={() => scrollToHeading(item.id)}
              className="text-left w-full hover:underline transition-all"
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

