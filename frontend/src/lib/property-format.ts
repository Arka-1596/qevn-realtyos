import type { Property } from "@/types/property";

export function formatPrice(
  value: string,
  currency = "INR",
): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatArea(value: string): string {
  const area = Number(value);

  if (!Number.isFinite(area)) {
    return "Area unavailable";
  }

  return `${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(area)} sq. ft.`;
}

export function formatPropertyType(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function propertyLocation(
  property: Property,
): string {
  return [
    property.locality,
    property.city,
    property.state,
  ]
    .filter(Boolean)
    .join(", ");
}

export function isDemoProperty(
  property: Property,
): boolean {
  return (
    property.title.toUpperCase().startsWith("DEMO ") ||
    property.description
      .toLowerCase()
      .includes("fictional demonstration")
  );
}