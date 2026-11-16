import Link from "next/link";

type BrandProps = {
  inverted?: boolean;
  href?: string;
};

export function Brand({
  inverted = false,
  href = "/",
}: BrandProps) {
  return (
    <Link
      href={href}
      aria-label="Qevn RealtyOS home"
      className="group inline-flex min-h-11 items-center gap-3 rounded-sm focus-visible:outline-offset-4"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-[0.7rem] bg-brand-lime text-xl font-extrabold tracking-[-0.12em] text-brand-ink"
      >
        Q
        <span className="relative top-[0.05em] text-xs">
          /
        </span>
      </span>

      <span
        className={`flex flex-col leading-none ${
          inverted ? "text-white" : "text-brand-ink"
        }`}
      >
        <span className="text-[15px] font-extrabold tracking-[-0.045em]">
          QEVN
          <span className="font-medium opacity-55">
            {" "}/{" "}
          </span>
          RealtyOS
        </span>

        <span className="mt-1.5 text-[9px] font-bold tracking-[0.18em] opacity-55">
          INTELLIGENT REAL ESTATE
        </span>
      </span>
    </Link>
  );
}