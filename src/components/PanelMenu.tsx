import Link from "next/link";
import { Boxes, Package, Tags, UserRound, UsersRound } from "lucide-react";
import { PANEL_MENU } from "@/lib/config";

const icons = {
  products: Package,
  categories: Tags,
  stock: Boxes,
  profile: UserRound,
  admins: UsersRound,
};

export function PanelMenu({ canManageAccounts = false }: { canManageAccounts?: boolean }) {
  return (
    <nav aria-labelledby="panel-menu-title" className="mt-10">
      <h2 id="panel-menu-title" className="text-xl font-semibold">
        Kelola toko
      </h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PANEL_MENU.filter((item) => item.id !== "admins" || canManageAccounts).map(
          ({ id, label, description, href }) => {
            const Icon = icons[id];

            return (
              <li key={id}>
                <Link
                  href={href}
                  prefetch={false}
                  className="group flex h-full flex-col border border-border bg-card p-5 text-card-foreground transition-colors hover:border-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Icon className="mb-4 size-6 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">{label}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </Link>
              </li>
            );
          },
        )}
      </ul>
    </nav>
  );
}
