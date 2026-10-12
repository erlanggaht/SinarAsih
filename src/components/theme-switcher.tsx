"use client";

import { useTheme } from "next-themes";
import { useEffect, useSyncExternalStore } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { createStringField } from "@/components/forms/custom-fields";
import { ErlangForm } from "@/components/forms/schema-form";

const subscribe = () => () => { };
const themeSchema = z.object({ theme: z.enum(["system", "light", "dark"]) });
const ThemeField = createStringField<z.infer<typeof themeSchema>["theme"]>({ variant: "theme" });

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const themeResult = themeSchema.shape.theme.safeParse(mounted ? theme : "system");
  const selectedTheme = themeResult.success ? themeResult.data : "system";
  const form = useForm({
    defaultValues: { theme: "system" } as z.infer<typeof themeSchema>,
    listeners: {
      onChange: ({ formApi }) => {
        if (mounted && formApi.state.values.theme !== selectedTheme) {
          setTheme(formApi.state.values.theme);
        }
      },
    },
  });

  useEffect(() => {
    if (form.state.values.theme !== selectedTheme) {
      form.reset({ theme: selectedTheme });
    }
  }, [form, selectedTheme]);

  return (
    <ErlangForm<z.infer<typeof themeSchema>>
      form={form}
      schema={themeSchema}
      label="Pengaturan tema"
      disabled={!mounted}
      fieldConfig={{
        theme: {
          label: "Tema",
          component: ThemeField,
          options: [
            { value: "system", label: "Sistem" },
            { value: "light", label: "Terang" },
            { value: "dark", label: "Gelap" },
          ],
        },
      }}
    />
  );
}
