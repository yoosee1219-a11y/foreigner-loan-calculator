import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const [location] = useLocation();
  
  // 홈을 항상 첫 번째에 추가
  const allItems: BreadcrumbItem[] = [
    { label: "홈", href: "/" },
    ...items
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm text-muted-foreground mb-6", className)}
    >
      <ol className="flex items-center gap-2 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isActive = item.href === location || isLast;

          return (
            <li
              key={index}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index === 0 ? (
                <Link href={item.href || "/"}>
                  <a
                    className={cn(
                      "flex items-center gap-1 transition-colors hover:text-primary",
                      isActive && "text-foreground"
                    )}
                    itemProp="item"
                  >
                    <Home className="h-4 w-4" />
                    <span itemProp="name">{item.label}</span>
                  </a>
                </Link>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  {item.href && !isLast ? (
                    <Link href={item.href}>
                      <a
                        className={cn(
                          "transition-colors hover:text-primary",
                          isActive && "text-foreground font-medium"
                        )}
                        itemProp="item"
                      >
                        <span itemProp="name">{item.label}</span>
                      </a>
                    </Link>
                  ) : (
                    <span
                      className={cn(isActive && "text-foreground font-medium")}
                      itemProp="name"
                    >
                      {item.label}
                    </span>
                  )}
                </>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
