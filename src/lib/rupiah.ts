const formatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export function formatRupiahValue(value: number | undefined | null) {
  return value === undefined || value === null ? "" : formatter.format(value);
}

export function formatRupiahInput(value: string) {
  const raw = value.replace(/[^0-9,]/g, "");
  if (!raw) return "";
  const [whole, fraction] = raw.split(",");
  const digits = (whole || "0").replace(/^0+(?=\d)/, "");
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return grouped + (fraction !== undefined ? `,${fraction.slice(0, 2)}` : "");
}

export function parseRupiahInput(value: string) {
  return value === "" ? undefined : Number(value.replace(/\./g, "").replace(",", "."));
}

export function rupiahCaretPosition(value: string, logicalPosition: number) {
  if (!logicalPosition) return 0;
  let count = 0;
  for (let index = 0; index < value.length; index++) {
    if (/[0-9,]/.test(value[index])) count++;
    if (count === logicalPosition) return index + 1;
  }
  return value.length;
}
