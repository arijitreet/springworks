const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const qty = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const money = (n: number) => inr.format(n);
export const count = (n: number) => qty.format(n);

export const shortDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

export const today = () => new Date().toISOString().slice(0, 10);
