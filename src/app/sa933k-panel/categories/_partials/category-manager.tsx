"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import type { Category } from "@/feat/categories/schema";
import { CategorySearchForm } from "@/components/forms/category-search-form";
import { CategoryForm } from "./category-form";

type StatusFilter = "all" | "active" | "inactive";

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [selected, setSelected] = useState<Category | null>(null);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const editor = useRef<HTMLDivElement>(null);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const activeCount = categories.filter((category) => category.is_active).length;
  const filters: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "Semua", count: categories.length },
    { value: "active", label: "Aktif", count: activeCount },
    { value: "inactive", label: "Nonaktif", count: categories.length - activeCount },
  ];
  const filtered = categories.filter((category) => {
    const matchesQuery = `${category.name} ${category.slug}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return (
      matchesQuery &&
      (status === "all" || (status === "active" ? category.is_active : !category.is_active))
    );
  });

  function openEditor(category: Category | null, trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    setSelected(category);
    setNotice(null);
    setEditing(true);
    requestAnimationFrame(() => editor.current?.querySelector<HTMLInputElement>("input")?.focus());
  }

  function closeEditor() {
    setEditing(false);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }

  return (
    <div className="mt-8">
      {notice && (
        <p
          role="status"
          className="mb-5 border border-success bg-success/10 px-4 py-3 text-sm text-success"
        >
          {notice}
        </p>
      )}
      <section
        hidden={editing}
        aria-labelledby="category-list-title"
        className="border border-border bg-card text-card-foreground"
      >
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2
              ref={listHeading}
              tabIndex={-1}
              id="category-list-title"
              className="text-xl font-semibold outline-none"
            >
              Daftar kategori
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pilih Edit untuk mengubah informasi atau status kategori.
            </p>
          </div>
          <button
            type="button"
            onClick={(event) => openEditor(null, event.currentTarget)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Plus className="size-4" aria-hidden="true" /> Tambah kategori
          </button>
        </div>
        <div className="space-y-4 border-b border-border p-5 sm:p-6">
          <div className="max-w-xl">
            <CategorySearchForm
              onQueryChange={setQuery}
              placeholder="Cari nama atau slug kategori..."
            />
          </div>
          <div role="group" aria-label="Filter status kategori" className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={status === filter.value}
                onClick={() => setStatus(filter.value)}
                className={`inline-flex min-h-11 items-center gap-2 border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${status === filter.value ? "border-primary bg-accent text-accent-foreground" : "border-border hover:bg-muted"}`}
              >
                {filter.label}
                <span className="text-xs tabular-nums">({filter.count})</span>
              </button>
            ))}
          </div>
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            Menampilkan {filtered.length} dari {categories.length} kategori
          </p>
        </div>
        {filtered.length > 0 ? (
          <>
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,1fr)_7rem_6rem] gap-5 border-b border-border bg-muted/50 px-6 py-3 text-xs font-semibold text-muted-foreground md:grid"
            >
              <span>Kategori</span>
              <span>Status</span>
              <span className="text-right">Tindakan</span>
            </div>
            <ul className="divide-y divide-border">
              {filtered.map((category) => (
                <li
                  key={category.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 p-5 md:grid-cols-[minmax(0,1fr)_7rem_6rem] md:items-center md:gap-5 md:px-6"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold wrap-anywhere">{category.name}</h3>
                    <p className="mt-1 text-sm leading-6 wrap-anywhere text-muted-foreground">
                      {category.description || "Belum ada deskripsi."}
                    </p>
                    <p className="mt-2 text-xs wrap-anywhere text-muted-foreground">
                      Slug: {category.slug}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium ${category.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                    >
                      <span className="sr-only">Status: </span>
                      {category.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Edit kategori ${category.name}`}
                    onClick={(event) => openEditor(category, event.currentTarget)}
                    className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 justify-self-start border border-border px-4 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:col-span-1 md:justify-self-end"
                  >
                    <Pencil className="size-4" aria-hidden="true" /> Edit
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="px-6 py-12 text-center">
            <h3 className="font-semibold">
              {categories.length === 0 ? "Belum ada kategori" : "Tidak ada kategori yang cocok"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {categories.length === 0
                ? "Gunakan tombol Tambah kategori untuk membuat kategori pertama."
                : "Coba kata pencarian lain atau pilih filter Semua."}
            </p>
          </div>
        )}
      </section>
      {editing && (
        <div ref={editor} className="mx-auto max-w-2xl">
          <button
            type="button"
            disabled={pending}
            onClick={closeEditor}
            className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke daftar kategori
          </button>
          <CategoryForm
            key={selected?.id ?? "new"}
            category={selected}
            onPendingChange={setPending}
            onCancel={closeEditor}
            onSaved={(saved) => {
              setCategories((current) =>
                [...current.filter((category) => category.id !== saved.id), saved].sort((a, b) =>
                  a.name.localeCompare(b.name, "id"),
                ),
              );
              setNotice(
                selected
                  ? `Kategori “${saved.name}” berhasil diperbarui.`
                  : `Kategori “${saved.name}” berhasil ditambahkan.`,
              );
              setSelected(null);
              setEditing(false);
              requestAnimationFrame(() => listHeading.current?.focus());
            }}
          />
        </div>
      )}
    </div>
  );
}
